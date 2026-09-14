const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const ADMIN_EMAIL='tamarillot@gmail.com';
const SESSION_KEY='zemzem_admin_session';

let session=null;
let orders=[];
let books=[];
let authors=[];
let categories=[];
let publishers=[];
let activeOrder=null;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const money=n=>Number(n||0).toFixed(2)+' €';
const fmtDate=v=>v?new Intl.DateTimeFormat('sq-AL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';
const slugify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function toast(msg,type='ok'){
  const el=$('#toast');
  el.textContent=msg;
  el.className='admin-toast'+(type==='error'?' error':'');
  el.hidden=false;
  clearTimeout(window.__adminToast);
  window.__adminToast=setTimeout(()=>el.hidden=true,2600);
}
function authMessage(msg,type='ok'){
  const el=$('#authMessage');
  el.textContent=msg;
  el.className='auth-message'+(type==='error'?' error':'');
  el.hidden=false;
}
function setBusy(btn,busy,label){if(!btn)return;btn.disabled=busy;if(label)btn.dataset.original=btn.textContent;btn.textContent=busy?'Duke punuar…':(btn.dataset.original||btn.textContent)}

function saveSession(data){
  if(!data?.access_token)return;
  session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number(data.expires_in)||3600),user:data.user||null};
  sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
}
function clearSession(){session=null;sessionStorage.removeItem(SESSION_KEY)}
function loadSession(){try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}

async function raw(path,{method='GET',body,token,headers={}}={}){
  const h={apikey:SB_KEY,...headers};
  if(body!==undefined)h['Content-Type']='application/json';
  if(token)h.Authorization=`Bearer ${token}`;
  const res=await fetch(`${SB_URL}${path}`,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  let data=null;
  const text=await res.text();
  if(text){try{data=JSON.parse(text)}catch{data=text}}
  if(!res.ok){const msg=data?.msg||data?.message||data?.error_description||data?.error||`HTTP ${res.status}`;throw new Error(msg)}
  return data;
}
async function refreshSession(){
  if(!session?.refresh_token)throw new Error('Sesioni ka skaduar');
  const data=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});
  saveSession(data);
  return session;
}
async function ensureSession(){
  if(!session)return false;
  if((session.expires_at||0)-Math.floor(Date.now()/1000)<90){try{await refreshSession()}catch{clearSession();return false}}
  return true;
}
async function api(path,{method='GET',body,prefer}={}){
  if(!await ensureSession())throw new Error('Sesioni ka skaduar');
  const headers={};
  if(prefer)headers.Prefer=prefer;
  return raw('/rest/v1/'+path,{method,body,token:session.access_token,headers});
}

async function login(email,password){
  return raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
}
async function signup(email,password){
  return raw('/auth/v1/signup',{method:'POST',body:{email,password,data:{app:'zemzem-admin'}}});
}
async function logout(){
  try{if(session?.access_token)await raw('/auth/v1/logout',{method:'POST',token:session.access_token})}catch{}
  clearSession();showAuth();
}

async function verifyAdmin(){
  const rows=await api('admin_me?select=is_admin&limit=1');
  return Array.isArray(rows)&&rows[0]?.is_admin===true;
}
function showAuth(){
  $('#authScreen').hidden=false;
  $('#adminApp').hidden=true;
}
function showApp(){
  $('#authScreen').hidden=true;
  $('#adminApp').hidden=false;
}

async function enterAdmin(){
  try{
    if(!await verifyAdmin())throw new Error('Kjo llogari nuk ka të drejta administratori.');
    showApp();
    await loadAll();
  }catch(e){
    clearSession();showAuth();authMessage(e.message||'Qasja u refuzua.','error');
  }
}

function statusPill(status){return `<span class="status-pill status-${esc(status)}">${esc(status)}</span>`}
function paymentLabel(o){return `${o.payment_method?.toUpperCase()||'—'} · ${o.payment_status||'pending'}`}

async function loadAll(){
  await Promise.all([loadOrders(),loadBooks(),loadRefs()]);
  renderDashboard();renderOrders();renderBooks();
}
async function loadOrders(){orders=await api('orders?select=*&order=created_at.desc&limit=300')||[]}
async function loadBooks(){books=await api('books?select=*&order=created_at.desc&limit=500')||[]}
async function loadRefs(){
  const [a,c,p]=await Promise.all([
    api('authors?select=id,name,is_active&order=name.asc'),
    api('categories?select=id,name,is_active&order=sort_order.asc,name.asc'),
    api('publishers?select=id,name,is_active&order=name.asc')
  ]);
  authors=a||[];categories=c||[];publishers=p||[];
  fillRefSelects();
}
function fillRefSelects(){
  const fill=(sel,items)=>{const el=$(sel);if(!el)return;el.innerHTML='<option value="">—</option>'+items.map(x=>`<option value="${x.id}">${esc(x.name)}${x.is_active===false?' (inactive)':''}</option>`).join('')};
  fill('#bookAuthor',authors);fill('#bookCategory',categories);fill('#bookPublisher',publishers);
}

