(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION='zemzem_admin_session';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let state={entitlements:[],books:[],devices:[],orders:[],rentals:[],preorders:[]};
function readSession(){try{return JSON.parse(sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function saveSession(d){if(!d?.access_token)return null;const s={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number(d.expires_in)||3600),user:d.user||null};sessionStorage.setItem(SESSION,JSON.stringify(s));return s}
async function refreshSession(){
  const s=readSession();if(!s?.refresh_token)return null;
  const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token}),cache:'no-store'});
  if(!r.ok){sessionStorage.removeItem(SESSION);return null}
  return saveSession(await r.json());
}
async function validToken(force=false){
  let s=readSession();if(!s)return '';
  if(force||(s.expires_at||0)-Math.floor(Date.now()/1000)<120)s=await refreshSession();
  return s?.access_token||'';
}
async function call(action,body={}){
  let tok=await validToken(false);if(!tok)throw new Error('LOGIN_REQUIRED');
  const send=async token=>{
    const r=await fetch(SB+'/functions/v1/ebook-admin-licenses',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action,...body}),cache:'no-store'});
    const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}
    return{r,d};
  };
  let x=await send(tok);
  if(!x.r.ok&&(/INVALID_SESSION|LOGIN_REQUIRED/i.test(String(x.d?.error||x.d?.message||''))||x.r.status===401)){
    tok=await validToken(true);if(!tok)throw new Error('LOGIN_REQUIRED');x=await send(tok);
  }
  if(!x.r.ok)throw new Error(x.d?.message||x.d?.error||'Veprimi dështoi');
  return x.d;
}
function toast(msg,err=false){const e=$('#ebookAdminToast');if(!e)return alert(msg);e.textContent=msg;e.className='ebook-admin-toast'+(err?' error':'');e.hidden=false;clearTimeout(window.__licToast);window.__licToast=setTimeout(()=>e.hidden=true,2600)}
function date(v){if(!v)return'—';try{return new Date(v).toLocaleString('sq-AL')}catch{return String(v)}}
function short(v,n=14){const s=String(v||'');return s.length>n?s.slice(0,n)+'…':s}
function maps(){return{books:new Map(state.books.map(x=>[String(x.id),x])),orders:new Map(state.orders.map(x=>[String(x.id),x]))}}
function entitlementStatus(e){if(!e.is_active)return'inactive';if(e.access_expires_at&&new Date(e.access_expires_at)<=new Date())return'expired';return'active'}
function typeFor(e){const rental=state.rentals.find(r=>String(r.ebook_order_id||'')===String(e.ebook_order_id||'')&&String(r.ebook_id)===String(e.ebook_id));if(rental)return'Rental';const preorder=state.preorders.find(p=>String(p.ebook_order_id||'')===String(e.ebook_order_id||'')&&String(p.ebook_id)===String(e.ebook_id));if(preorder)return'Pre-order';if(!e.ebook_order_id)return'Gift';return'Blerje'}
function render(){
 const {books,orders}=maps(),q=String($('#ebookLicenseSearch')?.value||'').toLowerCase(),filter=$('#ebookLicenseStatus')?.value||'';
 const activeDevices=state.devices.filter(d=>d.is_active).length,activeRentals=state.rentals.filter(r=>r.status==='active'&&new Date(r.ends_at)>new Date()).length,pendingPre=state.preorders.filter(p=>p.status==='paid'&&new Date(p.release_at)>new Date()).length;
 $('#ebookLicenseStatTotal').textContent=state.entitlements.length;
 $('#ebookLicenseStatActive').textContent=state.entitlements.filter(e=>entitlementStatus(e)==='active').length;
 $('#ebookLicenseStatDevices').textContent=activeDevices;$('#ebookLicenseStatRentals').textContent=activeRentals;$('#ebookLicenseStatPreorders').textContent=pendingPre;
 const rows=state.entitlements.filter(e=>{const b=books.get(String(e.ebook_id))||{},o=orders.get(String(e.ebook_order_id))||{},st=entitlementStatus(e),hay=[b.title,b.author_name,o.customer_email,o.order_number,e.license_code,e.user_id].join(' ').toLowerCase();return(!filter||st===filter)&&(!q||hay.includes(q))});
 const root=$('#ebookLicensesList');
 root.innerHTML=rows.length?rows.map(e=>{const b=books.get(String(e.ebook_id))||{},o=orders.get(String(e.ebook_order_id))||{},devs=state.devices.filter(d=>String(d.entitlement_id)===String(e.id)&&d.is_active),st=entitlementStatus(e),type=typeFor(e);return `<article class="ebook-license-card"><div><h4>${esc(b.title||'eBook')}</h4><div class="ebook-license-meta">${esc(b.author_name||'ZemZem')} · <b>${type}</b><br>${esc(o.customer_email||e.user_id)}${o.order_number?' · '+esc(o.order_number):''}</div></div><div><span class="ebook-license-status ${st}">${st==='active'?'Aktive':st==='expired'?'Skaduar':'Joaktive'}</span><div class="ebook-license-meta">Licenca: <span class="ebook-license-code">${esc(e.license_code||short(e.id))}</span><br>Skadon: ${date(e.access_expires_at)}</div></div><div class="ebook-license-meta">Shkarkime: <b>${Number(e.downloads_used||0)} / ${Number(e.max_downloads||0)}</b><br>Pajisje: <b>${devs.length} / ${Number(e.device_limit||3)}</b></div><div class="ebook-license-actions">${st==='active'?'<button class="ebook-secondary" data-lic-action="revoke" data-id="'+e.id+'">Çaktivizo</button>':'<button class="ebook-secondary" data-lic-action="reactivate" data-id="'+e.id+'">Aktivizo</button>'}<button class="ebook-secondary" data-lic-action="reset_downloads" data-id="${e.id}">Reset download</button><button class="ebook-secondary" data-lic-action="devices" data-id="${e.id}" data-limit="${Number(e.device_limit||3)}">Limit pajisjesh</button><button class="ebook-secondary" data-lic-action="deactivate_devices" data-id="${e.id}">Reset pajisje</button></div></article>`}).join(''):'<div class="ebook-admin-empty">Nuk u gjet licencë.</div>';
 bindActions();renderAutomation(books,orders);
}
function renderAutomation(books,orders){
 const rr=$('#ebookRentalAutomationList'),pp=$('#ebookPreorderAutomationList');
 const rentals=[...state.rentals].sort((a,b)=>new Date(b.ends_at)-new Date(a.ends_at)).slice(0,30);
 rr.innerHTML=rentals.length?rentals.map(r=>{const b=books.get(String(r.ebook_id))||{},o=orders.get(String(r.ebook_order_id))||{},expired=r.status!=='active'||new Date(r.ends_at)<=new Date();return `<div class="ebook-auto-row"><span><b>${esc(b.title||'eBook')}</b><small>${esc(o.customer_email||r.user_id)}</small></span><span class="ebook-license-status ${expired?'expired':'active'}">${expired?'Skaduar':'Aktiv'} · ${date(r.ends_at)}</span></div>`}).join(''):'<div class="ebook-admin-empty">Nuk ka rental.</div>';
 const pre=[...state.preorders].sort((a,b)=>new Date(b.release_at)-new Date(a.release_at)).slice(0,30);
 pp.innerHTML=pre.length?pre.map(p=>{const b=books.get(String(p.ebook_id))||{};const done=p.status==='released';return `<div class="ebook-auto-row"><span><b>${esc(b.title||'eBook')}</b><small>${esc(p.customer_email||p.user_id)}</small></span><span class="ebook-license-status ${done?'active':''}">${done?'Released':'Në pritje'} · ${date(p.release_at)}</span></div>`}).join(''):'<div class="ebook-admin-empty">Nuk ka pre-order.</div>';
}
function bindActions(){
 $$('[data-lic-action]').forEach(btn=>btn.onclick=async()=>{const id=btn.dataset.id,action=btn.dataset.licAction;try{btn.disabled=true;if(action==='revoke'){if(!confirm('Ta çaktivizoj këtë licencë?'))return;await call('revoke',{entitlement_id:id,reason:'admin_revoked'})}else if(action==='reactivate')await call('reactivate',{entitlement_id:id});else if(action==='reset_downloads'){if(!confirm('T’i kthej shkarkimet në 0?'))return;await call('reset_downloads',{entitlement_id:id})}else if(action==='deactivate_devices'){if(!confirm('T’i çaktivizoj të gjitha pajisjet e kësaj licence?'))return;await call('deactivate_devices',{entitlement_id:id})}else if(action==='devices'){const v=prompt('Limiti i pajisjeve (1–20):',btn.dataset.limit||'3');if(v===null)return;await call('set_device_limit',{entitlement_id:id,device_limit:Number(v)})}toast('Licenca u përditësua');await load()}catch(e){toast(e.message,true)}finally{btn.disabled=false}});
}
async function load(){const root=$('#ebookLicensesList');if(root)root.innerHTML='<div class="ebook-admin-empty">Po ngarkohen licencat…</div>';try{state=await call('overview');render()}catch(e){if(root)root.innerHTML='<div class="ebook-admin-empty">'+esc(e.message)+'</div>'}}
async function init(){
  if(!$('#ebookTab-licenses'))return;
  $('#refreshEbookLicenses')?.addEventListener('click',load);
  $('#ebookLicenseSearch')?.addEventListener('input',render);
  $('#ebookLicenseStatus')?.addEventListener('change',render);
  for(let i=0;i<30;i++){
    if(await validToken(false)){await load();return}
    await new Promise(r=>setTimeout(r,200));
  }
  const root=$('#ebookLicensesList');if(root)root.innerHTML='<div class="ebook-admin-empty">LOGIN_REQUIRED</div>';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init,150));
})();