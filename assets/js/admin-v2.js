const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const ADMIN_EMAIL='tamarillot@gmail.com';
const SESSION_KEY='zemzem_admin_session';
if(!document.querySelector('script[data-admin-funnel]')){const s=document.createElement('script');s.src='assets/js/admin-funnel.js?v=1';s.dataset.adminFunnel='1';s.defer=true;document.head.appendChild(s)}
if(!document.querySelector('script[data-admin-paypal]')){const s=document.createElement('script');s.src='assets/js/admin-paypal.js?v=1';s.dataset.adminPaypal='1';s.defer=true;document.head.appendChild(s)}

let session=null;
let orders=[],books=[],authors=[],categories=[],publishers=[],customers=[],coupons=[],reviews=[],ebookOrders=[],ebookCatalog=[],auditRows=[];
let integrations=null,activeOrder=null,activeBook=null,activeCustomer=null,currentAdminAccess=null;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const money=n=>Number(n||0).toFixed(2)+' €';
const fmtDate=v=>v?new Intl.DateTimeFormat('sq-AL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';
const fmtDay=v=>v?new Intl.DateTimeFormat('sq-AL',{dateStyle:'medium'}).format(new Date(v)):'—';
const slugify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const sameDay=(v,d=new Date())=>{if(!v)return false;const x=new Date(v);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()&&x.getDate()===d.getDate()};
const sameMonth=(v,d=new Date())=>{if(!v)return false;const x=new Date(v);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()};
const statusLabel=s=>({pending:'Në pritje',confirmed:'Konfirmuar',processing:'Në përgatitje',shipped:'Dërguar',delivered:'Dorëzuar',cancelled:'Anuluar',paid:'Paguar',failed:'Dështuar',refunded:'Rimbursuar',partially_refunded:'Pjesërisht rimbursuar',published:'Publikuar',draft:'Draft',archived:'Arkivuar',approved:'Aprovuar',rejected:'Refuzuar'}[s]||s||'—');

function toast(msg,type='ok'){
  const e=$('#toast');if(!e)return;
  e.textContent=msg;e.className='admin-toast'+(type==='error'?' error':'');e.hidden=false;
  clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.hidden=true,3000);
}
function authMessage(msg,type='ok'){
  const e=$('#authMessage');if(!e)return;
  e.textContent=msg;e.className='auth-message'+(type==='error'?' error':'');e.hidden=false;
}
function setAdminSync(text,ok=true){const e=$('#adminSync');if(!e)return;e.textContent=text;e.classList.toggle('error',!ok)}
function setButtonBusy(button,busy,text='Duke punuar…'){if(!button)return;if(busy)button.dataset.label=button.textContent;button.disabled=busy;button.textContent=busy?text:(button.dataset.label||button.textContent)}
function saveSession(d){
  if(!d?.access_token)return;
  session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number(d.expires_in)||3600),user:d.user||null};
  sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
}
function loadSession(){try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}
function clearSession(){session=null;sessionStorage.removeItem(SESSION_KEY)}
async function raw(path,{method='GET',body,token,headers={}}={}){
  const h={apikey:SB_KEY,...headers};if(body!==undefined)h['Content-Type']='application/json';if(token)h.Authorization=`Bearer ${token}`;
  const r=await fetch(SB_URL+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok)throw new Error(d?.message||d?.msg||d?.error_description||d?.error||`HTTP ${r.status}`);
  return d;
}
async function refreshSession(){
  if(!session?.refresh_token)throw new Error('Sesioni ka skaduar');
  saveSession(await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}));
}
async function ensureSession(){
  if(!session)return false;
  if((session.expires_at||0)-Math.floor(Date.now()/1000)<90){try{await refreshSession()}catch{clearSession();return false}}
  return true;
}
async function api(path,{method='GET',body,prefer}={}){
  if(!await ensureSession())throw new Error('Sesioni ka skaduar');
  const headers={};if(prefer)headers.Prefer=prefer;
  return raw('/rest/v1/'+path,{method,body,token:session.access_token,headers});
}
async function edge(name,body){
  if(!await ensureSession())throw new Error('Sesioni ka skaduar');
  const r=await fetch(`${SB_URL}/functions/v1/${name}`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body||{}),cache:'no-store'});
  const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}
  if(!r.ok)throw new Error(d?.message||d?.error||`HTTP ${r.status}`);
  return d;
}
async function login(email,password){return raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}})}
async function logout(){
  try{await raw('/auth/v1/logout',{method:'POST',token:session?.access_token})}catch{}
  clearSession();$('#authScreen').hidden=false;$('#adminApp').hidden=true;
}
async function verifyAdmin(){try{const r=await api('rpc/admin_access',{method:'POST',body:{}});currentAdminAccess=r||null;window.ZemZemAdminAccess=currentAdminAccess;return !!r?.authorized}catch{return false}}function hasAdminPermission(name){return !!(currentAdminAccess?.full_access||currentAdminAccess?.permissions?.includes?.(name))}
function statusPill(s){return `<span class="status-pill status-${esc(s)}">${esc(statusLabel(s))}</span>`}
function paymentPill(s){return `<span class="status-pill status-${esc(s)}">${esc(statusLabel(s))}</span>`}