function renderDashboard(){
  const pending=orders.filter(o=>['pending','confirmed'].includes(o.order_status));
  const revenue=orders.filter(o=>o.order_status!=='cancelled').reduce((s,o)=>s+Number(o.total||0),0);
  const low=books.filter(b=>b.track_stock!==false&&Number(b.stock_quantity)<=Number(b.low_stock_threshold||5));
  $('#statOrders').textContent=orders.length;
  $('#statPending').textContent=pending.length;
  $('#statRevenue').textContent=money(revenue);
  $('#statLowStock').textContent=low.length;
  $('#pendingBadge').textContent=pending.length;
  $('#recentOrders').innerHTML=orders.slice(0,6).map(o=>`<div class="mini-order"><div><strong>${esc(o.order_number)}</strong><span>${esc(o.first_name)} ${esc(o.last_name)} · ${statusPill(o.order_status)}</span></div><div class="money">${money(o.total)}</div></div>`).join('')||'<div class="empty-state">Ende nuk ka porosi.</div>';
  $('#stockAlerts').innerHTML=low.slice(0,7).map(b=>`<div class="stock-row"><div><strong>${esc(b.title)}</strong><span>${esc(b.sku)}</span></div><div class="stock-low">${b.stock_quantity} copë</div></div>`).join('')||'<div class="empty-state">Stoku është në rregull.</div>';
}

function filteredOrders(){
  const q=($('#orderSearch')?.value||'').trim().toLowerCase();
  const st=$('#orderStatusFilter')?.value||'';
  return orders.filter(o=>(!st||o.order_status===st)&&(!q||`${o.order_number} ${o.first_name} ${o.last_name} ${o.guest_email||''} ${o.phone}`.toLowerCase().includes(q)));
}
function renderOrders(){
  const rows=filteredOrders();
  $('#ordersBody').innerHTML=rows.map(o=>`<tr>
    <td><div class="cell-main">${esc(o.order_number)}</div><div class="cell-sub">${esc(o.payment_method?.toUpperCase())}</div></td>
    <td><div class="cell-main">${esc(o.first_name)} ${esc(o.last_name)}</div><div class="cell-sub">${esc(o.guest_email||'—')} · ${esc(o.phone)}</div></td>
    <td>${esc(o.country_code)}</td>
    <td><div class="cell-main">${esc(paymentLabel(o))}</div></td>
    <td class="money">${money(o.total)}</td>
    <td>${statusPill(o.order_status)}</td>
    <td>${fmtDate(o.created_at)}</td>
    <td><button class="table-action" data-order-id="${o.id}">Hap</button></td>
  </tr>`).join('');
  $('#ordersEmpty').hidden=rows.length>0;
  $$('[data-order-id]').forEach(b=>b.onclick=()=>openOrder(b.dataset.orderId));
}

