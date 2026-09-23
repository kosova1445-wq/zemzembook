(()=>{
'use strict';
if(window.__zzOrderLaunchReset)return;window.__zzOrderLaunchReset=1;
const q=s=>document.querySelector(s);
let owner=false;
function style(){
 if(q('#zzOrderResetStyle'))return;
 const st=document.createElement('style');st.id='zzOrderResetStyle';st.textContent=`
 .zz-order-reset{margin:0 0 16px;border:1px solid #efc9c4;background:linear-gradient(180deg,#fff9f8,#fff);border-radius:16px;padding:18px;box-shadow:0 8px 24px rgba(107,45,38,.05)}
 .zz-order-reset-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.zz-order-reset-head h3{margin:0 0 5px;color:#742f2a}.zz-order-reset-head p{margin:0;color:#7e6662;font-size:12px;line-height:1.55;max-width:760px}
 .zz-order-reset-stats{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.zz-order-reset-stat{border:1px solid #eadedb;background:#fff;border-radius:12px;padding:10px 13px;min-width:145px}.zz-order-reset-stat span{display:block;font-size:10px;color:#8d7671;font-weight:800;text-transform:uppercase}.zz-order-reset-stat strong{display:block;font-size:22px;margin-top:3px}
 .zz-order-reset-options{display:flex;gap:14px;flex-wrap:wrap;margin:12px 0}.zz-order-reset-options label{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;color:#5f514e}.zz-order-reset-options input[type=checkbox]{width:18px;height:18px}
 .zz-order-reset-confirm{display:grid;grid-template-columns:minmax(180px,260px) auto;gap:8px;align-items:end;max-width:520px}.zz-order-reset-confirm label{display:grid;gap:6px;font-size:11px;font-weight:850;color:#6a5551}.zz-order-reset-confirm input{border:1px solid #d9c6c2;border-radius:10px;padding:10px 12px}
 .zz-order-reset-btn{background:#a53d34!important;border-color:#a53d34!important;color:#fff!important}.zz-order-reset-btn:disabled{opacity:.5;cursor:not-allowed}.zz-order-reset-state{margin-top:10px;font-size:12px;font-weight:800;color:#6d5b57}.zz-order-reset-state.ok{color:#2f6a4e}.zz-order-reset-state.error{color:#a53d34}
 @media(max-width:700px){.zz-order-reset-head{flex-direction:column}.zz-order-reset-confirm{grid-template-columns:1fr}.zz-order-reset-confirm button{width:100%}}
 `;document.head.appendChild(st)
}
async function counts(){
 try{
  const [o,e]=await Promise.all([
   window.api('orders?select=id&limit=1000'),
   window.api('ebook_orders?select=id&limit=1000')
  ]);
  if(q('#zzPhysicalOrderCount'))q('#zzPhysicalOrderCount').textContent=String((o||[]).length);
  if(q('#zzEbookOrderCount'))q('#zzEbookOrderCount').textContent=String((e||[]).length);
 }catch(err){state('Numërimi dështoi: '+err.message,'error')}
}
function state(t,kind=''){const el=q('#zzOrderResetState');if(el){el.textContent=t;el.className='zz-order-reset-state'+(kind?' '+kind:'')}}
function build(){
 const view=q('#view-orders');if(!view||q('#zzOrderLaunchReset')||!owner)return false;
 style();
 const box=document.createElement('section');box.id='zzOrderLaunchReset';box.className='zz-order-reset';
 box.innerHTML=`
 <div class="zz-order-reset-head"><div><div class="eyebrow">LAUNCH RESET · OWNER ONLY</div><h3>Fillo porositë nga zero</h3><p>Përdore vetëm para hapjes zyrtare. Fshin porositë testuese nga ZemZem. Mund të rikthejë stokun e zbritur nga testet dhe, nëse zgjedh, të fshijë edhe porositë eBook testuese dhe entitlement-et e tyre.</p></div><span class="status-pill cancelled">VEPRIM I PAKTHYESHËM</span></div>
 <div class="zz-order-reset-stats"><div class="zz-order-reset-stat"><span>Porosi fizike</span><strong id="zzPhysicalOrderCount">…</strong></div><div class="zz-order-reset-stat"><span>Porosi eBook</span><strong id="zzEbookOrderCount">…</strong></div></div>
 <div class="zz-order-reset-options"><label><input id="zzRestoreTestStock" type="checkbox" checked> Rikthe stokun e librave të përdorur në test</label><label><input id="zzIncludeEbookReset" type="checkbox"> Fshi edhe porositë eBook testuese</label></div>
 <div class="zz-order-reset-confirm"><label>Shkruaj RESET për konfirmim<input id="zzOrderResetConfirm" autocomplete="off" placeholder="RESET"></label><button id="zzOrderResetBtn" type="button" class="danger-btn zz-order-reset-btn" disabled>🗑 Fshi porositë testuese</button></div>
 <div id="zzOrderResetState" class="zz-order-reset-state">Asgjë nuk fshihet derisa të shkruash RESET dhe të klikosh butonin.</div>`;
 const toolbar=view.querySelector('.toolbar');if(toolbar)toolbar.insertAdjacentElement('afterend',box);else view.prepend(box);
 const input=q('#zzOrderResetConfirm'),btn=q('#zzOrderResetBtn');
 input.oninput=()=>{btn.disabled=input.value.trim().toUpperCase()!=='RESET'};
 btn.onclick=runReset;
 counts();
 return true;
}
async function runReset(){
 const input=q('#zzOrderResetConfirm'),btn=q('#zzOrderResetBtn');
 if(input.value.trim().toUpperCase()!=='RESET')return;
 const includeEbooks=q('#zzIncludeEbookReset').checked;
 const restoreStock=q('#zzRestoreTestStock').checked;
 const msg='Ky veprim do të fshijë të gjitha porositë fizike testuese'+(includeEbooks?' dhe porositë eBook testuese':'')+'. Vazhdo?';
 if(!confirm(msg))return;
 btn.disabled=true;state('Duke pastruar porositë testuese…');
 try{
  const res=await window.api('rpc/admin_launch_reset_orders_v1',{method:'POST',body:{p_confirm:'RESET',p_include_ebooks:includeEbooks,p_restore_stock:restoreStock}});
  const out=Array.isArray(res)?res[0]:res;
  state('U krye: '+Number(out?.deleted_orders||0)+' porosi fizike'+(includeEbooks?' dhe '+Number(out?.deleted_ebook_orders||0)+' eBook':'')+' u fshinë.','ok');
  q('#zzPhysicalOrderCount').textContent=String(out?.remaining_orders??0);
  q('#zzEbookOrderCount').textContent=String(out?.remaining_ebook_orders??0);
  input.value='';
  setTimeout(()=>location.reload(),1200);
 }catch(err){state('Reset-i dështoi: '+err.message,'error');btn.disabled=false}
}
function access(detail){owner=detail?.is_owner===true;if(owner){let n=0;const t=setInterval(()=>{n++;if(build()||n>60)clearInterval(t)},150)}}
window.addEventListener('zemzem:admin-access-ready',e=>access(e.detail));
function boot(){let n=0;const t=setInterval(()=>{n++;if(window.currentAdminAccess?.is_owner){access(window.currentAdminAccess);clearInterval(t)}else if(n>50)clearInterval(t)},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();