(()=>{
'use strict';
if(window.__zzAdminPartnerFulfillment)return;window.__zzAdminPartnerFulfillment=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const labels={pending:'Për përgatitje',preparing:'Duke u përgatitur',shipped:'Nisur',delivered:'Dorëzuar'};
let rows=[],byOrder=new Map(),activeOrderId=null,busy=false;
async function load(){
 if(busy||!window.api)return;busy=true;
 try{
   rows=await window.api('rpc/admin_partner_order_fulfillment_snapshot',{method:'POST',body:{}})||[];
   byOrder=new Map();
   rows.forEach(r=>{const k=String(r.order_id);if(!byOrder.has(k))byOrder.set(k,[]);byOrder.get(k).push(r)});
   decorateTable();decorateDrawer();
 }catch(e){console.warn('Partner fulfillment snapshot:',e)}finally{busy=false}
}
function statusPill(s){return '<span class="zzpf-status '+esc(s||'pending')+'">'+esc(labels[s]||s||'—')+'</span>'}
function ensureHeader(){
 const th=q('#view-orders table thead tr');if(!th||q('.zzpf-partner-head',th))return;
 const cells=[...th.children],statusCell=cells.find(x=>/Statusi/i.test(x.textContent||''));
 const n=document.createElement('th');n.className='zzpf-partner-head';n.textContent='Partneri / Libraria';
 statusCell?th.insertBefore(n,statusCell):th.appendChild(n);
}
function decorateTable(){
 ensureHeader();
 qa('#ordersBody tr').forEach(tr=>{
   const btn=q('[data-order-id]',tr);if(!btn)return;
   const oid=String(btn.dataset.orderId),list=byOrder.get(oid)||[];
   let cell=q('.zzpf-partner-cell',tr);
   if(!cell){
     cell=document.createElement('td');cell.className='zzpf-partner-cell';
     const tds=[...tr.children],statusCell=tds.find(x=>x.querySelector('.status-pill')||/Pending|Confirmed|Processing|Shipped|Delivered|Cancelled|Në pritje|Dorëzuar|Nisur/i.test(x.textContent||''));
     statusCell?tr.insertBefore(cell,statusCell):tr.insertBefore(cell,tr.lastElementChild);
   }
   cell.innerHTML=list.length?list.map(x=>'<div class="zzpf-partner-mini"><strong>'+esc(x.supplier_name)+'</strong><small>'+Number(x.item_qty||0)+' artikuj · '+statusPill(x.fulfillment_status)+'</small></div>').join(''):'<span class="zzpf-direct">ZemZem / pa partner</span>';
 });
}
function fulfillmentCard(x){
 const items=(x.items||[]).map(i=>'<li><span>'+esc(i.title)+'</span><b>× '+Number(i.quantity||0)+'</b></li>').join('');
 return '<article class="zzpf-admin-card">'+
   '<div class="zzpf-admin-card-head"><div><span>PARTNER / LIBRARI</span><h4>'+esc(x.supplier_name)+'</h4><small>'+esc(x.supplier_email||'')+(x.supplier_phone?' · '+esc(x.supplier_phone):'')+'</small></div>'+statusPill(x.fulfillment_status)+'</div>'+
   '<ul class="zzpf-items">'+items+'</ul>'+
   '<div class="zzpf-meta"><div><span>Transportuesi</span><strong>'+esc(x.shipping_carrier||'—')+'</strong></div><div><span>Tracking</span><strong>'+esc(x.tracking_number||'—')+'</strong></div><div><span>Nisur</span><strong>'+(x.shipped_at?new Date(x.shipped_at).toLocaleString('sq-AL'):'—')+'</strong></div><div><span>Dorëzuar</span><strong>'+(x.delivered_at?new Date(x.delivered_at).toLocaleString('sq-AL'):'—')+'</strong></div></div>'+
   (x.partner_note?'<div class="zzpf-note"><b>Shënim i partnerit</b><p>'+esc(x.partner_note)+'</p></div>':'')+
 '</article>';
}
function decorateDrawer(){
 if(!activeOrderId)return;
 const host=q('#orderDetail');if(!host)return;
 const list=byOrder.get(String(activeOrderId))||[];
 const old=q('#zzpfOrderPartners',host);
 if(old)old.remove();
 if(!list.length)return;
 const wrap=document.createElement('section');wrap.id='zzpfOrderPartners';wrap.className='detail-section zzpf-order-partners';
 wrap.innerHTML='<div class="zzpf-section-head"><div><span>FULFILLMENT</span><h3>Partnerët / Libraritë e kësaj porosie</h3><p>Secili partner sheh vetëm artikujt e vet dhe të dhënat e transportit.</p></div><span class="zzpf-count">'+list.length+' partner'+(list.length===1?'':'ë')+'</span></div><div class="zzpf-admin-grid">'+list.map(fulfillmentCard).join('')+'</div>';
 const firstSection=q('.detail-section',host);firstSection?host.insertBefore(wrap,firstSection):host.appendChild(wrap);
}
function boot(){
 load();
 document.addEventListener('click',e=>{
   const b=e.target.closest('[data-order-id]');
   if(b){activeOrderId=b.dataset.orderId;setTimeout(()=>{decorateDrawer();load()},220);setTimeout(decorateDrawer,700)}
 },true);
 const tbody=q('#ordersBody');if(tbody)new MutationObserver(()=>decorateTable()).observe(tbody,{childList:true,subtree:true});
 const detail=q('#orderDetail');if(detail)new MutationObserver(()=>decorateDrawer()).observe(detail,{childList:true,subtree:true});
 window.addEventListener('zemzem:admin-access-ready',load);
 setInterval(()=>{decorateTable();decorateDrawer()},2500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();