const ACC_SB_URL = 'https://ysvtrhizgcioyycwlkrk.supabase.co';
const ACC_SB_KEY = 'sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const ACC_SESSION_KEY = 'zemzem_customer_session';

let accSession = null;
let accProfile = null;
let accAddresses = [];
let accOrders = [];
let accEntitlements = [];
let accRecoveryMode = false;

const aq = (s) => document.querySelector(s);
const aqq = (s) => [...document.querySelectorAll(s)];
const aesc = (v) => String(v ?? '').replace(/[&<>'"]/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const amoney = (n) => `${Number(n || 0).toFixed(2)} €`;
const adate = (v) => v ? new Intl.DateTimeFormat('sq-AL', {dateStyle:'medium', timeStyle:'short'}).format(new Date(v)) : '—';
const aday = (v) => v ? new Intl.DateTimeFormat('sq-AL', {dateStyle:'medium'}).format(new Date(v)) : 'Pa afat';
const statusLabels = {pending:'Në pritje',processing:'Në përpunim',paid:'E paguar',confirmed:'E konfirmuar',shipped:'E dërguar',delivered:'E dorëzuar',cancelled:'E anuluar',refunded:'E rimbursuar',failed:'E dështuar'};
const authErrors = {
  'Invalid login credentials':'Emaili ose fjalëkalimi nuk është i saktë.',
  'Email not confirmed':'Emaili nuk është verifikuar ende. Kontrollo mesazhin që të kemi dërguar.',
  'User already registered':'Ky email është regjistruar më parë.',
  'Password should be at least 6 characters':'Fjalëkalimi duhet të ketë së paku 8 karaktere.'
};
const friendlyError = (error) => authErrors[String(error?.message || error)] || String(error?.message || error || 'Ndodhi një gabim. Provo përsëri.');

function setBusy(form, busy, busyText) {
  const btn = form?.querySelector('button[type="submit"]');
  if (!btn) return;
  if (busy) btn.dataset.label = btn.textContent;
  btn.disabled = busy;
  btn.textContent = busy ? busyText : (btn.dataset.label || btn.textContent);
  form?.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function msg(text, error = false) {
  const el = aq('#authMsg');
  if (!el) return;
  el.textContent = text;
  el.className = `account-msg${error ? ' error' : ''}`;
  el.hidden = false;
}

function toast(text, error = false) {
  const el = aq('#accountToast');
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  el.style.background = error ? '#9b3f3a' : '';
  clearTimeout(window.__acct);
  window.__acct = setTimeout(() => {
    el.hidden = true;
    el.style.background = '';
  }, 2800);
}

function storeSession(d) {
  if (!d?.access_token) return;
  accSession = {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (Number(d.expires_in) || 3600),
    user: d.user || null
  };
  localStorage.setItem(ACC_SESSION_KEY, JSON.stringify(accSession));
}

function loadStored() {
  try { accSession = JSON.parse(localStorage.getItem(ACC_SESSION_KEY) || 'null'); }
  catch { accSession = null; }
}

function clearStored() {
  accSession = null;
  localStorage.removeItem(ACC_SESSION_KEY);
}

async function araw(path, {method = 'GET', body, token, headers = {}} = {}) {
  const h = {apikey: ACC_SB_KEY, ...headers};
  if (body !== undefined) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  const r = await fetch(ACC_SB_URL + path, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store'
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) throw new Error(data?.message || data?.msg || data?.error_description || data?.error || `HTTP ${r.status}`);
  return data;
}

async function refreshAcc() {
  if (!accSession?.refresh_token) throw new Error('Sesioni ka skaduar');
  const d = await araw('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: {refresh_token: accSession.refresh_token}
  });
  storeSession(d);
}

async function ensureAcc() {
  if (!accSession) return false;
  if ((accSession.expires_at || 0) - Math.floor(Date.now() / 1000) < 90) {
    try { await refreshAcc(); }
    catch { clearStored(); return false; }
  }
  return true;
}

async function aapi(path, {method = 'GET', body, prefer} = {}) {
  if (!await ensureAcc()) throw new Error('Duhet të hysh në llogari.');
  const headers = {};
  if (prefer) headers.Prefer = prefer;
  return araw('/rest/v1/' + path, {method, body, token: accSession.access_token, headers});
}

async function aedge(name, body = {}) {
  if (!await ensureAcc()) throw new Error('Duhet të hysh në llogari.');
  const r = await fetch(`${ACC_SB_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: ACC_SB_KEY,
      Authorization: `Bearer ${accSession.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  const text = await r.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!r.ok) {
    const code = String(data?.error || data?.message || `HTTP ${r.status}`);
    const labels = {
      DOWNLOAD_LIMIT_REACHED: 'E ke arritur limitin e shkarkimeve.',
      ENTITLEMENT_EXPIRED: 'Qasja për këtë eBook ka skaduar.',
      ENTITLEMENT_INACTIVE: 'Qasja për këtë eBook nuk është aktive.',
      ORDER_NOT_PAID: 'Pagesa e këtij eBook-u nuk është konfirmuar.',
      EBOOK_FILE_NOT_AVAILABLE: 'Skedari i këtij eBook-u nuk është i disponueshëm.',
      DOWNLOAD_TOO_FAST: 'Prit pak sekonda para shkarkimit tjetër.'
    };
    throw new Error(labels[code] || code);
  }
  return data;
}

function parseAuthHash() {
  if (!location.hash.includes('access_token=')) return;
  const p = new URLSearchParams(location.hash.slice(1));
  const access_token = p.get('access_token');
  const refresh_token = p.get('refresh_token');
  const expires_in = Number(p.get('expires_in') || 3600);
  if (access_token) {
    accRecoveryMode = p.get('type') === 'recovery';
    storeSession({access_token, refresh_token, expires_in, user: null});
    history.replaceState({}, '', location.pathname + location.search);
  }
}

function showAuth() {
  aq('#authPanel').hidden = false;
  aq('#accountPanel').hidden = true;
}

function showAccount() {
  aq('#authPanel').hidden = true;
  aq('#accountPanel').hidden = false;
}

async function getUser() {
  const u = await araw('/auth/v1/user', {token: accSession.access_token});
  accSession.user = u;
  localStorage.setItem(ACC_SESSION_KEY, JSON.stringify(accSession));
  return u;
}

async function loadAccount() {
  if (accRecoveryMode) {
    showAuth();
    aq('#loginForm').hidden = true;
    aq('#signupForm').hidden = true;
    aq('#forgotForm').hidden = true;
    aq('#resetPasswordForm').hidden = false;
    aqq('[data-auth-tab]').forEach((x) => x.classList.remove('active'));
    return;
  }
  if (!await ensureAcc()) { showAuth(); return; }
  try {
    const user = await getUser();
    if (!user?.id) throw new Error('Sesioni nuk është valid.');
    showAccount();
    aq('#customerEmail').textContent = user.email || '';
    await Promise.all([loadProfile(), loadOrders(), loadAddresses(), loadWishlist(), loadMyEbooks()]);
    aq('#welcomeTitle').textContent = accProfile?.first_name ? `Përshëndetje, ${accProfile.first_name}` : 'Llogaria ime';
    openRequestedView();
  } catch (e) {
    clearStored();
    showAuth();
    msg(e.message, true);
  }
}

async function loadProfile() {
  const rows = await aapi(`profiles?id=eq.${accSession.user.id}&select=*`);
  accProfile = rows?.[0] || {id: accSession.user.id};
  aq('#profileFirst').value = accProfile.first_name || '';
  aq('#profileLast').value = accProfile.last_name || '';
  aq('#profilePhone').value = accProfile.phone || '';
}

async function loadOrders() {
  accOrders = await aapi(`customer_orders?user_id=eq.${accSession.user.id}&select=*&order=created_at.desc&limit=100`) || [];
  const box = aq('#ordersList');
  if (!accOrders.length) {
    box.innerHTML = '<div class="empty-state">Ende nuk ke porosi të lidhura me këtë llogari.</div>';
    return;
  }
  box.innerHTML = accOrders.map((o) => `
    <article class="order-card">
      <div class="order-card-top">
        <div><strong>${aesc(o.order_number)}</strong><div class="order-meta"><span>${adate(o.created_at)}</span><span>${aesc((o.payment_method || '').toUpperCase())}</span><span>${amoney(o.total)}</span></div></div>
        <span class="status-chip status-${aesc(o.order_status)}">${aesc(statusLabels[o.order_status] || o.order_status || 'Në pritje')}</span>
      </div>
      ${o.tracking_number ? `<div class="order-meta"><strong>Gjurmimi:</strong> ${aesc(o.shipping_carrier || '')} <span class="tracking-number">${aesc(o.tracking_number)}</span></div>` : ''}
      <button class="text-btn" data-order-detail="${o.id}">Shiko artikujt</button>
      <div id="od-${o.id}" hidden></div>
    </article>`).join('');
  aqq('[data-order-detail]').forEach((b) => b.onclick = () => toggleOrderItems(b.dataset.orderDetail));
}

async function toggleOrderItems(id) {
  const box = aq('#od-' + id);
  if (!box) return;
  if (!box.hidden) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = '<p>Duke ngarkuar…</p>';
  try {
    const [items, history] = await Promise.all([
      aapi(`order_items?order_id=eq.${encodeURIComponent(id)}&select=title,sku,quantity,unit_price,line_total&order=created_at.asc`),
      aapi(`order_status_history?order_id=eq.${encodeURIComponent(id)}&select=old_status,new_status,created_at&order=created_at.asc`)
    ]);
    box.innerHTML = `<div class="order-lines">${(items || []).map((i) => `<p><strong>${aesc(i.title)}</strong> — ${i.quantity} × ${amoney(i.unit_price)} = ${amoney(i.line_total)}</p>`).join('')}</div><div class="order-history">${(history || []).map((h) => `<small>${adate(h.created_at)} · ${aesc(h.new_status)}</small>`).join('<br>')}</div>`;
  } catch (e) {
    box.innerHTML = `<p>${aesc(e.message)}</p>`;
  }
}

function entitlementRank(e) {
  const expired = e.access_expires_at && new Date(e.access_expires_at) <= new Date();
  const remaining = Math.max(0, Number(e.max_downloads || 0) - Number(e.downloads_used || 0));
  return (e.is_active && !expired && remaining > 0 ? 1000000 : 0) + remaining * 1000 + new Date(e.created_at || 0).getTime() / 1e13;
}

function dedupeEntitlements(rows) {
  const map = new Map();
  for (const e of rows || []) {
    const key = String(e.ebook_id);
    const old = map.get(key);
    if (!old || entitlementRank(e) > entitlementRank(old)) map.set(key, e);
  }
  return [...map.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function loadMyEbooks() {
  const root = aq('#myEbooksList');
  if (!root || !accSession?.user?.id) return;
  try {
    const rows = await aapi(`ebook_entitlements?user_id=eq.${encodeURIComponent(accSession.user.id)}&select=id,ebook_id,ebook_order_id,max_downloads,downloads_used,access_expires_at,is_active,created_at&order=created_at.desc`) || [];
    accEntitlements = dedupeEntitlements(rows);
    if (!accEntitlements.length) {
      root.innerHTML = '<div class="empty-state"><strong>Ende nuk ke eBook të blerë.</strong><br><a href="ebooks.html">Shfleto katalogun eBook →</a></div>';
      return;
    }
    const ids = [...new Set(accEntitlements.map((e) => String(e.ebook_id)))];
    let books = [];
    try {
      books = await aapi(`ebooks?id=in.(${ids.join(',')})&select=id,title,author_name,cover_url,status`);
    } catch {}
    if (!books?.length) {
      try {
        books = await araw(`/rest/v1/storefront_ebooks?id=in.(${ids.join(',')})&select=id,title,author_name,cover_url,status`, {headers:{apikey:ACC_SB_KEY}});
      } catch { books = []; }
    }
    const map = new Map((books || []).map((b) => [String(b.id), b]));
    root.innerHTML = accEntitlements.map((e) => {
      const b = map.get(String(e.ebook_id)) || {};
      const used = Number(e.downloads_used || 0);
      const max = Number(e.max_downloads || 0);
      const remaining = Math.max(0, max - used);
      const expired = e.access_expires_at && new Date(e.access_expires_at) <= new Date();
      const disabled = !e.is_active || expired || remaining <= 0;
      let label = 'Shkarko';
      if (!e.is_active) label = 'Qasja joaktive';
      else if (expired) label = 'Qasja skadoi';
      else if (remaining <= 0) label = 'Limiti u arrit';
      return `<article class="wish-card ebook-owned-card" style="align-items:center;margin-bottom:12px"><div class="wish-main">${b.cover_url ? `<img class="book-thumb" src="${aesc(b.cover_url)}" alt="${aesc(b.title || 'eBook')}">` : '<div class="book-thumb" style="display:grid;place-items:center;font-size:11px">eBook</div>'}<div><strong>${aesc(b.title || 'eBook')}</strong><div>${aesc(b.author_name || 'ZemZem')}</div><div style="margin-top:6px;font-size:12px;color:#758189">⬇ ${remaining} nga ${max} shkarkime kanë mbetur · ${e.access_expires_at ? `Qasje deri ${aday(e.access_expires_at)}` : 'Pa afat skadimi'}</div></div></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><a class="btn btn-light compact" href="ebook.html?id=${encodeURIComponent(e.ebook_id)}">Detajet</a><button class="btn btn-primary compact" data-ebook-download="${e.id}" ${disabled ? 'disabled' : ''}>${label}</button></div></article>`;
    }).join('');
    aqq('[data-ebook-download]').forEach((btn) => btn.onclick = () => downloadOwnedEbook(btn.dataset.ebookDownload, btn));
  } catch (err) {
    root.innerHTML = `<div class="empty-state">${aesc(err.message || 'Biblioteka eBook nuk mund të ngarkohet.')}</div>`;
  }
}

async function downloadOwnedEbook(entitlementId, button) {
  const old = button?.textContent;
  if (button) { button.disabled = true; button.textContent = 'Duke përgatitur…'; }
  try {
    const d = await aedge('ebook-download', {entitlement_id: entitlementId});
    if (!d?.url) throw new Error('Linku i shkarkimit nuk u krijua.');
    const a = document.createElement('a');
    a.href = d.url;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast(`Download gati · ${Number(d.remaining_downloads || 0)} shkarkime kanë mbetur`);
    setTimeout(loadMyEbooks, 700);
  } catch (err) {
    toast(err.message || 'Shkarkimi dështoi.', true);
    if (button) { button.disabled = false; button.textContent = old || 'Shkarko'; }
  }
}

async function loadAddresses() {
  accAddresses = await aapi(`addresses?user_id=eq.${accSession.user.id}&select=*&order=is_default.desc,created_at.asc`) || [];
  renderAddresses();
}

function renderAddresses() {
  const box = aq('#addressList');
  box.innerHTML = accAddresses.length ? accAddresses.map((a) => `<article class="address-card"><div class="address-card-top"><div><strong>${aesc(a.label || 'Adresa')}</strong>${a.is_default ? ' <span class="status-chip">Kryesore</span>' : ''}<p>${aesc(a.first_name)} ${aesc(a.last_name)}<br>${aesc(a.address_line1)}${a.address_line2 ? '<br>' + aesc(a.address_line2) : ''}<br>${aesc(a.postal_code || '')} ${aesc(a.city)}, ${aesc(a.country_code)}<br>${aesc(a.phone)}</p></div></div><div class="address-actions"><button class="text-btn" data-edit-address="${a.id}">Edito</button><button class="text-btn" data-delete-address="${a.id}">Fshi</button></div></article>`).join('') : '<div class="empty-state">Nuk ke ruajtur ende adresë.</div>';
  aqq('[data-edit-address]').forEach((b) => b.onclick = () => editAddress(b.dataset.editAddress));
  aqq('[data-delete-address]').forEach((b) => b.onclick = () => deleteAddress(b.dataset.deleteAddress));
}

function openAddressForm() {
  aq('#addressForm').hidden = false;
  aq('#addressForm').scrollIntoView({behavior:'smooth', block:'center'});
}

function resetAddress() {
  aq('#addressForm').reset();
  aq('#addressId').value = '';
  aq('#addrCountry').value = 'KS';
  aq('#addrFirst').value = accProfile?.first_name || '';
  aq('#addrLast').value = accProfile?.last_name || '';
  aq('#addrPhone').value = accProfile?.phone || '';
}

function editAddress(id) {
  const a = accAddresses.find((x) => x.id === id);
  if (!a) return;
  aq('#addressId').value = a.id;
  aq('#addrFirst').value = a.first_name;
  aq('#addrLast').value = a.last_name;
  aq('#addrLine1').value = a.address_line1;
  aq('#addrLine2').value = a.address_line2 || '';
  aq('#addrCity').value = a.city;
  aq('#addrPostal').value = a.postal_code || '';
  aq('#addrCountry').value = a.country_code;
  aq('#addrPhone').value = a.phone;
  aq('#addrDefault').checked = !!a.is_default;
  openAddressForm();
}

async function deleteAddress(id) {
  if (!confirm('Ta fshij këtë adresë?')) return;
  try {
    await aapi(`addresses?id=eq.${id}`, {method:'DELETE'});
    await loadAddresses();
    toast('Adresa u fshi');
  } catch (e) { toast(e.message, true); }
}

async function loadWishlist() {
  const rows = await aapi(`wishlist_items?user_id=eq.${accSession.user.id}&select=book_id,created_at&order=created_at.desc`) || [];
  const cat = await araw('/rest/v1/storefront_books?select=id,title,author_name,price,cover_url', {headers:{apikey:ACC_SB_KEY}});
  const map = new Map((cat || []).map((b) => [String(b.id), b]));
  const box = aq('#wishlistList');
  box.innerHTML = rows.length ? rows.map((w) => {
    const b = map.get(String(w.book_id));
    return b ? `<article class="wish-card"><div class="wish-main">${b.cover_url ? `<img class="book-thumb" src="${aesc(b.cover_url)}" alt="">` : '<div class="book-thumb"></div>'}<div><strong>${aesc(b.title)}</strong><div>${aesc(b.author_name || '')} · ${amoney(b.price)}</div></div></div><div><a class="btn btn-light compact" href="product.html?id=${encodeURIComponent(w.book_id)}">Hap</a> <button class="text-btn" data-remove-wish="${w.book_id}">Hiq</button></div></article>` : '';
  }).join('') : '<div class="empty-state">Wishlist-i është bosh.</div>';
  aqq('[data-remove-wish]').forEach((b) => b.onclick = async () => {
    await aapi(`wishlist_items?user_id=eq.${accSession.user.id}&book_id=eq.${b.dataset.removeWish}`, {method:'DELETE'});
    await loadWishlist();
  });
}

function activateView(name) {
  const btn = aq(`[data-account-view="${name}"]`);
  if (!btn) return;
  aqq('[data-account-view]').forEach((x) => x.classList.toggle('active', x === btn));
  aqq('.account-view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  if (name === 'ebooks' && accSession?.user?.id) loadMyEbooks();
}

function openRequestedView() {
  const v = new URLSearchParams(location.search).get('view');
  if (['orders','ebooks','profile','addresses','wishlist'].includes(v)) activateView(v);
}

function bindViews() {
  aqq('[data-account-view]').forEach((b) => b.onclick = () => activateView(b.dataset.accountView));
}

function bindAuthTabs() {
  aqq('[data-auth-tab]').forEach((b) => b.onclick = () => {
    aqq('[data-auth-tab]').forEach((x) => x.classList.toggle('active', x === b));
    aq('#loginForm').hidden = b.dataset.authTab !== 'login';
    aq('#signupForm').hidden = b.dataset.authTab !== 'signup';
    aq('#forgotForm').hidden = true;
    aq('#resetPasswordForm').hidden = true;
    aq('#authMsg').hidden = true;
  });
}

function bindAuthHelpers() {
  aqq('.password-toggle').forEach((button) => button.addEventListener('click', () => {
    const input = button.parentElement?.querySelector('input');
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Fshih' : 'Shfaq';
    button.setAttribute('aria-label', show ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin');
  }));
  aq('[data-forgot-password]')?.addEventListener('click', () => {
    aq('#loginForm').hidden = true;
    aq('#signupForm').hidden = true;
    aq('#forgotForm').hidden = false;
    aq('#authMsg').hidden = true;
    aqq('[data-auth-tab]').forEach((x) => x.classList.remove('active'));
    const loginEmail = aq('#loginForm input[name="email"]')?.value || '';
    aq('#forgotForm input[name="email"]').value = loginEmail;
    aq('#forgotForm input[name="email"]').focus();
  });
  aq('[data-back-login]')?.addEventListener('click', () => aq('[data-auth-tab="login"]')?.click());
}

function bindForms() {
  aq('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(e.currentTarget);
    setBusy(form, true, 'Duke hyrë…');
    try {
      const d = await araw('/auth/v1/token?grant_type=password', {
        method:'POST',
        body:{email:String(f.get('email')).trim(), password:String(f.get('password'))}
      });
      storeSession(d);
      await loadAccount();
    } catch (err) { msg(friendlyError(err), true); }
    finally { setBusy(form, false); }
  });

  aq('#signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email')).trim();
    const password = String(f.get('password'));
    const form = e.currentTarget;
    setBusy(form, true, 'Duke krijuar…');
    try {
      const d = await araw('/auth/v1/signup?redirect_to=' + encodeURIComponent('https://www.zemzem.al/account.html'), {
        method:'POST',
        body:{email, password, data:{first_name:String(f.get('first_name')).trim(), last_name:String(f.get('last_name')).trim(), phone:String(f.get('phone')).trim(), app:'zemzem-customer'}}
      });
      if (d?.access_token) { storeSession(d); await loadAccount(); }
      else msg('Llogaria u krijua. Kontrollo emailin dhe kliko linkun e verifikimit; pastaj do të kthehesh te ZemZem.');
    } catch (err) { msg(friendlyError(err), true); }
    finally { setBusy(form, false); }
  });

  aq('#forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get('email') || '').trim();
    setBusy(form, true, 'Duke dërguar…');
    try {
      await araw('/auth/v1/recover?redirect_to=' + encodeURIComponent('https://www.zemzem.al/account.html'), {method:'POST', body:{email}});
      msg('Nëse ky email është i regjistruar, udhëzimet për rivendosjen e fjalëkalimit janë dërguar.');
    } catch (err) { msg(friendlyError(err), true); }
    finally { setBusy(form, false); }
  });

  aq('#resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = new FormData(form);
    const password = String(fields.get('password') || '');
    const confirmation = String(fields.get('password_confirm') || '');
    if (password !== confirmation) return msg('Fjalëkalimet nuk përputhen.', true);
    setBusy(form, true, 'Duke ruajtur…');
    try {
      await araw('/auth/v1/user', {method:'PUT', body:{password}, token:accSession?.access_token});
      accRecoveryMode = false;
      msg('Fjalëkalimi u ndryshua me sukses. Po hapim llogarinë tënde…');
      setTimeout(loadAccount, 700);
    } catch (err) { msg(friendlyError(err), true); }
    finally { setBusy(form, false); }
  });

  aq('#logoutBtn').onclick = async () => {
    try { await araw('/auth/v1/logout', {method:'POST', token:accSession?.access_token}); } catch {}
    clearStored();
    showAuth();
  };

  aq('#profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = {
        id: accSession.user.id,
        first_name: aq('#profileFirst').value.trim() || null,
        last_name: aq('#profileLast').value.trim() || null,
        phone: aq('#profilePhone').value.trim() || null,
        updated_at: new Date().toISOString()
      };
      await aapi(`profiles?id=eq.${accSession.user.id}`, {method:'PATCH', body, prefer:'return=minimal'});
      await loadProfile();
      toast('Profili u ruajt');
    } catch (err) { toast(err.message, true); }
  });

  aq('#newAddressBtn').onclick = () => { resetAddress(); openAddressForm(); };
  aq('#cancelAddress').onclick = () => { aq('#addressForm').hidden = true; };

  aq('#addressForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = aq('#addressId').value;
    const body = {
      user_id: accSession.user.id,
      first_name: aq('#addrFirst').value.trim(),
      last_name: aq('#addrLast').value.trim(),
      address_line1: aq('#addrLine1').value.trim(),
      address_line2: aq('#addrLine2').value.trim() || null,
      city: aq('#addrCity').value.trim(),
      postal_code: aq('#addrPostal').value.trim() || null,
      country_code: aq('#addrCountry').value,
      phone: aq('#addrPhone').value.trim(),
      is_default: aq('#addrDefault').checked,
      updated_at: new Date().toISOString()
    };
    try {
      if (body.is_default && accAddresses.length) {
        await aapi(`addresses?user_id=eq.${accSession.user.id}`, {method:'PATCH', body:{is_default:false, updated_at:new Date().toISOString()}, prefer:'return=minimal'});
      }
      if (id) await aapi(`addresses?id=eq.${id}`, {method:'PATCH', body, prefer:'return=minimal'});
      else await aapi('addresses', {method:'POST', body, prefer:'return=minimal'});
      aq('#addressForm').hidden = true;
      await loadAddresses();
      toast('Adresa u ruajt');
    } catch (err) { toast(err.message, true); }
  });

  aq('#refreshOrders').onclick = loadOrders;
}

async function initAccount() {
  parseAuthHash();
  loadStored();
  bindViews();
  bindAuthTabs();
  bindAuthHelpers();
  bindForms();
  await loadAccount();
}

document.addEventListener('DOMContentLoaded', initAccount);
window.loadMyEbooks = loadMyEbooks;
if(!document.querySelector('script[data-account-advanced]')){const s=document.createElement('script');s.src='assets/js/account-advanced.js?v=1';s.dataset.accountAdvanced='1';document.body.appendChild(s)}
