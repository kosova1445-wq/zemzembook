(()=>{
'use strict';
if(window.__zzPartnerFulfillment)return;window.__zzPartnerFulfillment=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const labels={pending:'Për përgatitje',preparing:'Duke u përgatitur',shipped:'Nisur',delivered:'Dorëzuar'};
let orders=[],busy=false,initialized=false;
const api=()=>window.ZemZemPartner;
function statusPill(s){return '<span class="zzpfs-status '+esc(s||'pending')+'">'+esc(labels[s]||s||'—')+'</span>'}
async function load(){orders=await api().rpc('partner_fulfillment_orders',{});return orders}
function ensureMenu(){
 const side=q('.partner-side-pro');if(!side||q('[data-partner-section="fulfillment"]',side))return;
 const b=document.createElement('button');b.dataset.partnerSection='fulfillment';
 b.innerHTML='<span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Dërgesat</span><span class="partner-menu-badge" id="zzFulfillmentBadge"></span>';
 const group=q('.zz-b2b-group',side)||q('.partner-menu-group',side);group?.insertBefore(b,group.firstElementChild?.nextSibling||null);
}
function orderCard(o){
 const items=(o.items||[]).map(i=>'<li><div><strong>'+esc(i.title)+'</strong><small>'+esc(i.sku||'')+(i.gift_wrap?' · Paketim dhuratë':'')+'</small></div><b>× '+Number(i.quantity||0)+'</b></li>').join('');
 const delivered=o.fulfillment_status==='delivered';
 const marginLabel=o.margin_type==='percent'?(Number(o.margin_value||0).toFixed(2).replace(/\.00$/,'')+'%'):(o.margin_type==='fixed'?(Number(o.margin_value||0).toFixed(2)+' €'):'—');
 return '<article class="zzpfs-card" data-fulfillment-card="'+o.fulfillment_id+'">'+
  '<div class="zzpfs-card-head"><div><span>POROSIA</span><h3>#'+esc(o.order_number||String(o.order_id).slice(0,8))+'</h3><small>'+new Date(o.created_at).toLocaleString('sq-AL')+'</small></div>'+statusPill(o.fulfillment_status)+'</div>'+
  '<div class="zzpfs-customer"><div><span>Klienti</span><strong>'+esc(o.first_name)+' '+esc(o.last_name)+'</strong></div><div><span>Telefoni</span><strong>'+esc(o.phone||'—')+'</strong></div><div class="span-2"><span>Adresa e dërgesës</span><strong>'+esc(o.address_line1||'')+(o.address_line2?' · '+esc(o.address_line2):'')+', '+esc(o.city||'')+(o.postal_code?' '+esc(o.postal_code):'')+', '+esc(o.country_code||'')+'</strong></div></div>'+
  '<div class="zzpfs-finance"><div><span>Përqindja</span><strong>'+esc(marginLabel)+'</strong></div><div><span>Të takon partnerit</span><strong>'+Number(o.supplier_due||0).toFixed(2)+' €</strong></div><div><span>Marzhi ZemZem</span><strong>'+Number(o.zemzem_margin_total||0).toFixed(2)+' €</strong></div><div><span>Vlera e artikujve</span><strong>'+Number(o.partner_retail_total||0).toFixed(2)+' €</strong></div></div>'+
  '<div class="zzpfs-items"><h4>Artikujt e tu</h4><ul>'+items+'</ul></div>'+
  (o.customer_note?'<div class="zzpfs-customer-note"><b>Shënim i klientit</b><p>'+esc(o.customer_note)+'</p></div>':'')+
  '<form class="zzpfs-form" data-fulfillment-form="'+o.fulfillment_id+'">'+
    '<label>Statusi<select name="status" '+(delivered?'disabled':'')+'><option value="pending">Për përgatitje</option><option value="preparing">Duke u përgatitur</option><option value="shipped">Nisur</option><option value="delivered">Dorëzuar</option></select></label>'+
    '<label>Transportuesi<input name="carrier" value="'+esc(o.shipping_carrier||'')+'" placeholder="p.sh. Posta / DHL / transport privat" '+(delivered?'readonly':'')+'></label>'+
    '<label>Tracking / Nr. dërgesës<input name="tracking" value="'+esc(o.tracking_number||'')+'" placeholder="Numri i gjurmimit" '+(delivered?'readonly':'')+'></label>'+
    '<label class="span-2">Shënime transporti<textarea name="note" rows="3" placeholder="Shënime për dërgesën…" '+(delivered?'readonly':'')+'>'+esc(o.partner_note||'')+'</textarea></label>'+
    '<div class="zzpfs-form-foot span-2"><div><small>'+Number(o.item_qty||0)+' artikuj për këtë partner</small>'+(o.shipped_at?'<small>Nisur: '+new Date(o.shipped_at).toLocaleString('sq-AL')+'</small>':'')+(o.delivered_at?'<small>Dorëzuar: '+new Date(o.delivered_at).toLocaleString('sq-AL')+'</small>':'')+'</div><div class="zzpfs-actions"><button type="button" class="btn secondary" data-partner-invoice="'+o.order_id+'">Fatura / PDF</button>'+(delivered?'<span class="zzpfs-locked">✓ Dorëzimi është final</span>':'<button class="btn primary">Ruaj transportin</button>')+'</div></div>'+
    '<div class="zzpfs-state span-2"></div>'+
  '</form>'+
 '</article>';
}
function render(){
 const content=q('.partner-content');if(!content)return;
 let panel=q('[data-partner-panel="fulfillment"]');
 if(!panel){
   panel=document.createElement('section');panel.dataset.partnerPanel='fulfillment';panel.hidden=true;content.appendChild(panel);
 }
 const open=orders.filter(x=>x.fulfillment_status!=='delivered').length;
 panel.innerHTML='<div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">FULFILLMENT</span><h2>Dërgesat e porosive</h2><p>Këtu shfaqen vetëm porositë që përmbajnë librat e tu. Përditëso transportin pa mundësi fshirjeje.</p></div><div class="zzpfs-summary"><strong>'+open+'</strong><span>aktive</span></div></div>'+
 '<div class="zzpfs-security-note">🔒 Të dhënat e klientit shfaqen vetëm për realizimin e dërgesës. Partneri nuk mund të fshijë porosi ose artikuj.</div>'+
 '<div class="zzpfs-list">'+(orders.map(orderCard).join('')||'<div class="partner-card"><div class="empty-state">Nuk ka porosi për dërgesë.</div></div>')+'</div>';
 const badge=q('#zzFulfillmentBadge');if(badge){badge.textContent=open||'';badge.hidden=!open}
 orders.forEach(o=>{const s=q('[data-fulfillment-form="'+o.fulfillment_id+'"] [name="status"]');if(s)s.value=o.fulfillment_status||'pending'});
 bindForms();bindInvoiceButtons();
}
function bindNav(){
 qa('[data-partner-section]').forEach(b=>{
   if(b.dataset.zzFulfillBound)return;b.dataset.zzFulfillBound='1';
   b.addEventListener('click',()=>{if(b.dataset.partnerSection!=='fulfillment')return;qa('[data-partner-panel]').forEach(x=>x.hidden=x.dataset.partnerPanel!=='fulfillment');qa('[data-partner-section]').forEach(x=>x.classList.toggle('active',x===b));history.replaceState(null,'','#fulfillment')});
 });
}
function bindInvoiceButtons(){
 qa('[data-partner-invoice]').forEach(b=>{b.onclick=()=>window.ZemZemPartnerInvoice?.print?.(b.dataset.partnerInvoice)});
}
function bindForms(){
 qa('[data-fulfillment-form]').forEach(f=>{
   f.onsubmit=async e=>{
     e.preventDefault();const id=f.dataset.fulfillmentForm,st=q('.zzpfs-state',f),btn=q('button',f);
     const x=Object.fromEntries(new FormData(f));
     if(['shipped','delivered'].includes(x.status)&&(!x.carrier.trim()||!x.tracking.trim())){st.innerHTML='<div class="partner-msg error">Për Nisur/Dorëzuar duhen transportuesi dhe tracking-u.</div>';return}
     if(btn)btn.disabled=true;st.innerHTML='<div class="partner-msg">Po ruhet…</div>';
     try{
       await api().rpc('partner_update_fulfillment',{p_fulfillment_id:id,p_status:x.status,p_shipping_carrier:x.carrier||null,p_tracking_number:x.tracking||null,p_partner_note:x.note||null});
       await load();render();st.innerHTML='<div class="partner-msg">U ruajt me sukses.</div>';
     }catch(err){st.innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';if(btn)btn.disabled=false}
   };
 });
}
async function enhance(){
 if(busy||!api()||!q('.partner-shell-pro'))return;
 if(initialized){ensureMenu();bindNav();return}
 busy=true;
 try{
   await load();ensureMenu();render();bindNav();initialized=true;
   if(location.hash==='#fulfillment')q('[data-partner-section="fulfillment"]')?.click();
 }catch(e){console.warn('Fulfillment:',e)}finally{busy=false}
}
new MutationObserver(()=>setTimeout(enhance,80)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(enhance,300));
})();