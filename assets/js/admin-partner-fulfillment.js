(()=>{
'use strict';
if(window.__zzAdminPartnerFulfillmentV6)return;window.__zzAdminPartnerFulfillmentV6=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const labels={pending:'Në pritje për aprovim',preparing:'Aprovuar / në përgatitje',shipped:'Nisur',delivered:'Dorëzuar',rejected:'Refuzuar'};
const financeLabels={new:'E re',approved:'Aprovuar',shipped:'Nisur',ready_settlement:'Gati për barazim',paid:'Paguar',rejected:'Refuzuar'};
let rows=[],byOrder=new Map(),activeOrderId=null,busy=false;
async function load(){
 if(busy||!window.api)return;busy=true;
 try{
  rows=await window.api('rpc/admin_partner_order_fulfillment_snapshot',{method:'POST',body:{}})||[];
  byOrder=new Map();rows.forEach(r=>{const k=String(r.order_id);if(!byOrder.has(k))byOrder.set(k,[]);byOrder.get(k).push(r)});
  decorateTable();decorateDrawer();
 }catch(e){console.warn('Partner fulfillment snapshot:',e)}finally{busy=false}
}
function statusPill(s){return '<span class="zzpf-status '+esc(s||'pending')+'">'+esc(labels[s]||s||'—')+'</span>'}
function ensureHeader(){
 const th=q('#view-orders table thead tr');if(!th||q('.zzpf-partner-head',th))return;
 const cells=[...th.children],statusCell=cells.find(x=>/Statusi/i.test(x.textContent||''));
 const n=document.createElement('th');n.className='zzpf-partner-head';n.textContent='Partneri / Libraria';statusCell?th.insertBefore(n,statusCell):th.appendChild(n);
}
function decorateTable(){
 ensureHeader();
 qa('#ordersBody tr').forEach(tr=>{
  const btn=q('[data-order-id]',tr);if(!btn)return;const oid=String(btn.dataset.orderId),list=byOrder.get(oid)||[];
  let cell=q('.zzpf-partner-cell',tr);
  if(!cell){cell=document.createElement('td');cell.className='zzpf-partner-cell';const tds=[...tr.children],statusCell=tds.find(x=>x.querySelector('.status-pill')||/Pending|Confirmed|Processing|Shipped|Delivered|Cancelled|Në pritje|Dorëzuar|Nisur/i.test(x.textContent||''));statusCell?tr.insertBefore(cell,statusCell):tr.insertBefore(cell,tr.lastElementChild)}
  cell.innerHTML=list.length?list.map(x=>'<div class="zzpf-partner-mini"><strong>'+esc(x.supplier_name)+'</strong><small>'+Number(x.item_qty||0)+' artikuj · '+statusPill(x.fulfillment_status)+'</small></div>').join(''):'<span class="zzpf-direct">ZemZem / pa partner</span>';
 });
}
function history(x){
 const h=(x.history||[]).slice().reverse();
 return '<div class="zzpf-history"><h5>Historiku i veprimeve</h5>'+(h.map(e=>'<div><i></i><span><b>'+esc(({'order_received':'Porosia erdhi','approved':'Partneri aprovoi','rejected':'Partneri refuzoi','shipped':'Partneri nisi','delivered':'Dorëzuar','updated':'Përditësim'})[e.event_type]||e.event_type)+'</b><small>'+new Date(e.created_at).toLocaleString('sq-AL')+(e.note?' · '+esc(e.note):'')+'</small></span></div>').join('')||'<em>Pa histori.</em>')+'</div>';
}
function messages(x){
 const m=x.messages||[];
 return '<div class="zzpf-order-thread"><h5>Mesazhe për këtë porosi</h5><div class="zzpf-thread-list">'+(m.map(v=>'<div class="'+esc(v.sender_role)+'"><small>'+(v.sender_role==='admin'?'ZemZem':'Partneri')+' · '+new Date(v.created_at).toLocaleString('sq-AL')+'</small><p>'+esc(v.body)+'</p></div>').join('')||'<em>Nuk ka mesazhe.</em>')+'</div><form data-admin-order-message="'+x.order_id+'" data-supplier-id="'+x.supplier_id+'"><textarea name="body" rows="2" maxlength="5000" required placeholder="Shkruaj partnerit për këtë porosi…"></textarea><button class="primary-btn">Dërgo</button></form><div class="zzpf-msg-state"></div></div>';
}
function fulfillmentCard(x){
 const items=(x.items||[]).map(i=>'<li><span>'+esc(i.title)+'</span><b>× '+Number(i.quantity||0)+'</b></li>').join('');
 const marginLabel=x.margin_type==='percent'?(Number(x.margin_value||0).toFixed(2).replace(/\.00$/,'')+'%'):(x.margin_type==='fixed'?(Number(x.margin_value||0).toFixed(2)+' €'):'—');
 const deadline=x.fulfillment_status==='pending'&&x.approval_deadline?'<small class="zzpf-deadline '+(new Date(x.approval_deadline)<new Date()?'overdue':'')+'">Afati: '+new Date(x.approval_deadline).toLocaleString('sq-AL')+'</small>':'';
 return '<article class="zzpf-admin-card">'+
  '<div class="zzpf-admin-card-head"><div><span>PARTNER / LIBRARI</span><h4>'+esc(x.supplier_name)+'</h4><small>'+esc(x.supplier_email||'')+(x.supplier_phone?' · '+esc(x.supplier_phone):'')+'</small>'+deadline+'</div><div>'+statusPill(x.fulfillment_status)+'<span class="zzpf-finance-state">'+esc(financeLabels[x.finance_status]||x.finance_status||'')+'</span></div></div>'+
  '<div class="zzpf-admin-flow"><div class="done"><span>1</span><b>Porosia erdhi</b></div><div class="'+(['preparing','shipped','delivered'].includes(x.fulfillment_status)?'done':'')+' '+(x.fulfillment_status==='rejected'?'rejected':'')+'"><span>2</span><b>'+(x.fulfillment_status==='rejected'?'Refuzuar':'Aprovuar')+'</b></div><div class="'+(['shipped','delivered'].includes(x.fulfillment_status)?'done':'')+'"><span>3</span><b>Nisur</b></div><div class="'+(x.fulfillment_status==='delivered'?'done':'')+'"><span>4</span><b>Dorëzuar</b></div></div>'+
  (x.rejection_reason?'<div class="zzpf-rejection"><b>Arsyeja e refuzimit:</b> '+esc(x.rejection_reason)+'</div>':'')+
  '<div class="zzpf-finance-admin"><div><span>Përqindja</span><strong>'+esc(marginLabel)+'</strong></div><div><span>Të takon partnerit</span><strong>'+Number(x.supplier_due||0).toFixed(2)+' €</strong></div><div><span>Marzhi ZemZem</span><strong>'+Number(x.zemzem_margin_total||0).toFixed(2)+' €</strong></div></div>'+
  '<ul class="zzpf-items">'+items+'</ul>'+
  '<div class="zzpf-meta"><div><span>Transportuesi</span><strong>'+esc(x.shipping_carrier||'—')+'</strong></div><div><span>Tracking</span><strong>'+esc(x.tracking_number||'—')+'</strong></div><div><span>Aprovuar</span><strong>'+(x.approved_at?new Date(x.approved_at).toLocaleString('sq-AL'):'—')+'</strong></div><div><span>Nisur</span><strong>'+(x.shipped_at?new Date(x.shipped_at).toLocaleString('sq-AL'):'—')+'</strong></div></div>'+
  (x.partner_note?'<div class="zzpf-note"><b>Shënim i partnerit</b><p>'+esc(x.partner_note)+'</p></div>':'')+history(x)+messages(x)+
 '</article>';
}
function decorateDrawer(){
 if(!activeOrderId)return;const host=q('#orderDetail');if(!host)return;const list=byOrder.get(String(activeOrderId))||[];let old=q('#zzpfOrderPartners',host);
 if(!list.length){if(old)old.remove();return}
 const html='<div class="zzpf-section-head"><div><span>FULFILLMENT</span><h3>Partnerët / Libraritë e kësaj porosie</h3><p>Admini sheh aprovimin, refuzimin, nisjen, tracking-un, historikun dhe mesazhet e secilit partner.</p></div><span class="zzpf-count">'+list.length+' partner'+(list.length===1?'':'ë')+'</span></div><div class="zzpf-admin-grid">'+list.map(fulfillmentCard).join('')+'</div>';
 if(!old){old=document.createElement('section');old.id='zzpfOrderPartners';old.className='detail-section zzpf-order-partners';const first=q('.detail-section',host);first?host.insertBefore(old,first):host.appendChild(old)}
 old.innerHTML=html;bindMessages(old);
}
function bindMessages(root){
 qa('[data-admin-order-message]',root).forEach(f=>f.onsubmit=async e=>{
  e.preventDefault();const st=q('.zzpf-msg-state',f),btn=q('button',f),x=Object.fromEntries(new FormData(f));btn.disabled=true;
  try{await window.api('rpc/admin_order_partner_message_send',{method:'POST',body:{p_order_id:f.dataset.adminOrderMessage,p_supplier_id:f.dataset.supplierId,p_body:x.body}});await load()}
  catch(err){st.textContent=err.message;btn.disabled=false}
 })
}
function boot(){
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-view="orders"]'))setTimeout(load,80);
  const b=e.target.closest('[data-order-id]');if(b){activeOrderId=b.dataset.orderId;setTimeout(load,180);setTimeout(decorateDrawer,500)}
 },true);
 const tbody=q('#ordersBody');if(tbody)new MutationObserver(()=>requestAnimationFrame(decorateTable)).observe(tbody,{childList:true,subtree:true});
 const detail=q('#orderDetail');if(detail)new MutationObserver(()=>{if(activeOrderId)requestAnimationFrame(decorateDrawer)}).observe(detail,{childList:true,subtree:true});
 window.addEventListener('zemzem:admin-access-ready',()=>{if(q('#view-orders')?.classList.contains('active-view'))load()});
 setInterval(()=>{if(document.visibilityState==='visible'&&q('#view-orders')?.classList.contains('active-view'))load()},15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();