async function openOrder(id){
  const o=orders.find(x=>x.id===id);if(!o)return;
  activeOrder=o;
  $('#orderDrawer').hidden=false;
  $('#orderDetail').innerHTML='<div class="empty-state">Duke ngarkuar…</div>';
  try{
    const items=await api(`order_items?select=*&order_id=eq.${encodeURIComponent(id)}&order=created_at.asc`);
    $('#orderDetail').innerHTML=`
      <div class="detail-head"><div class="eyebrow">POROSIA</div><h2>${esc(o.order_number)}</h2><div>${statusPill(o.order_status)}</div></div>
      <div class="detail-grid">
        <div class="detail-box"><span>Klienti</span><strong>${esc(o.first_name)} ${esc(o.last_name)}</strong><div class="cell-sub">${esc(o.guest_email||'—')}<br>${esc(o.phone)}</div></div>
        <div class="detail-box"><span>Adresa</span><strong>${esc(o.address_line1)}</strong><div class="cell-sub">${esc(o.postal_code||'')} ${esc(o.city)}, ${esc(o.country_code)}</div></div>
        <div class="detail-box"><span>Pagesa</span><strong>${esc(o.payment_method?.toUpperCase())}</strong><div class="cell-sub">${esc(o.payment_status)}</div></div>
        <div class="detail-box"><span>Totali</span><strong>${money(o.total)}</strong><div class="cell-sub">Librat ${money(o.subtotal)} · Transport ${money(o.shipping_amount)} · COD ${money(o.cod_fee)}</div></div>
      </div>
      <div class="detail-section"><h3>Artikujt</h3>${(items||[]).map(i=>`<div class="order-line"><span><strong>${esc(i.title)}</strong><br><small>${esc(i.sku)}</small></span><span>${i.quantity} × ${money(i.unit_price)}</span><strong>${money(i.line_total)}</strong></div>`).join('')||'<p class="muted">Pa artikuj.</p>'}</div>
      <div class="detail-section"><h3>Menaxhimi</h3><div class="order-controls">
        <label>Statusi<select id="detailOrderStatus">${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.order_status===s?'selected':''}>${s}</option>`).join('')}</select></label>
        <label>Pagesa<select id="detailPaymentStatus">${['pending','paid','failed','refunded','partially_refunded'].map(s=>`<option value="${s}" ${o.payment_status===s?'selected':''}>${s}</option>`).join('')}</select></label>
        <textarea id="detailNotes" rows="4" placeholder="Shënim intern...">${esc(o.notes||'')}</textarea>
        <button class="primary-btn" id="saveOrderBtn">Ruaj ndryshimet</button>
      </div></div>`;
    $('#saveOrderBtn').onclick=saveOrderChanges;
  }catch(e){$('#orderDetail').innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}
async function saveOrderChanges(){
  if(!activeOrder)return;
  const btn=$('#saveOrderBtn');setBusy(btn,true,'Ruaj ndryshimet');
  try{
    const body={order_status:$('#detailOrderStatus').value,payment_status:$('#detailPaymentStatus').value,notes:$('#detailNotes').value||null,updated_at:new Date().toISOString()};
    const data=await api(`orders?id=eq.${encodeURIComponent(activeOrder.id)}`,{method:'PATCH',body,prefer:'return=representation'});
    if(data?.[0]){Object.assign(activeOrder,data[0]);}
    toast('Porosia u përditësua');
    renderDashboard();renderOrders();
    $('#orderDrawer').hidden=true;
  }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
}

function filteredBooks(){
  const q=($('#bookSearch')?.value||'').trim().toLowerCase();
  const st=$('#bookStatusFilter')?.value||'';
  return books.filter(b=>(!st||b.status===st)&&(!q||`${b.title} ${b.sku} ${b.isbn||''}`.toLowerCase().includes(q)));
}
function renderBooks(){
  const rows=filteredBooks();
  $('#booksBody').innerHTML=rows.map(b=>`<tr>
    <td><div class="cell-main">${esc(b.title)}</div><div class="cell-sub">${esc(b.language)} · ${esc(b.format)}</div></td>
    <td>${esc(b.sku)}</td>
    <td class="money">${money(b.price)}${b.compare_at_price?`<div class="cell-sub"><s>${money(b.compare_at_price)}</s></div>`:''}</td>
    <td class="${b.track_stock!==false&&Number(b.stock_quantity)<=Number(b.low_stock_threshold||5)?'stock-low':''}">${b.stock_quantity}</td>
    <td>${statusPill(b.status)}</td>
    <td>${b.is_featured?'✓':'—'}</td>
    <td><button class="table-action" data-book-id="${b.id}">Edito</button></td>
  </tr>`).join('');
  $('#booksEmpty').hidden=rows.length>0;
  $$('[data-book-id]').forEach(b=>b.onclick=()=>openBook(b.dataset.bookId));
}
function resetBookForm(){
  $('#bookForm').reset();$('#bookId').value='';$('#bookLanguage').value='sq';$('#bookStatus').value='draft';$('#bookFormat').value='physical';$('#bookStock').value='0';$('#bookLowStock').value='5';$('#bookTrackStock').checked=true;$('#bookModalTitle').textContent='Libër i ri';
}
function openBook(id){
  resetBookForm();
  const b=books.find(x=>x.id===id);
  if(b){
    $('#bookModalTitle').textContent='Edito librin';$('#bookId').value=b.id;$('#bookTitle').value=b.title||'';$('#bookSku').value=b.sku||'';$('#bookSlug').value=b.slug||'';$('#bookPrice').value=b.price??'';$('#bookOldPrice').value=b.compare_at_price??'';$('#bookStock').value=b.stock_quantity??0;$('#bookLowStock').value=b.low_stock_threshold??5;$('#bookStatus').value=b.status||'draft';$('#bookFormat').value=b.format||'physical';$('#bookLanguage').value=b.language||'sq';$('#bookPages').value=b.pages??'';$('#bookAuthor').value=b.author_id||'';$('#bookCategory').value=b.category_id||'';$('#bookPublisher').value=b.publisher_id||'';$('#bookIsbn').value=b.isbn||'';$('#bookShort').value=b.short_description||'';$('#bookDescription').value=b.description||'';$('#bookFeatured').checked=!!b.is_featured;$('#bookBestseller').checked=!!b.is_bestseller;$('#bookPreorder').checked=!!b.is_preorder;$('#bookTrackStock').checked=b.track_stock!==false;
  }
  $('#bookModal').hidden=false;
}
async function saveBook(e){
  e.preventDefault();
  const btn=$('#saveBookBtn');setBusy(btn,true,'Ruaj librin');
  try{
    const id=$('#bookId').value;
    const price=Number($('#bookPrice').value);
    const old=$('#bookOldPrice').value===''?null:Number($('#bookOldPrice').value);
    if(old!==null&&old<price)throw new Error('Çmimi i vjetër duhet të jetë i barabartë ose më i lartë se çmimi aktual.');
    const body={
      title:$('#bookTitle').value.trim(),sku:$('#bookSku').value.trim(),slug:$('#bookSlug').value.trim(),price,
      compare_at_price:old,stock_quantity:Number($('#bookStock').value||0),low_stock_threshold:Number($('#bookLowStock').value||5),status:$('#bookStatus').value,format:$('#bookFormat').value,language:$('#bookLanguage').value.trim()||'sq',pages:$('#bookPages').value===''?null:Number($('#bookPages').value),author_id:$('#bookAuthor').value||null,category_id:$('#bookCategory').value||null,publisher_id:$('#bookPublisher').value||null,isbn:$('#bookIsbn').value.trim()||null,short_description:$('#bookShort').value.trim()||null,description:$('#bookDescription').value.trim()||null,is_featured:$('#bookFeatured').checked,is_bestseller:$('#bookBestseller').checked,is_preorder:$('#bookPreorder').checked,track_stock:$('#bookTrackStock').checked,updated_at:new Date().toISOString()
    };
    if(!body.title||!body.sku||!body.slug)throw new Error('Titulli, SKU dhe slug janë të detyrueshme.');
    if(id)await api(`books?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body,prefer:'return=representation'});
    else await api('books',{method:'POST',body,prefer:'return=representation'});
    await loadBooks();renderBooks();renderDashboard();$('#bookModal').hidden=true;toast(id?'Libri u përditësua':'Libri u shtua');
  }catch(e){toast(e.message,'error')}finally{setBusy(btn,false)}
}

