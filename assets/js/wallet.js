(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION='zemzem_customer_session';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=v=>Number(v||0).toFixed(2)+' €';
let session=null;
function read(){try{return JSON.parse(localStorage.getItem(SESSION)||'null')}catch{return null}}
function save(d,old){if(!d?.access_token)return null;const s={access_token:d.access_token,refresh_token:d.refresh_token||old?.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number(d.expires_in)||3600),user:d.user||old?.user||null};localStorage.setItem(SESSION,JSON.stringify(s));return s}
async function ensure(){session=read();if(!session?.access_token)return false;if((session.expires_at||0)-Math.floor(Date.now()/1000)<90&&session.refresh_token){const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token}),cache:'no-store'});if(!r.ok)return false;session=save(await r.json(),session)}return !!session?.access_token}
async function call(path,{method='GET',body}={}){if(!await ensure())throw new Error('Duhet të hysh në llogari.');const h={apikey:KEY,Authorization:'Bearer '+session.access_token};if(body!==undefined)h['Content-Type']='application/json';const r=await fetch(SB+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(d?.message||d?.error||'Kërkesa dështoi.');return d}
function kindLabel(k){return({topup:'Mbushje',purchase:'Blerje',refund:'Refund',admin_credit:'Kredit nga Admin',admin_debit:'Zbritje nga Admin',reversal:'Kthim',bonus:'Bonus'})[k]||k}
function date(v){try{return new Date(v).toLocaleString('sq-AL')}catch{return String(v||'')}}
async function load(){
 const root=$('#walletHistory'),bal=$('#walletBalance'),status=$('#walletStatus'),nav=$('#walletNavBalance');
 if(!root||!await ensure())return;
 try{
   const [b,tx]=await Promise.all([
     call('/rest/v1/rpc/wallet_balance',{method:'POST',body:{}}),
     call('/rest/v1/wallet_transactions?select=id,amount,balance_after,kind,description,reference_type,created_at&order=created_at.desc&limit=100')
   ]);
   if(bal)bal.textContent=money(b.balance);
   if(nav)nav.textContent=money(b.balance);
   if(status)status.textContent=b.status==='active'?'Aktiv':b.status==='frozen'?'I ngrirë':'I mbyllur';
   root.innerHTML=(tx||[]).length?(tx||[]).map(x=>`<article class="wallet-tx"><div><b>${esc(kindLabel(x.kind))}</b><small>${esc(x.description||'ZemZem Wallet')} · ${date(x.created_at)}</small></div><div class="wallet-tx-money ${Number(x.amount)>=0?'plus':'minus'}">${Number(x.amount)>=0?'+':''}${money(x.amount)}<small>Balanca: ${money(x.balance_after)}</small></div></article>`).join(''):'<div class="empty-state">Ende nuk ka transaksione.</div>';
 }catch(e){root.innerHTML='<div class="empty-state">'+esc(e.message)+'</div>'}
}
async function topup(e){
 e?.preventDefault();const amount=Number($('#walletTopupAmount')?.value||0),btn=$('#walletTopupBtn');
 if(!(amount>=5&&amount<=1000)){alert('Shuma duhet të jetë nga 5 € deri 1000 €.');return}
 const old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Po hapet PayPal…'}
 try{
   const token=crypto.randomUUID();
   const d=await call('/functions/v1/wallet-topup-create',{method:'POST',body:{amount,checkout_token:token}});
   if(!d?.approve_url)throw new Error('PayPal nuk ktheu linkun e pagesës.');
   localStorage.setItem('zemzem_wallet_topup_token',token);
   location.href=d.approve_url;
 }catch(err){alert(err.message||'Mbushja nuk mund të fillojë.');if(btn){btn.disabled=false;btn.textContent=old||'Mbush Wallet-in'}}
}
function init(){
 const form=$('#walletTopupForm');if(form)form.addEventListener('submit',topup);
 document.querySelectorAll('[data-wallet-amount]').forEach(b=>b.addEventListener('click',()=>{const i=$('#walletTopupAmount');if(i)i.value=b.dataset.walletAmount}));
 $('#walletRefresh')?.addEventListener('click',load);
 const q=new URLSearchParams(location.search);if(q.get('wallet')==='cancel')setTimeout(()=>alert('Mbushja e Wallet-it u anulua. Asnjë pagesë nuk u mor.'),100);
 load();
}
window.ZemZemWallet={load};
document.addEventListener('DOMContentLoaded',init);
})();