function injectAdminPro(){
  if($('#adminProStyle'))return;
  document.head.insertAdjacentHTML('beforeend',`<style id="adminProStyle">
  :root{--zz-green:#173d2b;--zz-green2:#24583f;--zz-soft:#f4f7f5;--zz-line:#dfe7e2;--zz-text:#17231d;--zz-muted:#6e7b73;--zz-red:#b42318;--zz-amber:#a15c00}
  #authScreen[hidden],#adminApp[hidden],.view:not(.active-view),.drawer-wrap[hidden],.modal-wrap[hidden],#toast[hidden]{display:none!important}
  .admin-topbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--zz-line)}
  .dashboard-pro-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px}.dashboard-pro-head h2{margin:0;font-size:22px}.dashboard-pro-head p{margin:4px 0 0;color:var(--zz-muted)}
  .stats-grid.pro{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:16px}.stat-card.pro strong{font-size:26px}.stat-card.pro small{color:var(--zz-muted)}
  .mini-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.mini-metric{background:white;border:1px solid var(--zz-line);border-radius:15px;padding:14px}.mini-metric span{display:block;color:var(--zz-muted);font-size:12px}.mini-metric strong{display:block;margin-top:5px;font-size:18px}
  .dashboard-activity{display:grid;grid-template-columns:1.25fr .75fr;gap:16px}.activity-list{display:grid;gap:9px}.activity-item{display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:1px solid #edf1ef}.activity-item:last-child{border-bottom:0}.activity-dot{width:9px;height:9px;border-radius:50%;background:var(--zz-green2);margin-top:6px;flex:0 0 auto}.activity-item b{display:block}.activity-item small{color:var(--zz-muted)}
  .toolbar select{min-height:42px}.table-action,.primary-btn,.secondary-btn,.danger-btn,.print-btn{transition:.16s ease}.table-action:hover,.primary-btn:hover,.secondary-btn:hover,.print-btn:hover{transform:translateY(-1px)}
  .status-pill{white-space:nowrap}.status-paid,.status-published,.status-approved,.status-delivered{background:#e6f5ec!important;color:#17653b!important}.status-pending,.status-confirmed,.status-processing,.status-shipped{background:#fff3dd!important;color:#8a4d00!important}.status-cancelled,.status-failed,.status-rejected,.status-refunded{background:#fdebea!important;color:#a22118!important}.status-partially_refunded{background:#fff1e6!important;color:#9a4a00!important}
  .order-safe-note{padding:11px 12px;background:#f6f8f7;border:1px solid var(--zz-line);border-radius:10px;color:var(--zz-muted);font-size:12px;margin:10px 0}.readonly-payment{display:flex;align-items:center;gap:8px;min-height:42px;padding:8px 10px;border:1px solid var(--zz-line);border-radius:8px;background:#f8faf9}
  .order-action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.order-action-row button{min-height:40px}
  .customer-card{cursor:default}.customer-card-top{gap:16px}.customer-actions{display:flex;align-items:center;gap:8px}.customer-mini-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.customer-mini-grid span{display:block;padding:9px 10px;background:#f7f9f8;border-radius:9px;font-size:12px;color:var(--zz-muted)}.customer-mini-grid b{display:block;color:var(--zz-text);font-size:14px;margin-top:2px}
  .drawer.wide{width:min(760px,96vw)}.customer-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.customer-detail-section{margin-top:22px}.customer-detail-section h3{margin-bottom:10px}.customer-list-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #edf1ef}.customer-list-row:last-child{border-bottom:0}.customer-list-row small{color:var(--zz-muted)}
  .audit-toolbar{display:flex;gap:10px;align-items:center;margin-bottom:14px}.audit-list{display:grid;gap:8px}.audit-row{background:white;border:1px solid var(--zz-line);border-radius:12px;padding:12px 14px;display:grid;grid-template-columns:1.2fr .8fr 1fr;gap:12px;align-items:center}.audit-row small{color:var(--zz-muted)}.audit-details{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--zz-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .integration-state.ready{background:#e6f5ec;color:#17653b}.integration-state.warn{background:#fff3dd;color:#8a4d00}.integration-actions{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
  .stock-history-box{grid-column:1/-1;border-top:1px solid var(--zz-line);padding-top:16px;margin-top:6px}.stock-history-list{display:grid;gap:7px;margin-top:8px}.stock-history-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:8px 10px;background:#f7f9f8;border-radius:9px;font-size:12px}.delta-plus{color:#17653b;font-weight:800}.delta-minus{color:#a22118;font-weight:800}.stock-zero{color:#b42318;font-weight:900}.stock-low{color:#a15c00!important;font-weight:900}
  .book-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px}.micro-pill{font-size:10px;border:1px solid var(--zz-line);border-radius:999px;padding:2px 6px;background:#f7f9f8}
  .admin-health{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--zz-muted)}.health-dot{width:8px;height:8px;border-radius:50%;background:#24a565;box-shadow:0 0 0 4px rgba(36,165,101,.12)}
  .mobile-menu-btn{display:none}
  @media(max-width:1100px){.stats-grid.pro,.mini-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-activity{grid-template-columns:1fr}}
  @media(max-width:760px){.sidebar{position:fixed;left:-290px;top:0;bottom:0;z-index:60;transition:.2s}.sidebar.mobile-open{left:0}.main{margin-left:0!important;width:100%}.admin-topbar{padding-left:58px}.mobile-menu-btn{display:block!important;position:fixed;top:14px;left:12px;z-index:70}.stats-grid.pro,.mini-metric-grid,.customer-mini-grid,.customer-detail-grid{grid-template-columns:1fr 1fr}.dashboard-pro-head{align-items:flex-start;flex-direction:column}.table-wrap{overflow:auto}.audit-row{grid-template-columns:1fr}.audit-details{white-space:normal}.drawer{width:96vw!important}.order-controls.two-col{grid-template-columns:1fr}.order-controls .span-2{grid-column:auto}}
  @media(max-width:480px){.stats-grid.pro,.mini-metric-grid,.customer-mini-grid,.customer-detail-grid{grid-template-columns:1fr}.stat-card.pro strong{font-size:22px}.admin-user span{display:none}.top-actions{gap:6px}.main{padding:0}.view{padding:14px}.admin-topbar{padding-right:12px}.entity-grid,.integration-grid{grid-template-columns:1fr!important}}
  </style>`);
  if(!$('.mobile-menu-btn'))document.body.insertAdjacentHTML('afterbegin','<button class="mobile-menu-btn icon-action" type="button" aria-label="Menu">☰</button>');

  const dash=$('#view-dashboard');
  if(dash)dash.innerHTML=`
    <div class="dashboard-pro-head"><div><h2>Pasqyra e biznesit</h2><p>Libra fizikë dhe eBook në një vend.</p></div><div class="admin-health"><span class="health-dot"></span><span>Sistemi aktiv</span></div></div>
    <div class="stats-grid pro">
      <article class="stat-card pro"><div class="stat-icon">▤</div><div><span>Porosi sot</span><strong id="statOrdersToday">0</strong><small>fizike + digjitale</small></div></article>
      <article class="stat-card pro"><div class="stat-icon warm">◷</div><div><span>Në pritje</span><strong id="statPending">0</strong><small>porosi fizike që duan veprim</small></div></article>
      <article class="stat-card pro"><div class="stat-icon green">€</div><div><span>Të ardhura këtë muaj</span><strong id="statRevenueMonth">0.00 €</strong><small>vetëm pagesat e konfirmuara</small></div></article>
      <article class="stat-card pro"><div class="stat-icon red">!</div><div><span>Stok i ulët / 0</span><strong id="statLowStock">0</strong><small>tituj për kontroll</small></div></article>
    </div>
    <div class="mini-metric-grid">
      <div class="mini-metric"><span>Klientë</span><strong id="statCustomers">0</strong></div>
      <div class="mini-metric"><span>Të ardhura fizike</span><strong id="statPhysicalRevenue">0.00 €</strong></div>
      <div class="mini-metric"><span>Të ardhura eBook</span><strong id="statEbookRevenue">0.00 €</strong></div>
      <div class="mini-metric"><span>Të ardhura gjithsej</span><strong id="statAllRevenue">0.00 €</strong></div>
      <div class="mini-metric"><span>Libra Published</span><strong id="statPublishedBooks">0</strong></div>
      <div class="mini-metric"><span>Libra Draft</span><strong id="statDraftBooks">0</strong></div>
      <div class="mini-metric"><span>Libra Archived</span><strong id="statArchivedBooks">0</strong></div>
      <div class="mini-metric"><span>Porosi gjithsej</span><strong id="statOrdersAll">0</strong></div>
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-head"><div><h2>Porositë e fundit</h2><p>Porositë fizike më të reja</p></div><button class="text-btn" data-go="orders">Shiko të gjitha →</button></div><div id="recentOrders"></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Stoku</h2><p>Titujt që duhen kontrolluar</p></div><button class="text-btn" data-go="books">Menaxho →</button></div><div id="stockAlerts"></div></section>
    </div>
    <div class="dashboard-activity" style="margin-top:16px">
      <section class="panel"><div class="panel-head"><div><h2>Aktiviteti administrativ</h2><p>Veprimet më të fundit në dyqan</p></div><button class="text-btn" data-go="audit">Audit →</button></div><div id="dashboardAudit" class="activity-list"></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Shitjet sot</h2><p>Ndarja sipas kanalit</p></div></div><div id="todayBreakdown"></div></section>
    </div>`;

  const side=$('.side-nav');
  if(side&&!side.querySelector('[data-view="audit"]')){
    const integrationsBtn=side.querySelector('[data-view="integrations"]');
    const b=document.createElement('button');b.className='nav-item';b.dataset.view='audit';b.innerHTML='⌁ Audit Log';
    side.insertBefore(b,integrationsBtn||null);
  }
  const integrationsView=$('#view-integrations');
  if(integrationsView){
    integrationsView.insertAdjacentHTML('beforebegin',`<section id="view-audit" class="view"><div class="audit-toolbar"><div class="searchbox grow">⌕ <input id="auditSearch" placeholder="Kërko veprim, entitet ose ID..."></div><button class="secondary-btn" id="refreshAuditBtn">Rifresko</button></div><div id="auditList" class="audit-list"></div></section>`);
    integrationsView.innerHTML=`<div class="integration-grid">
      <article class="integration-card"><strong>PayPal</strong><span class="integration-state" id="paypalState">Duke kontrolluar…</span><p>Pagesat krijohen dhe kapen në server. Admini nuk mund ta shënojë manualisht një PayPal si të paguar.</p></article>
      <article class="integration-card"><strong>Email / Resend</strong><span class="integration-state" id="emailState">Duke kontrolluar…</span><p>Konfirmime dhe njoftime për statusin e porosive.</p><div class="integration-actions"><button class="secondary-btn" id="storeEmailTestBtn">✉ Email test</button></div></article>
      <article class="integration-card"><strong>Supabase</strong><span class="integration-state" id="supabaseState">Duke kontrolluar…</span><p>Databaza, Auth, Storage dhe RLS.</p></article>
      <article class="integration-card"><strong>Siguria</strong><span class="integration-state" id="securityState">Duke kontrolluar…</span><p>Veprimet e ndjeshme kalojnë në funksione server-side dhe regjistrohen në Audit Log.</p></article>
    </div>`;
  }

  const orderToolbar=$('#view-orders .toolbar');
  if(orderToolbar&&!$('#paymentStatusFilter'))orderToolbar.insertAdjacentHTML('beforeend',`<select id="paymentStatusFilter"><option value="">Të gjitha pagesat</option><option value="pending">Pagesa pending</option><option value="paid">Paguar</option><option value="failed">Dështuar</option><option value="refunded">Rimbursuar</option><option value="partially_refunded">Pjesërisht rimbursuar</option></select>`);

  if(!$('#customerDrawer'))document.body.insertAdjacentHTML('beforeend',`<div id="customerDrawer" class="drawer-wrap" hidden><div class="drawer-backdrop" data-close="customer"></div><aside class="drawer wide"><button class="drawer-close" data-close="customer">×</button><div id="customerDetail"></div></aside></div>`);
}
async function logAudit(action,entityType,entityId=null,details={}){
  try{await api('rpc/admin_log_store_action',{method:'POST',body:{p_action:action,p_entity_type:entityType,p_entity_id:entityId,p_details:details}})}catch(e){console.warn('audit',e)}
}