function switchView(name){
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $$('.view').forEach(v=>v.classList.remove('active-view'));
  $(`#view-${name}`)?.classList.add('active-view');
  $('#viewTitle').textContent=name==='dashboard'?'Dashboard':name==='orders'?'Porositë':'Librat';
}

function bindUI(){
  $('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=$('#loginBtn'),password=$('#adminPassword').value;
    setBusy(btn,true,'Hyr');
    try{const data=await login(ADMIN_EMAIL,password);saveSession(data);await enterAdmin()}catch(err){authMessage(err.message||'Hyrja dështoi.','error')}finally{setBusy(btn,false)}
  });
  $('#signupBtn').onclick=async()=>{
    const btn=$('#signupBtn'),password=$('#adminPassword').value;
    if(password.length<8){authMessage('Fjalëkalimi duhet t’i ketë së paku 8 karaktere.','error');return}
    setBusy(btn,true,'Aktivizo llogarinë për herë të parë');
    try{
      const data=await signup(ADMIN_EMAIL,password);
      if(data?.access_token){saveSession(data);await enterAdmin()}
      else authMessage('Llogaria u krijua. Kontrollo emailin për konfirmim; pasi ta konfirmosh, kthehu këtu dhe hyr me fjalëkalimin që zgjodhe.');
    }catch(err){authMessage(err.message||'Aktivizimi dështoi.','error')}finally{setBusy(btn,false)}
  };
  $('#logoutBtn').onclick=logout;
  $$('.nav-item').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  $$('[data-go]').forEach(b=>b.onclick=()=>switchView(b.dataset.go));
  $('#orderSearch').addEventListener('input',renderOrders);$('#orderStatusFilter').addEventListener('change',renderOrders);
  $('#bookSearch').addEventListener('input',renderBooks);$('#bookStatusFilter').addEventListener('change',renderBooks);
  $('#newBookBtn').onclick=()=>{resetBookForm();$('#bookModal').hidden=false};
  $('#bookTitle').addEventListener('input',()=>{if(!$('#bookId').value)$('#bookSlug').value=slugify($('#bookTitle').value)});
  $('#bookForm').addEventListener('submit',saveBook);
  $$('[data-close="order"]').forEach(x=>x.onclick=()=>$('#orderDrawer').hidden=true);
  $$('[data-close="book"]').forEach(x=>x.onclick=()=>$('#bookModal').hidden=true);
  $('#refreshBtn').onclick=async()=>{try{await loadAll();toast('Të dhënat u rifreskuan')}catch(e){toast(e.message,'error')}};
}

async function init(){
  bindUI();loadSession();
  if(await ensureSession())await enterAdmin();else showAuth();
}

document.addEventListener('DOMContentLoaded',init);