async function requireAdmin2FA(){
  if(!currentAdminAccess?.two_factor_enabled)return true;
  const key='zemzem_admin_2fa_ok_'+String(currentAdminAccess.user_id||'');
  if(sessionStorage.getItem(key)==='1')return true;
  if(!$('#admin2faModal')){
    document.body.insertAdjacentHTML('beforeend',`<div id="admin2faModal" class="modal-wrap" hidden><div class="modal-backdrop"></div><div class="modal-card" style="max-width:440px"><div class="modal-head"><div><div class="eyebrow">VERIFIKIM I DYTË</div><h2>2FA Admin</h2></div></div><p class="muted">Po dërgojmë një kod 6-shifror në emailin e administratorit.</p><div class="field"><label>Kodi</label><input id="admin2faCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"></div><div id="admin2faStatus" class="muted-small" style="min-height:20px;margin:8px 0"></div><div class="modal-actions"><button class="secondary-btn" id="admin2faResend" type="button">Ridërgo kodin</button><button class="primary-btn" id="admin2faVerify" type="button">Verifiko</button></div></div></div>`);
  }
  const modal=$('#admin2faModal'),status=$('#admin2faStatus'),code=$('#admin2faCode');
  modal.hidden=false;$('#adminApp').hidden=true;$('#authScreen').hidden=true;
  const send=async()=>{status.textContent='Duke dërguar kodin…';try{await edge('admin-2fa',{action:'send'});status.textContent='Kodi u dërgua. Skadon pas 10 minutash.'}catch(e){status.textContent=e.message}};
  await send();
  return await new Promise(resolve=>{
    $('#admin2faResend').onclick=send;
    $('#admin2faVerify').onclick=async()=>{const v=code.value.replace(/\D/g,'').slice(0,6);if(v.length!==6){status.textContent='Shkruaj kodin 6-shifror.';return}const b=$('#admin2faVerify');setButtonBusy(b,true,'Duke verifikuar…');try{const r=await edge('admin-2fa',{action:'verify',code:v});if(!r?.ok)throw new Error('Kodi nuk është i saktë ose ka skaduar.');sessionStorage.setItem(key,'1');modal.hidden=true;status.textContent='';resolve(true)}catch(e){status.textContent=e.message}finally{setButtonBusy(b,false)}};code.onkeydown=e=>{if(e.key==='Enter')$('#admin2faVerify').click()};setTimeout(()=>code.focus(),50)
  });
}
async function enterAdmin(){
  try{
    if(!await verifyAdmin())throw new Error('Kjo llogari nuk ka të drejta administratori.');
    if(!await requireAdmin2FA())throw new Error('2FA nuk u verifikua.');
    $('#authScreen').hidden=true;$('#adminApp').hidden=false;
    await loadAll();
  }catch(e){clearSession();$('#authScreen').hidden=false;$('#adminApp').hidden=true;authMessage(e.message,'error')}
}
async function loadAll(){
  setAdminSync('Duke sinkronizuar…');
  const jobs=[];
  if(hasAdminPermission('orders')||hasAdminPermission('dashboard'))jobs.push(loadOrders());
  if(hasAdminPermission('books')||hasAdminPermission('dashboard'))jobs.push(loadBooks(),loadRefs(),loadEbookCatalog());
  else if(hasAdminPermission('catalog'))jobs.push(loadRefs());
  else if(hasAdminPermission('coupons'))jobs.push(loadBooks(),loadRefs());
  if(hasAdminPermission('customers'))jobs.push(loadCustomers());
  if(hasAdminPermission('coupons'))jobs.push(loadCoupons());
  if(hasAdminPermission('reviews'))jobs.push(loadReviews());
  if(hasAdminPermission('ebooks')||hasAdminPermission('dashboard'))jobs.push(loadEbookOrders());
  if(hasAdminPermission('audit'))jobs.push(loadAudit());
  if(hasAdminPermission('integrations'))jobs.push(loadIntegrations());
  await Promise.all(jobs);
  if(hasAdminPermission('dashboard'))renderDashboard();
  if(hasAdminPermission('orders'))renderOrders();
  if(hasAdminPermission('books'))renderBooks();
  if(hasAdminPermission('catalog')||hasAdminPermission('books'))renderEntities();
  if(hasAdminPermission('customers'))renderCustomers();
  if(hasAdminPermission('coupons'))renderCoupons();
  if(hasAdminPermission('reviews'))renderReviews();
  if(hasAdminPermission('audit'))renderAudit();
  if(hasAdminPermission('integrations'))renderIntegrations();
  window.dispatchEvent(new CustomEvent('zemzem:admin-access-ready',{detail:currentAdminAccess}));
  setAdminSync(`Përditësuar ${new Intl.DateTimeFormat('sq-AL',{hour:'2-digit',minute:'2-digit'}).format(new Date())}`);
}
async function loadOrders(){orders=await api('orders?select=*&order=created_at.desc&limit=700')||[]}
async function loadBooks(){books=await api('books?select=*&order=created_at.desc&limit=1000')||[]}
async function loadRefs(){
  [authors,categories,publishers]=await Promise.all([api('authors?select=*&order=name.asc'),api('categories?select=*&order=sort_order.asc,name.asc'),api('publishers?select=*&order=name.asc')]);
  authors=authors||[];categories=categories||[];publishers=publishers||[];fillRefSelects();
}
async function loadCustomers(){try{customers=await api('rpc/admin_list_customers_v2',{method:'POST',body:{}})||[]}catch{try{customers=await api('rpc/admin_list_customers',{method:'POST',body:{}})||[]}catch{customers=[]}}}
async function loadCoupons(){coupons=await api('coupons?select=*&order=created_at.desc')||[]}
async function loadReviews(){reviews=await api('reviews?select=*&order=created_at.desc&limit=300')||[]}
async function loadEbookOrders(){try{ebookOrders=await api('ebook_orders?select=id,order_number,user_id,customer_email,total,payment_status,created_at,paid_at,refunded_at&order=created_at.desc&limit=700')||[]}catch{ebookOrders=[]}}
async function loadEbookCatalog(){try{ebookCatalog=await api('ebooks?select=id,title,status,price&order=title.asc&limit=1000')||[]}catch{ebookCatalog=[]}fillLinkedEbookSelect()}
function fillLinkedEbookSelect(){const s=$('#bookLinkedEbook');if(!s)return;const v=s.value;s.innerHTML='<option value="">— Pa eBook —</option>'+ebookCatalog.filter(x=>x.status!=='archived').map(x=>`<option value="${x.id}">${esc(x.title)} · ${money(x.price)}</option>`).join('');if([...s.options].some(o=>o.value===v))s.value=v}
async function loadBookEbookLink(bookId){const s=$('#bookLinkedEbook');if(!s)return;try{const rows=await api(`book_ebook_links?physical_book_id=eq.${bookId}&select=ebook_id,bundle_discount_percent&limit=1`);const x=rows?.[0];s.value=x?.ebook_id||'';$('#bookBundleDiscount').value=x?.bundle_discount_percent??10}catch{s.value='';$('#bookBundleDiscount').value='10'}}
async function saveBookEbookLink(bookId){const ebookId=$('#bookLinkedEbook')?.value||'',discount=Math.max(0,Math.min(50,Number($('#bookBundleDiscount')?.value||10)));if(!ebookId){await api(`book_ebook_links?physical_book_id=eq.${bookId}`,{method:'DELETE'});return}await api('book_ebook_links?on_conflict=physical_book_id',{method:'POST',body:{physical_book_id:bookId,ebook_id:ebookId,bundle_discount_percent:discount,is_active:true,updated_at:new Date().toISOString()},prefer:'resolution=merge-duplicates,return=minimal'})}
async function loadAudit(){try{auditRows=(await edge('store-admin-ops',{action:'audit'}))?.rows||[]}catch{auditRows=[]}}
async function loadIntegrations(){try{integrations=await edge('store-admin-ops',{action:'integration_status'})}catch{integrations=null}}
function fillRefSelects(){const fill=(sel,arr)=>{const e=$(sel);if(e)e.innerHTML='<option value="">—</option>'+arr.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')};fill('#bookAuthor',authors);fill('#bookCategory',categories);fill('#bookPublisher',publishers)}

function renderDashboard(){
  const pending=orders.filter(o=>['pending','confirmed'].includes(o.order_status));
  const low=books.filter(b=>b.track_stock!==false&&Number(b.stock_quantity)<=Number(b.low_stock_threshold||5));
  const paidPhysical=orders.filter(o=>o.payment_status==='paid'&&o.order_status!=='cancelled');
  const paidEbooks=ebookOrders.filter(o=>o.payment_status==='paid');
  const physicalRevenue=paidPhysical.reduce((s,o)=>s+Number(o.total||0),0),ebookRevenue=paidEbooks.reduce((s,o)=>s+Number(o.total||0),0);
  const monthRevenue=paidPhysical.filter(o=>sameMonth(o.created_at)).reduce((s,o)=>s+Number(o.total||0),0)+paidEbooks.filter(o=>sameMonth(o.paid_at||o.created_at)).reduce((s,o)=>s+Number(o.total||0),0);
  const ordersToday=orders.filter(o=>sameDay(o.created_at)).length+ebookOrders.filter(o=>sameDay(o.created_at)).length;
  const physToday=paidPhysical.filter(o=>sameDay(o.created_at)).reduce((s,o)=>s+Number(o.total||0),0),ebookToday=paidEbooks.filter(o=>sameDay(o.paid_at||o.created_at)).reduce((s,o)=>s+Number(o.total||0),0);
  if($('#statOrdersToday'))$('#statOrdersToday').textContent=ordersToday;if($('#statPending'))$('#statPending').textContent=pending.length;if($('#statRevenueMonth'))$('#statRevenueMonth').textContent=money(monthRevenue);if($('#statLowStock'))$('#statLowStock').textContent=low.length;if($('#statCustomers'))$('#statCustomers').textContent=customers.length;if($('#statPhysicalRevenue'))$('#statPhysicalRevenue').textContent=money(physicalRevenue);if($('#statEbookRevenue'))$('#statEbookRevenue').textContent=money(ebookRevenue);if($('#statAllRevenue'))$('#statAllRevenue').textContent=money(physicalRevenue+ebookRevenue);if($('#statPublishedBooks'))$('#statPublishedBooks').textContent=books.filter(b=>b.status==='published').length;if($('#statDraftBooks'))$('#statDraftBooks').textContent=books.filter(b=>b.status==='draft').length;if($('#statArchivedBooks'))$('#statArchivedBooks').textContent=books.filter(b=>b.status==='archived').length;if($('#statOrdersAll'))$('#statOrdersAll').textContent=orders.length+ebookOrders.length;if($('#pendingBadge'))$('#pendingBadge').textContent=pending.length;
  $('#recentOrders').innerHTML=orders.slice(0,6).map(o=>`<div class="mini-order"><div><strong>${esc(o.order_number)}</strong><span>${esc(o.first_name)} ${esc(o.last_name)} · ${statusPill(o.order_status)}</span></div><div class="money">${money(o.total)}</div></div>`).join('')||'<div class="empty-state">Ende nuk ka porosi fizike.</div>';
  $('#stockAlerts').innerHTML=low.slice(0,8).map(b=>`<div class="stock-row"><div><strong>${esc(b.title)}</strong><span>${esc(b.sku)}</span></div><div class="${Number(b.stock_quantity)===0?'stock-zero':'stock-low'}">${b.stock_quantity} copë</div></div>`).join('')||'<div class="empty-state">Stoku është në rregull.</div>';
  if($('#dashboardAudit'))$('#dashboardAudit').innerHTML=auditRows.slice(0,7).map(a=>`<div class="activity-item"><span class="activity-dot"></span><div><b>${esc(a.action.replaceAll('_',' '))}</b><small>${esc(a.entity_type)} · ${fmtDate(a.created_at)}</small></div></div>`).join('')||'<div class="empty-state">Ende pa veprime administrative.</div>';
  if($('#todayBreakdown'))$('#todayBreakdown').innerHTML=`<div class="mini-metric" style="margin-bottom:9px"><span>Libra fizikë</span><strong>${money(physToday)}</strong></div><div class="mini-metric"><span>eBook</span><strong>${money(ebookToday)}</strong></div>`;
}

function filteredOrders(){const q=($('#orderSearch')?.value||'').toLowerCase(),st=$('#orderStatusFilter')?.value||'',ps=$('#paymentStatusFilter')?.value||'';return orders.filter(o=>(!st||o.order_status===st)&&(!ps||o.payment_status===ps)&&(!q||`${o.order_number} ${o.first_name} ${o.last_name} ${o.guest_email||''} ${o.phone||''} ${o.tracking_number||''}`.toLowerCase().includes(q)))}
function renderOrders(){
  const rows=filteredOrders();
  $('#ordersBody').innerHTML=rows.map(o=>`<tr><td><div class="cell-main">${esc(o.order_number)}</div><div class="cell-sub">${esc((o.payment_method||'').toUpperCase())}</div></td><td><div class="cell-main">${esc(o.first_name)} ${esc(o.last_name)}</div><div class="cell-sub">${esc(o.guest_email||'—')} · ${esc(o.phone||'')}</div></td><td>${esc(o.country_code)}</td><td>${paymentPill(o.payment_status)}</td><td class="money">${money(o.total)}</td><td>${statusPill(o.order_status)}</td><td>${fmtDate(o.created_at)}</td><td><button class="table-action" data-order-id="${o.id}">Hap</button></td></tr>`).join('');
  $('#ordersEmpty').hidden=!!rows.length;$$('[data-order-id]').forEach(b=>b.onclick=()=>openOrder(b.dataset.orderId));
}
async function openOrder(id){
  const o=orders.find(x=>x.id===id);if(!o)return;activeOrder=o;$('#orderDrawer').hidden=false;$('#orderDetail').innerHTML='<div class="empty-state">Duke ngarkuar…</div>';
  try{
    const [items,history,logs]=await Promise.all([api(`order_items?order_id=eq.${id}&select=*&order=created_at.asc`),api(`order_status_history?order_id=eq.${id}&select=*&order=created_at.asc`),api(`store_admin_audit?entity_type=eq.order&entity_id=eq.${id}&select=*&order=created_at.desc&limit=60`)]);
    const cod=['cod','cash_on_delivery','cash'].includes(String(o.payment_method||'').toLowerCase()),canMarkCod=cod&&o.payment_status!=='paid'&&o.order_status==='delivered';
    $('#orderDetail').innerHTML=`<div class="detail-head"><div class="eyebrow">POROSIA FIZIKE</div><h2>${esc(o.order_number)}</h2><div>${statusPill(o.order_status)} ${paymentPill(o.payment_status)}</div></div><div class="detail-grid"><div class="detail-box"><span>Klienti</span><strong>${esc(o.first_name)} ${esc(o.last_name)}</strong><div class="cell-sub">${esc(o.guest_email||'—')}<br>${esc(o.phone||'')}</div></div><div class="detail-box"><span>Adresa</span><strong>${esc(o.address_line1)}</strong><div class="cell-sub">${o.address_line2?esc(o.address_line2)+'<br>':''}${esc(o.postal_code||'')} ${esc(o.city)}, ${esc(o.country_code)}</div></div><div class="detail-box"><span>Pagesa</span><strong>${esc((o.payment_method||'').toUpperCase())}</strong><div class="cell-sub">${statusLabel(o.payment_status)}${o.paypal_capture_id?`<br>Capture: ${esc(o.paypal_capture_id)}`:''}</div></div><div class="detail-box"><span>Totali</span><strong>${money(o.total)}</strong><div class="cell-sub">Librat ${money(o.subtotal)} · Kupon ${money(o.discount_amount)} · PayPal ${money(o.payment_discount_amount)} · Transport ${money(o.shipping_amount)} · COD ${money(o.cod_fee)}</div></div></div><div class="detail-section"><h3>Artikujt</h3>${(items||[]).map(i=>`<div class="order-line"><span><strong>${esc(i.title)}</strong><br><small>${esc(i.sku)}</small></span><span>${i.quantity} × ${money(i.unit_price)}</span><strong>${money(i.line_total)}</strong></div>`).join('')||'<div class="empty-state">Pa artikuj.</div>'}</div><div class="detail-section"><h3>Historia e statusit</h3><div class="timeline">${(history||[]).map(h=>`<div class="timeline-item"><strong>${esc(statusLabel(h.new_status))}</strong><div class="muted-small">${fmtDate(h.created_at)}${h.note?' · '+esc(h.note):''}</div></div>`).join('')||'<p class="muted">Pa histori.</p>'}</div></div><div class="detail-section"><h3>Menaxhimi</h3><div class="order-safe-note">Statusi i pagesës PayPal kontrollohet nga serveri dhe nuk mund të ndryshohet manualisht nga paneli. COD mund të shënohet “Paguar” vetëm pasi porosia të jetë dorëzuar.</div><div class="order-controls two-col"><label>Statusi<select id="detailOrderStatus">${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.order_status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}</select></label><label>Pagesa<div class="readonly-payment">${paymentPill(o.payment_status)} <small>${esc((o.payment_method||'').toUpperCase())}</small></div></label><label>Transportuesi<input id="detailCarrier" value="${esc(o.shipping_carrier||'')}"></label><label>Tracking<input id="detailTracking" value="${esc(o.tracking_number||'')}"></label><label class="span-2">Arsye anulimi<input id="detailCancelReason" value="${esc(o.cancellation_reason||'')}" placeholder="E detyrueshme kur statusi bëhet Anuluar"></label><label class="span-2">Shënim<textarea id="detailNotes" rows="4">${esc(o.notes||'')}</textarea></label><div class="span-2 order-action-row"><button class="primary-btn" id="saveOrderBtn">Ruaj ndryshimet</button><button class="secondary-btn" id="resendOrderEmailBtn">✉ Ridërgo emailin</button>${canMarkCod?'<button class="secondary-btn" id="markCodPaidBtn">€ Shëno COD të paguar</button>':''}<button class="print-btn" id="printOrderBtn">Printo / PDF</button></div></div></div><div class="detail-section"><h3>Audit</h3><div class="timeline">${(logs||[]).map(a=>`<div class="timeline-item"><strong>${esc(a.action.replaceAll('_',' '))}</strong><div class="muted-small">${fmtDate(a.created_at)}</div></div>`).join('')||'<p class="muted">Ende pa veprime administrative.</p>'}</div></div>`;
    $('#saveOrderBtn').onclick=saveOrderChanges;$('#resendOrderEmailBtn').onclick=resendOrderEmail;if($('#markCodPaidBtn'))$('#markCodPaidBtn').onclick=markCodPaid;$('#printOrderBtn').onclick=()=>window.print();
  }catch(e){$('#orderDetail').innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}
async function saveOrderChanges(){
  if(!activeOrder)return;const body={p_order_id:activeOrder.id,p_order_status:$('#detailOrderStatus').value,p_shipping_carrier:$('#detailCarrier').value.trim()||null,p_tracking_number:$('#detailTracking').value.trim()||null,p_cancellation_reason:$('#detailCancelReason').value.trim()||null,p_notes:$('#detailNotes').value.trim()||null},oldStatus=activeOrder.order_status;
  if(body.p_order_status==='shipped'&&(!body.p_shipping_carrier||!body.p_tracking_number)){toast('Për statusin “E dërguar” plotëso transportuesin dhe numrin e gjurmimit.','error');return}
  if(body.p_order_status==='cancelled'&&!body.p_cancellation_reason){toast('Shkruaj arsyen e anulimit para se ta ruash.','error');return}
  try{const d=await api('rpc/admin_update_physical_order',{method:'POST',body}),row=Array.isArray(d)?d[0]:d;if(row)activeOrder=row;if(oldStatus!==body.p_order_status){try{await edge('process-notifications',{order_id:activeOrder.id})}catch(e){if(!String(e.message).includes('EMAIL_NOT_CONFIGURED'))console.warn(e)}}await Promise.all([loadOrders(),loadAudit()]);renderDashboard();renderOrders();renderAudit();toast('Porosia u përditësua');await openOrder(activeOrder.id)}catch(e){toast(e.message,'error')}
}
async function resendOrderEmail(){
  if(!activeOrder)return;const b=$('#resendOrderEmailBtn');if(b)b.disabled=true;
  try{const d=await edge('store-admin-ops',{action:'resend_receipt',order_id:activeOrder.id});toast(`Emaili u dërgua te ${d.email||activeOrder.guest_email}`);await loadAudit();renderAudit();renderDashboard();await openOrder(activeOrder.id)}catch(e){toast(e.message,'error')}finally{if(b)b.disabled=false}
}
async function markCodPaid(){
  if(!activeOrder||!confirm('Ta shënoj këtë porosi COD si të paguar?'))return;
  try{const d=await api('rpc/admin_mark_cod_paid',{method:'POST',body:{p_order_id:activeOrder.id}}),row=Array.isArray(d)?d[0]:d;if(row)activeOrder=row;await Promise.all([loadOrders(),loadAudit()]);renderOrders();renderDashboard();renderAudit();toast('COD u shënua i paguar');await openOrder(activeOrder.id)}catch(e){toast(e.message,'error')}
}

function filteredBooks(){const q=($('#bookSearch')?.value||'').toLowerCase(),st=$('#bookStatusFilter')?.value||'';return books.filter(b=>(!st||b.status===st)&&(!q||`${b.title} ${b.sku} ${b.isbn||''}`.toLowerCase().includes(q)))}
function renderBooks(){
  const rows=filteredBooks();
  $('#booksBody').innerHTML=rows.map(b=>{const qty=Number(b.stock_quantity||0),low=b.track_stock!==false&&qty<=Number(b.low_stock_threshold||5);return `<tr><td><div class="book-cell">${b.cover_url?`<img class="table-thumb" src="${esc(b.cover_url)}" alt="">`:'<div class="table-thumb"></div>'}<div><div class="cell-main">${esc(b.title)}</div><div class="cell-sub">${esc(b.language)} · ${esc(b.format)}</div><div class="book-badges">${b.is_featured?'<span class="micro-pill">Featured</span>':''}${b.is_bestseller?'<span class="micro-pill">Bestseller</span>':''}${b.is_preorder?'<span class="micro-pill">Preorder</span>':''}</div></div></div></td><td>${esc(b.sku)}</td><td class="money">${money(b.price)}${b.compare_at_price?`<div class="cell-sub"><s>${money(b.compare_at_price)}</s></div>`:''}</td><td class="${qty===0?'stock-zero':low?'stock-low':''}">${qty===0?'0 · Pa stok':qty}</td><td>${statusPill(b.status)}</td><td>${b.is_featured?'✓':'—'}</td><td><button class="table-action" data-book-id="${b.id}">Edito</button> <button class="table-action small-btn" data-stock-history="${b.id}">Histori</button></td></tr>`}).join('');
  $('#booksEmpty').hidden=!!rows.length;$$('[data-book-id]').forEach(b=>b.onclick=()=>openBook(b.dataset.bookId));$$('[data-stock-history]').forEach(b=>b.onclick=()=>openBook(b.dataset.stockHistory,true));
}
function ensureBookGalleryFields(){
  if($('#bookGalleryField'))return;
  const coverField=$('#coverPreview')?.closest('.field');if(!coverField)return;
  const field=document.createElement('div');field.id='bookGalleryField';field.className='field span-3';
  field.innerHTML=`<label>Fotografi shtesë të librit <small>(deri në 4)</small></label><div class="book-gallery-admin" id="bookGalleryAdmin">${[0,1,2,3].map(i=>`<div class="book-gallery-slot" data-gallery-slot="${i}"><div class="book-gallery-preview">Foto ${i+1}</div><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Fotografia shtesë ${i+1}"><button type="button" class="book-gallery-remove">Hiq</button></div>`).join('')}</div><p class="muted-small">JPG, PNG ose WebP · maksimumi 5 MB për fotografi. Kopertina kryesore mbetet e para.</p>`;
  coverField.insertAdjacentElement('afterend',field);
  if(!$('#bookGalleryAdminStyle'))document.head.insertAdjacentHTML('beforeend',`<style id="bookGalleryAdminStyle">.book-gallery-admin{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:8px}.book-gallery-slot{border:1px solid #dfe7e2;border-radius:11px;padding:9px;background:#fafcfb}.book-gallery-preview{height:135px;border-radius:8px;background:#eef2ef;display:grid;place-items:center;overflow:hidden;color:#78857e;font-size:11px}.book-gallery-preview img{width:100%;height:100%;object-fit:cover}.book-gallery-slot input{width:100%;margin-top:8px;font-size:10px}.book-gallery-remove{width:100%;margin-top:7px;border:1px solid #ead8d5;border-radius:7px;background:#fff;color:#a24d43;padding:7px;cursor:pointer;font-weight:800}@media(max-width:760px){.book-gallery-admin{grid-template-columns:repeat(2,1fr)}}@media(max-width:420px){.book-gallery-admin{grid-template-columns:1fr}}</style>`);
  $$('.book-gallery-slot').forEach(slot=>{const input=slot.querySelector('input'),preview=slot.querySelector('.book-gallery-preview');input.onchange=()=>{const f=input.files?.[0];if(f)preview.innerHTML=`<img src="${URL.createObjectURL(f)}" alt="">`};slot.querySelector('.book-gallery-remove').onclick=()=>{slot.dataset.url='';input.value='';preview.textContent=`Foto ${Number(slot.dataset.gallerySlot)+1}`}});
}
function renderBookGalleryFields(urls=[]){ensureBookGalleryFields();$$('.book-gallery-slot').forEach((slot,i)=>{const url=Array.isArray(urls)?urls[i]||'':'';slot.dataset.url=url;slot.querySelector('input').value='';slot.querySelector('.book-gallery-preview').innerHTML=url?`<img src="${esc(url)}" alt="Fotografia shtesë ${i+1}">`:`Foto ${i+1}`})}
async function uploadGalleryImages(bookId){const result=[];for(const slot of $$('.book-gallery-slot')){const file=slot.querySelector('input').files?.[0];if(!file){if(slot.dataset.url)result.push(slot.dataset.url);continue}if(file.size>5*1024*1024)throw new Error('Një fotografi shtesë është mbi 5 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Një fotografi shtesë ka format të papranueshëm.');const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',path=`${bookId}/gallery-${slot.dataset.gallerySlot}-${Date.now()}.${ext}`;const r=await fetch(`${SB_URL}/storage/v1/object/book-covers/${path}`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':file.type,'x-upsert':'true'},body:file});if(!r.ok)throw new Error('Ngarkimi i fotografive shtesë dështoi.');result.push(`${SB_URL}/storage/v1/object/public/book-covers/${path}`)}return result.slice(0,4)}
window.uploadGalleryImages=uploadGalleryImages;
function book3dPreviewUrl(inputId,hiddenId){const f=$(inputId)?.files?.[0];if(f)return URL.createObjectURL(f);return $(hiddenId)?.value||''}
function refreshBook3dPreview(){
  const front=book3dPreviewUrl('#bookCover','#bookCoverUrl'),spine=book3dPreviewUrl('#bookSpineCover','#bookSpineCoverUrl'),back=book3dPreviewUrl('#bookBackCover','#bookBackCoverUrl');
  const set=(id,url,empty)=>{const el=$(id);if(!el)return;el.innerHTML=url?`<img src="${esc(url)}" alt="">`:empty};
  set('#book3dFrontPreview',front,'Përdor kopertinën kryesore');set('#book3dSpinePreview',spine,'Pa foto');set('#book3dBackPreview',back,'Pa foto');
  const p=$('#book3dPreview');if(p)p.classList.toggle('ready',!!(front&&spine&&back));
  const a=$('#book3dPreviewFront'),b=$('#book3dPreviewSpine'),d=$('#book3dPreviewBack');if(a)a.src=front||'';if(b)b.src=spine||'';if(d)d.src=back||'';
}
async function uploadBook3dAsset(file,bookId,kind,existing){
  if(!file)return existing||null;
  if(file.size>5*1024*1024)throw new Error('Një foto e mockup-it 3D është mbi 5 MB.');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Fotot 3D duhet të jenë JPG, PNG ose WebP.');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',path=`${bookId}/3d-${kind}-${Date.now()}.${ext}`;
  const r=await fetch(`${SB_URL}/storage/v1/object/book-covers/${path}`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':file.type,'x-upsert':'true'},body:file});
  if(!r.ok)throw new Error('Ngarkimi i fotos '+kind+' dështoi.');
  return `${SB_URL}/storage/v1/object/public/book-covers/${path}`;
}
function resetBookForm(){activeBook=null;ensureBookGalleryFields();$('#bookForm').reset();$('#bookId').value='';$('#bookLanguage').value='sq';$('#bookBadgeText').value='';$('#bookBadgeStyle').value='default';$('#bookOfferEnds').value='';$('#bookReleaseDate').value='';$('#bookCountry').value='';$('#bookDimensions').value='';$('#bookWeight').value='';$('#bookCostPrice').value='';$('#bookLinkedEbook').value='';$('#bookBundleDiscount').value='10';$('#bookStatus').value='draft';$('#bookFormat').value='physical';$('#bookStock').value='0';$('#bookLowStock').value='5';$('#bookTrackStock').checked=true;$('#bookCoverUrl').value='';$('#bookSpineCoverUrl').value='';$('#bookBackCoverUrl').value='';$('#bookCoverMode').value='3d';$('#bookThickness').value='';$('#bookSpineCover').value='';$('#bookBackCover').value='';$('#coverPreview').innerHTML='Pa kopertinë';refreshBook3dPreview();renderBookGalleryFields([]);$('#bookModalTitle').textContent='Libër fizik i ri';$('#deleteBookBtn').hidden=true;$('#bookSlug').dataset.manual='';$('#stockHistoryBox')?.remove()}
async function openBook(id,showHistory=false){
  resetBookForm();const b=books.find(x=>x.id===id);
  if(b){activeBook=b;$('#bookId').value=b.id;$('#bookModalTitle').textContent='Edito librin';$('#bookTitle').value=b.title||'';$('#bookSku').value=b.sku||'';$('#bookSlug').value=b.slug||'';$('#bookIsbn').value=b.isbn||'';$('#bookPrice').value=b.price??'';$('#bookOldPrice').value=b.compare_at_price??'';$('#bookBadgeText').value=b.badge_text||'';$('#bookBadgeStyle').value=b.badge_style||'default';$('#bookOfferEnds').value=b.offer_ends_at?new Date(b.offer_ends_at).toISOString().slice(0,16):'';$('#bookStock').value=b.stock_quantity??0;$('#bookLowStock').value=b.low_stock_threshold??5;$('#bookStatus').value=b.status||'draft';$('#bookFormat').value=b.format||'physical';$('#bookLanguage').value=b.language||'sq';$('#bookPages').value=b.pages??'';$('#bookReleaseDate').value=b.release_date||'';$('#bookCountry').value=b.country||'';$('#bookDimensions').value=b.dimensions||'';$('#bookWeight').value=b.weight_grams??'';$('#bookCostPrice').value=b.cost_price??'';$('#bookAuthor').value=b.author_id||'';$('#bookCategory').value=b.category_id||'';$('#bookPublisher').value=b.publisher_id||'';$('#bookShort').value=b.short_description||'';$('#bookDescription').value=b.description||'';$('#bookFeatured').checked=!!b.is_featured;$('#bookBestseller').checked=!!b.is_bestseller;$('#bookPreorder').checked=!!b.is_preorder;$('#bookTrackStock').checked=b.track_stock!==false;$('#bookCoverUrl').value=b.cover_url||'';$('#bookSpineCoverUrl').value=b.cover_spine_url||'';$('#bookBackCoverUrl').value=b.cover_back_url||'';$('#bookCoverMode').value=b.cover_mode||'flat';$('#bookThickness').value=b.book_thickness_mm??'';$('#coverPreview').innerHTML=b.cover_url?`<img src="${esc(b.cover_url)}" alt="">`:'Pa kopertinë';refreshBook3dPreview();renderBookGalleryFields(b.gallery_urls||[]);$('#deleteBookBtn').hidden=false;await Promise.all([renderStockHistory(b.id,showHistory),loadBookEbookLink(b.id)])}
  $('#bookModal').hidden=false;if(showHistory)setTimeout(()=>$('#stockHistoryBox')?.scrollIntoView({behavior:'smooth',block:'center'}),50);
}
async function renderStockHistory(bookId,expand=true){
  const actions=$('#bookForm .modal-actions');if(!actions)return;let box=$('#stockHistoryBox');if(!box){box=document.createElement('div');box.id='stockHistoryBox';box.className='stock-history-box';actions.parentNode.insertBefore(box,actions)}
  if(!expand){box.innerHTML='<button type="button" class="table-action" id="loadStockHistoryBtn">Shfaq historikun e stokut</button>';$('#loadStockHistoryBtn').onclick=()=>renderStockHistory(bookId,true);return}
  box.innerHTML='<strong>Historiku i stokut</strong><div class="muted-small">Duke ngarkuar…</div>';
  try{const rows=(await edge('store-admin-ops',{action:'stock_history',book_id:bookId}))?.rows||[];box.innerHTML=`<strong>Historiku i stokut</strong><div class="stock-history-list">${rows.map(r=>`<div class="stock-history-row"><span>${fmtDate(r.created_at)} · ${esc(r.source)}</span><span>${r.old_quantity} → ${r.new_quantity}</span><span class="${Number(r.delta)>=0?'delta-plus':'delta-minus'}">${Number(r.delta)>=0?'+':''}${r.delta}</span></div>`).join('')||'<div class="empty-state">Ende pa lëvizje stoku.</div>'}</div>`}catch(e){box.innerHTML=`<strong>Historiku i stokut</strong><div class="muted-small">${esc(e.message)}</div>`}
}
async function uploadCover(file,bookId){
  if(!file)return $('#bookCoverUrl').value||null;if(file.size>5*1024*1024)throw new Error('Kopertina është mbi 5 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Formati i kopertinës nuk pranohet.');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',path=`${bookId||crypto.randomUUID()}/${Date.now()}.${ext}`;
  const r=await fetch(`${SB_URL}/storage/v1/object/book-covers/${path}`,{method:'POST',headers:{apikey:SB_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':file.type,'x-upsert':'true'},body:file});if(!r.ok)throw new Error('Ngarkimi i kopertinës dështoi.');return `${SB_URL}/storage/v1/object/public/book-covers/${path}`;
}
async function saveBook(e){
  e.preventDefault();const id=$('#bookId').value||null,provisionalId=id||crypto.randomUUID(),oldStock=activeBook?Number(activeBook.stock_quantity||0):null;
  try{const[cover,spine,back,galleryUrls]=await Promise.all([uploadCover($('#bookCover').files?.[0],provisionalId),uploadBook3dAsset($('#bookSpineCover').files?.[0],provisionalId,'spine',$('#bookSpineCoverUrl').value),uploadBook3dAsset($('#bookBackCover').files?.[0],provisionalId,'back',$('#bookBackCoverUrl').value),uploadGalleryImages(provisionalId)]);const requestedMode=$('#bookCoverMode').value||'flat',coverMode=requestedMode==='3d'&&cover&&spine&&back?'3d':'flat',body={id:provisionalId,sku:$('#bookSku').value.trim(),isbn:$('#bookIsbn').value.trim()||null,title:$('#bookTitle').value.trim(),slug:$('#bookSlug').value.trim()||slugify($('#bookTitle').value),short_description:$('#bookShort').value.trim()||null,description:$('#bookDescription').value.trim()||null,author_id:$('#bookAuthor').value||null,category_id:$('#bookCategory').value||null,publisher_id:$('#bookPublisher').value||null,price:Number($('#bookPrice').value),compare_at_price:$('#bookOldPrice').value?Number($('#bookOldPrice').value):null,badge_text:$('#bookBadgeText').value.trim()||null,badge_style:$('#bookBadgeStyle').value||'default',offer_ends_at:$('#bookOfferEnds').value?new Date($('#bookOfferEnds').value).toISOString():null,format:$('#bookFormat').value,language:$('#bookLanguage').value.trim()||'sq',pages:$('#bookPages').value?Number($('#bookPages').value):null,release_date:$('#bookReleaseDate').value||null,country:$('#bookCountry').value.trim()||null,dimensions:$('#bookDimensions').value.trim()||null,weight_grams:$('#bookWeight').value?Number($('#bookWeight').value):null,cost_price:$('#bookCostPrice').value?Number($('#bookCostPrice').value):null,cover_url:cover,cover_spine_url:spine,cover_back_url:back,cover_mode:coverMode,book_thickness_mm:$('#bookThickness').value?Number($('#bookThickness').value):null,gallery_urls:galleryUrls,status:$('#bookStatus').value,is_featured:$('#bookFeatured').checked,is_bestseller:$('#bookBestseller').checked,is_preorder:$('#bookPreorder').checked,track_stock:$('#bookTrackStock').checked,stock_quantity:Number($('#bookStock').value||0),low_stock_threshold:Number($('#bookLowStock').value||5),updated_at:new Date().toISOString()};if(requestedMode==='3d'&&coverMode!=='3d')toast('Pamja 3D kërkon para + shpinë + prapa. U ruajt si Flat.','error');if(id)delete body.id;if(id)await api(`books?id=eq.${id}`,{method:'PATCH',body,prefer:'return=minimal'});else await api('books',{method:'POST',body,prefer:'return=minimal'});await saveBookEbookLink(id||provisionalId);if(id&&oldStock!==null&&oldStock<=0&&body.stock_quantity>0){try{await edge('process-notifications',{book_id:id})}catch(err){if(!String(err?.message||err).includes('EMAIL_NOT_CONFIGURED'))console.warn('stock alert',err)}}await logAudit(id?'update_book':'create_book','book',id||provisionalId,{title:body.title,sku:body.sku,status:body.status,stock_quantity:body.stock_quantity,gallery_images:galleryUrls.length});$('#bookModal').hidden=true;await Promise.all([loadBooks(),loadAudit()]);renderBooks();renderDashboard();renderAudit();toast('Libri u ruajt')}catch(e){toast(e.message,'error')}
}
async function deleteBook(){
  if(!activeBook||!confirm(`Ta fshij librin “${activeBook.title}”?`))return;
  try{const id=activeBook.id,title=activeBook.title;await api(`books?id=eq.${id}`,{method:'DELETE'});await logAudit('delete_book','book',id,{title});$('#bookModal').hidden=true;await Promise.all([loadBooks(),loadAudit()]);renderBooks();renderDashboard();renderAudit();toast('Libri u fshi')}catch(e){toast('Libri mund të jetë i lidhur me porosi. Përdor Archived në vend të fshirjes.','error')}
}

function renderEntities(){const render=(id,arr,type)=>{$(id).innerHTML=arr.map(x=>`<div class="entity-row"><div><strong>${esc(x.name)}</strong><small>${esc(x.slug||'')}</small></div><div><button class="table-action small-btn" data-toggle-entity="${type}:${x.id}:${x.is_active!==false}">${x.is_active!==false?'Çaktivizo':'Aktivizo'}</button></div></div>`).join('')};render('#authorsList',authors,'authors');render('#categoriesList',categories,'categories');render('#publishersList',publishers,'publishers');$$('[data-toggle-entity]').forEach(b=>b.onclick=()=>toggleEntity(b.dataset.toggleEntity))}
async function addEntity(type){const map={authors:'#authorName',categories:'#categoryName',publishers:'#publisherName'},input=$(map[type]),name=input.value.trim();if(!name)return;try{const body={name,slug:slugify(name),is_active:true};if(type==='categories')body.sort_order=categories.length;const d=await api(type,{method:'POST',body,prefer:'return=representation'});input.value='';await logAudit('create_'+type.slice(0,-1),type.slice(0,-1),d?.[0]?.id||null,{name});await Promise.all([loadRefs(),loadAudit()]);renderEntities();renderAudit();toast('U shtua')}catch(e){toast(e.message,'error')}}
async function toggleEntity(spec){const[type,id,active]=spec.split(':');try{await api(`${type}?id=eq.${id}`,{method:'PATCH',body:{is_active:active!=='true',updated_at:new Date().toISOString()},prefer:'return=minimal'});await logAudit('toggle_'+type.slice(0,-1),type.slice(0,-1),id,{is_active:active!=='true'});await Promise.all([loadRefs(),loadAudit()]);renderEntities();renderAudit()}catch(e){toast(e.message,'error')}}

function renderCustomers(){
  const q=($('#customerSearch')?.value||'').toLowerCase(),rows=customers.filter(c=>!q||`${c.email||''} ${c.first_name||''} ${c.last_name||''} ${c.phone||''}`.toLowerCase().includes(q));
  $('#customersList').innerHTML=rows.map(c=>{const po=c.physical_orders_count??c.orders_count??0,ps=c.physical_spent??c.total_spent??0,eo=c.ebook_orders_count??0,es=c.ebook_spent??0,total=c.total_spent??(Number(ps)+Number(es));return `<article class="customer-card"><div class="customer-card-top"><div><strong>${esc(c.first_name||'')} ${esc(c.last_name||'')}</strong><div class="muted-small">${esc(c.email||'')} · ${esc(c.phone||'—')}</div><div class="customer-mini-grid"><span>Fizike<b>${po}</b></span><span>eBook<b>${eo}</b></span><span>Shpenzuar<b>${money(total)}</b></span><span>Aktiviteti<b>${fmtDay(c.last_activity||c.created_at)}</b></span></div></div><div class="customer-actions"><button class="table-action" data-customer-id="${c.user_id}">Detaje</button></div></div></article>`}).join('')||'<div class="empty-state">Nuk ka klientë.</div>';
  $$('[data-customer-id]').forEach(b=>b.onclick=()=>openCustomer(b.dataset.customerId));
}
async function openCustomer(userId){
  activeCustomer=userId;$('#customerDrawer').hidden=false;$('#customerDetail').innerHTML='<div class="empty-state">Duke ngarkuar profilin…</div>';
  try{const d=await api('rpc/admin_customer_detail',{method:'POST',body:{p_user_id:userId}}),p=d?.profile||{},addresses=d?.addresses||[],po=d?.orders||[],ebooks=d?.ebooks||[],wish=d?.wishlist||[];$('#customerDetail').innerHTML=`<div class="detail-head"><div class="eyebrow">KLIENTI</div><h2>${esc(p.first_name||'')} ${esc(p.last_name||'')}</h2><div class="muted-small">${esc(p.email||'—')} · ${esc(p.phone||'—')}</div></div><div class="customer-detail-grid"><div class="detail-box"><span>Llogaria</span><strong>${esc(p.email||'—')}</strong><div class="cell-sub">Që nga ${fmtDate(p.created_at)}</div></div><div class="detail-box"><span>Aktiviteti</span><strong>${po.length} fizike · ${ebooks.length} eBook</strong><div class="cell-sub">${wish.length} në wishlist</div></div></div><div class="customer-detail-section"><h3>Adresat</h3>${addresses.map(a=>`<div class="customer-list-row"><div><strong>${esc(a.label||'Adresë')}</strong><br><small>${esc(a.address_line1)}, ${esc(a.postal_code||'')} ${esc(a.city)}, ${esc(a.country_code)}</small></div><span>${a.is_default?'Default':''}</span></div>`).join('')||'<div class="empty-state">Pa adresa.</div>'}</div><div class="customer-detail-section"><h3>Porositë fizike</h3>${po.map(o=>`<div class="customer-list-row"><div><strong>${esc(o.order_number)}</strong><br><small>${fmtDate(o.created_at)} · ${statusLabel(o.order_status)}</small></div><span>${money(o.total)}</span></div>`).join('')||'<div class="empty-state">Pa porosi fizike.</div>'}</div><div class="customer-detail-section"><h3>eBook</h3>${ebooks.map(e=>`<div class="customer-list-row"><div><strong>${esc(e.title||e.order_number||'eBook')}</strong><br><small>${fmtDate(e.created_at)} · ${statusLabel(e.payment_status)} · ${e.downloads_used??0}/${e.max_downloads??0} shkarkime</small></div><span>${money(e.total)}</span></div>`).join('')||'<div class="empty-state">Pa eBook.</div>'}</div><div class="customer-detail-section"><h3>Wishlist</h3>${wish.map(w=>`<div class="customer-list-row"><div><strong>${esc(w.title)}</strong><br><small>${esc(w.sku||'')} · ${fmtDate(w.created_at)}</small></div></div>`).join('')||'<div class="empty-state">Wishlist bosh.</div>'}</div>`}catch(e){$('#customerDetail').innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}

function couponScopeOptions(type,selected=[]){const sel=new Set((selected||[]).map(String)),wrap=$('#couponScopeWrap'),box=$('#couponScopeIds');if(!wrap||!box)return;wrap.hidden=type==='all';if(type==='all'){box.innerHTML='';return}const rows=type==='books'?books:categories;box.innerHTML=rows.map(x=>`<option value="${x.id}" ${sel.has(String(x.id))?'selected':''}>${esc(type==='books'?(x.title||x.sku||'Libër'):(x.name||'Kategori'))}</option>`).join('')}
function selectedCouponScopeIds(){return $('#couponScopeIds option:checked').map(x=>x.value)}
function resetCoupon(){const f=$('#couponForm');if(f)f.reset();$('#couponId').value='';$('#couponMin').value='0';$('#couponCustomerLimit').value='';$('#couponFirstOrder').checked=false;$('#couponScopeType').value='all';couponScopeOptions('all',[]);$('#couponPaypal').checked=true;$('#couponActive').value='true'}
function renderCoupons(){$('#couponsList').innerHTML=coupons.map(c=>`<article class="coupon-card"><div class="coupon-card-top"><div><strong>${esc(c.code)}</strong><div class="muted-small">${c.discount_type==='percentage'?c.discount_value+'%':money(c.discount_value)} · përdorur ${c.usage_count}${c.usage_limit?'/'+c.usage_limit:''} · ${c.scope_type==='books'?'libra të caktuar':c.scope_type==='categories'?'kategori të caktuara':'të gjithë librat'}${c.usage_limit_per_customer?' · max '+c.usage_limit_per_customer+'/klient':''}${c.first_order_only?' · vetëm porosia e parë':''}</div></div><div>${c.is_active?'<span class="status-pill status-paid">Aktiv</span>':'<span class="status-pill">Joaktiv</span>'} <button class="table-action" data-edit-coupon="${c.id}">Edito</button> <button class="danger-btn small-btn" data-delete-coupon="${c.id}">Fshi</button></div></div></article>`).join('')||'<div class="empty-state">Nuk ka kupona.</div>';$$('[data-edit-coupon]').forEach(b=>b.onclick=()=>editCoupon(b.dataset.editCoupon));$$('[data-delete-coupon]').forEach(b=>b.onclick=()=>deleteCoupon(b.dataset.deleteCoupon))}
function editCoupon(id){const c=coupons.find(x=>x.id===id);if(!c)return;$('#couponId').value=c.id;$('#couponCode').value=c.code;$('#couponType').value=c.discount_type;$('#couponValue').value=c.discount_value;$('#couponMin').value=c.min_order_amount||0;$('#couponMax').value=c.max_discount_amount??'';$('#couponLimit').value=c.usage_limit??'';$('#couponCustomerLimit').value=c.usage_limit_per_customer??'';$('#couponFirstOrder').checked=!!c.first_order_only;$('#couponScopeType').value=c.scope_type||'all';couponScopeOptions(c.scope_type||'all',c.scope_ids||[]);$('#couponStart').value=c.starts_at?new Date(c.starts_at).toISOString().slice(0,16):'';$('#couponEnd').value=c.ends_at?new Date(c.ends_at).toISOString().slice(0,16):'';$('#couponActive').value=String(c.is_active);$('#couponPaypal').checked=c.allow_with_paypal!==false;$('#couponCode').scrollIntoView({behavior:'smooth',block:'center'})}
async function saveCoupon(e){
  e.preventDefault();const id=$('#couponId').value,scopeType=$('#couponScopeType').value||'all',scopeIds=scopeType==='all'?[]:selectedCouponScopeIds();if(scopeType!=='all'&&!scopeIds.length){toast('Zgjidh të paktën një libër ose kategori për kuponin.','error');return}const body={code:$('#couponCode').value.trim().toUpperCase(),discount_type:$('#couponType').value,discount_value:Number($('#couponValue').value),min_order_amount:Number($('#couponMin').value||0),max_discount_amount:$('#couponMax').value?Number($('#couponMax').value):null,usage_limit:$('#couponLimit').value?Number($('#couponLimit').value):null,usage_limit_per_customer:$('#couponCustomerLimit').value?Number($('#couponCustomerLimit').value):null,first_order_only:$('#couponFirstOrder').checked,scope_type:scopeType,scope_ids:scopeIds,starts_at:$('#couponStart').value?new Date($('#couponStart').value).toISOString():null,ends_at:$('#couponEnd').value?new Date($('#couponEnd').value).toISOString():null,is_active:$('#couponActive').value==='true',allow_with_paypal:$('#couponPaypal').checked,updated_at:new Date().toISOString()};
  try{let entityId=id;if(id)await api(`coupons?id=eq.${id}`,{method:'PATCH',body,prefer:'return=minimal'});else{const d=await api('coupons',{method:'POST',body,prefer:'return=representation'});entityId=d?.[0]?.id||null}await logAudit(id?'update_coupon':'create_coupon','coupon',entityId,{code:body.code,is_active:body.is_active});resetCoupon();await Promise.all([loadCoupons(),loadAudit()]);renderCoupons();renderAudit();toast('Kuponi u ruajt')}catch(e){toast(e.message,'error')}
}
async function deleteCoupon(id){if(!confirm('Ta fshij kuponin?'))return;try{const c=coupons.find(x=>x.id===id);await api(`coupons?id=eq.${id}`,{method:'DELETE'});await logAudit('delete_coupon','coupon',id,{code:c?.code||null});await Promise.all([loadCoupons(),loadAudit()]);renderCoupons();renderAudit()}catch(e){toast('Kuponi mund të jetë përdorur. Çaktivizoje në vend të fshirjes.','error')}}
function renderReviews(){$('#reviewsList').innerHTML=reviews.map(r=>`<article class="review-card"><div class="review-card-top"><div><strong>${esc(r.title||'Review')}</strong><div class="review-stars">${'★'.repeat(Number(r.rating||0))}</div><p>${esc(r.body||'')}</p><div class="muted-small">${fmtDate(r.created_at)} · ${esc(statusLabel(r.status))}</div></div><div><button class="table-action" data-review-status="${r.id}:approved">Aprovo</button> <button class="danger-btn small-btn" data-review-status="${r.id}:rejected">Refuzo</button></div></div></article>`).join('')||'<div class="empty-state">Nuk ka review.</div>';$$('[data-review-status]').forEach(b=>b.onclick=()=>setReviewStatus(b.dataset.reviewStatus))}
async function setReviewStatus(spec){const[id,status]=spec.split(':');try{await api(`reviews?id=eq.${id}`,{method:'PATCH',body:{status,updated_at:new Date().toISOString()},prefer:'return=minimal'});await logAudit('review_'+status,'review',id,{status});await Promise.all([loadReviews(),loadAudit()]);renderReviews();renderAudit();toast('Review u përditësua')}catch(e){toast(e.message,'error')}}

function renderAudit(){const q=($('#auditSearch')?.value||'').toLowerCase(),rows=auditRows.filter(a=>!q||`${a.action} ${a.entity_type} ${a.entity_id||''} ${JSON.stringify(a.details||{})}`.toLowerCase().includes(q));if($('#auditList'))$('#auditList').innerHTML=rows.map(a=>`<div class="audit-row"><div><strong>${esc(a.action.replaceAll('_',' '))}</strong><small>${esc(a.entity_type)}${a.entity_id?' · '+esc(a.entity_id):''}</small></div><div><small>${fmtDate(a.created_at)}</small></div><div class="audit-details" title="${esc(JSON.stringify(a.details||{}))}">${esc(JSON.stringify(a.details||{}))}</div></div>`).join('')||'<div class="empty-state">Nuk ka veprime në Audit Log.</div>'}
function renderIntegrations(){
  const set=(id,ok,text)=>{const e=$(id);if(!e)return;e.textContent=text;e.className='integration-state '+(ok?'ready':'warn')};
  if(!integrations){set('#paypalState',false,'Nuk u verifikua');set('#emailState',false,'Nuk u verifikua');set('#supabaseState',false,'Nuk u verifikua');set('#securityState',false,'Nuk u verifikua');return}
  set('#paypalState',!!integrations.paypal?.configured,integrations.paypal?.configured?`Aktiv · ${String(integrations.paypal.mode||'').toUpperCase()}`:'Kërkon konfigurim');set('#emailState',!!integrations.email?.configured,integrations.email?.configured?`Aktiv · ${integrations.email.from||''}`:'Kërkon konfigurim');set('#supabaseState',!!integrations.supabase?.configured,integrations.supabase?.configured?'Aktiv':'Kërkon konfigurim');set('#securityState',!!integrations.security?.admin_verified,integrations.security?.admin_verified?'RLS + Admin Auth aktiv':'Kontrollo konfigurimin');
}
async function testStoreEmail(){const b=$('#storeEmailTestBtn');if(b)b.disabled=true;try{const d=await edge('store-admin-ops',{action:'test_email'});toast(`Emaili testues u dërgua te ${d.email}`);await loadAudit();renderAudit();renderDashboard()}catch(e){toast(e.message,'error')}finally{if(b)b.disabled=false}}

function setView(name){if(!name)return;if(name==='admins'&&!currentAdminAccess?.is_owner){toast('Vetëm Owner-i mund t’i menaxhojë administratorët.','error');return}if(!hasAdminPermission(name)&&!currentAdminAccess?.full_access){toast('Nuk ke qasje në këtë seksion.','error');return}$$('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.view').forEach(v=>v.classList.toggle('active-view',v.id===`view-${name}`));$('#viewTitle').textContent={dashboard:'Dashboard',orders:'Porositë',books:'Librat fizikë',catalog:'Katalogu',customers:'Klientët',coupons:'Kuponët',reviews:'Review',audit:'Audit Log',integrations:'Integrimet'}[name]||name;if(window.innerWidth<=760)$('.sidebar')?.classList.remove('mobile-open')}
function bind(){
  $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('#loginBtn'),email=$('#adminEmail').value.trim().toLowerCase();setButtonBusy(b,true,'Duke hyrë…');try{saveSession(await login(email,$('#adminPassword').value));await enterAdmin()}catch(err){authMessage(String(err.message||'').includes('Invalid login credentials')?'Emaili ose fjalëkalimi nuk është i saktë.':err.message,'error')}finally{setButtonBusy(b,false)}});$('#logoutBtn').onclick=logout;
  $('#adminPasswordToggle')?.addEventListener('click',()=>{const input=$('#adminPassword'),button=$('#adminPasswordToggle'),show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Fshih':'Shfaq';button.setAttribute('aria-label',show?'Fshih fjalëkalimin':'Shfaq fjalëkalimin')});
  $$('.nav-item[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$$('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
  $('#refreshBtn').onclick=async()=>{const b=$('#refreshBtn');setButtonBusy(b,true,'…');try{await loadAll();toast('Të dhënat u rifreskuan')}catch(e){setAdminSync('Sinkronizimi dështoi',false);toast(e.message,'error')}finally{setButtonBusy(b,false)}};
  $('#orderSearch').oninput=renderOrders;$('#orderStatusFilter').onchange=renderOrders;if($('#paymentStatusFilter'))$('#paymentStatusFilter').onchange=renderOrders;$('#bookSearch').oninput=renderBooks;$('#bookStatusFilter').onchange=renderBooks;$('#customerSearch').oninput=renderCustomers;if($('#auditSearch'))$('#auditSearch').oninput=renderAudit;if($('#refreshAuditBtn'))$('#refreshAuditBtn').onclick=async()=>{await loadAudit();renderAudit();renderDashboard();toast('Audit u rifreskua')};if($('#storeEmailTestBtn'))$('#storeEmailTestBtn').onclick=testStoreEmail;
  $('#newBookBtn').onclick=()=>{resetBookForm();$('#bookModal').hidden=false};$('#bookTitle').addEventListener('input',()=>{if(!$('#bookId').value&&!$('#bookSlug').dataset.manual)$('#bookSlug').value=slugify($('#bookTitle').value)});$('#bookSlug').addEventListener('input',()=>$('#bookSlug').dataset.manual='1');$('#bookForm').addEventListener('submit',saveBook);$('#deleteBookBtn').onclick=deleteBook;$('#bookCover').addEventListener('change',()=>{const f=$('#bookCover').files?.[0];if(f){const u=URL.createObjectURL(f);$('#coverPreview').innerHTML=`<img src="${u}" alt="">`}refreshBook3dPreview()});$('#bookSpineCover')?.addEventListener('change',refreshBook3dPreview);$('#bookBackCover')?.addEventListener('change',refreshBook3dPreview);$('#bookCoverMode')?.addEventListener('change',refreshBook3dPreview);
  $$('[data-close]').forEach(b=>b.onclick=()=>{if(b.dataset.close==='book')$('#bookModal').hidden=true;if(b.dataset.close==='order')$('#orderDrawer').hidden=true;if(b.dataset.close==='customer')$('#customerDrawer').hidden=true});$$('[data-add-entity]').forEach(b=>b.onclick=()=>addEntity(b.dataset.addEntity));$('#couponForm').addEventListener('submit',saveCoupon);$('#resetCouponBtn').onclick=resetCoupon;$('#couponScopeType')?.addEventListener('change',e=>couponScopeOptions(e.target.value,[]));$('.mobile-menu-btn').onclick=()=>$('.sidebar')?.classList.toggle('mobile-open');
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#bookModal')?.hidden)$('#bookModal').hidden=true;else if(!$('#orderDrawer')?.hidden)$('#orderDrawer').hidden=true;else if(!$('#customerDrawer')?.hidden)$('#customerDrawer').hidden=true;else $('.sidebar')?.classList.remove('mobile-open')});
}
async function init(){injectAdminPro();loadSession();bind();if(session)await enterAdmin();else{$('#authScreen').hidden=false;$('#adminApp').hidden=true}}
document.addEventListener('DOMContentLoaded',init);
if(!document.querySelector('script[data-admin-advanced]')){const s=document.createElement('script');s.src='assets/js/admin-advanced.js?v=1';s.dataset.adminAdvanced='1';document.body.appendChild(s)}
