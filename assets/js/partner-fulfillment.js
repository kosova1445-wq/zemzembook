(()=>{
'use strict';
if(window.__zzPartnerFulfillmentV4)return;window.__zzPartnerFulfillmentV4=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const labels={pending:'Në pritje për aprovim',preparing:'Aprovuar / në përgatitje',shipped:'Nisur',delivered:'Dorëzuar',rejected:'Refuzuar'};
const financeLabels={new:'E re',approved:'Aprovuar',shipped:'Nisur',ready_settlement:'Gati për barazim',paid:'Paguar',rejected:'Refuzuar'};
let orders=[],busy=false,initialized=false,filter='all';
const api=()=>window.ZemZemPartner;
function statusPill(s){return '<span class="zzpfs-status '+esc(s||'pending')+'">'+esc(labels[s]||s||'—')+'</span>'}
function financePill(s){return '<span class="zzpfs-fin-status '+esc(s||'new')+'">'+esc(financeLabels[s]||s||'—')+'</span>'}
function fmtDate(v){return v?new Date(v).toLocaleString('sq-AL'):'—'}
function deadline(o){
 if(o.fulfillment_status!=='pending'||!o.approval_deadline)return '';
 const ms=new Date(o.approval_deadline)-Date.now();
 if(ms<=0)return '<span class="zzpfs-deadline overdue">Afati i aprovimit ka kaluar</span>';
 const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
 return '<span class="zzpfs-deadline">Aprovo brenda '+h+'o '+m+'min</span>';
}
async function load(){orders=await api().rpc('partner_fulfillment_orders',{});return orders}
function ensureMenu(){
 const side=q('.partner-side-pro');if(!side||q('[data-partner-section="fulfillment"]',side))return;
 const b=document.createElement('button');b.dataset.partnerSection='fulfillment';
 b.innerHTML='<span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Dërgesat</span><span class="partner-menu-badge hot" id="zzFulfillmentBadge"></span>';
 const group=q('.zz-b2b-group',side)||q('.partner-menu-group',side);group?.insertBefore(b,group.firstElementChild?.nextSibling||null);
}
function metrics(){
 const done=orders.filter(x=>x.fulfillment_status==='delivered').length;
 const rejected=orders.filter(x=>x.fulfillment_status==='rejected').length;
 const awaiting=orders.filter(x=>x.fulfillment_status==='pending').length;
 const approved=orders.filter(x=>['preparing','shipped','delivered'].includes(x.fulfillment_status));
 const avg=approved.length?Math.round(approved.reduce((a,x)=>a+Math.max(0,new Date(x.approved_at||x.updated_at)-new Date(x.created_at)),0)/approved.length/60000):0;
 return {done,rejected,awaiting,avg};
}
function historyHtml(o){
 const rows=(o.history||[]).slice().reverse();
 return '<details class="zzpfs-history"><summary>Historiku i porosisë <span>'+rows.length+'</span></summary><div class="zzpfs-history-list">'+
 (rows.map(e=>'<div><i></i><span><b>'+esc(({'order_received':'Porosia erdhi','approved':'Partneri aprovoi','rejected':'Partneri refuzoi','shipped':'Porosia u nis','delivered':'Porosia u dorëzua','updated':'Përditësim'})[e.event_type]||e.event_type)+'</b><small>'+fmtDate(e.created_at)+(e.note?' · '+esc(e.note):'')+'</small></span></div>').join('')||'<em>Ende nuk ka histori.</em>')+
 '</div></details>';
}
function messagesHtml(o){
 const msgs=o.messages||[];
 return '<details class="zzpfs-messages"><summary>Mesazhe për këtë porosi <span>'+msgs.length+'</span></summary>'+
 '<div class="zzpfs-thread">'+(msgs.map(m=>'<div class="'+esc(m.sender_role)+'"><small>'+(m.sender_role==='admin'?'ZemZem':'Ti')+' · '+fmtDate(m.created_at)+'</small><p>'+esc(m.body)+'</p></div>').join('')||'<em>Nuk ka mesazhe.</em>')+'</div>'+
 '<form class="zzpfs-message-form" data-order-message="'+o.order_id+'"><textarea name="body" rows="2" maxlength="5000" required placeholder="Shkruaj mesazh për këtë porosi…"></textarea><button class="btn primary">Dërgo</button></form><div class="zzpfs-message-state"></div></details>';
}
function orderCard(o){
 const items=(o.items||[]).map(i=>'<li><div><strong>'+esc(i.title)+'</strong><small>'+esc(i.sku||'')+(i.gift_wrap?' · Paketim dhuratë':'')+'</small></div><b>× '+Number(i.quantity||0)+'</b></li>').join('');
 const final=['delivered','rejected'].includes(o.fulfillment_status);
 const marginLabel=o.margin_type==='percent'?(Number(o.margin_value||0).toFixed(2).replace(/\.00$/,'')+'%'):(o.margin_type==='fixed'?(Number(o.margin_value||0).toFixed(2)+' €'):'—');
 return '<article class="zzpfs-card" data-fulfillment-card="'+o.fulfillment_id+'" data-status="'+esc(o.fulfillment_status)+'">'+
  '<div class="zzpfs-card-head"><div><span>POROSIA</span><h3>#'+esc(o.order_number||String(o.order_id).slice(0,8))+'</h3><small>'+fmtDate(o.created_at)+'</small>'+deadline(o)+'</div><div class="zzpfs-head-status">'+statusPill(o.fulfillment_status)+financePill(o.finance_status)+'</div></div>'+
  '<div class="zzpfs-flow">'+
    '<div class="zzpfs-step done"><span>1</span><b>Porosia erdhi</b></div>'+
    '<div class="zzpfs-step '+(['preparing','shipped','delivered'].includes(o.fulfillment_status)?'done':'')+' '+(o.fulfillment_status==='rejected'?'rejected':'')+'"><span>2</span><b>'+(o.fulfillment_status==='rejected'?'Refuzuar':'Aprovuar')+'</b></div>'+
    '<div class="zzpfs-step '+(['shipped','delivered'].includes(o.fulfillment_status)?'done':'')+'"><span>3</span><b>Nisur</b></div>'+
    '<div class="zzpfs-step '+(o.fulfillment_status==='delivered'?'done':'')+'"><span>4</span><b>Dorëzuar</b></div>'+
  '</div>'+
  (o.rejection_reason?'<div class="zzpfs-rejected-note"><b>Arsyeja e refuzimit:</b> '+esc(o.rejection_reason)+'</div>':'')+
  '<div class="zzpfs-customer"><div><span>Klienti</span><strong>'+esc(o.first_name)+' '+esc(o.last_name)+'</strong></div><div><span>Telefoni</span><strong>'+esc(o.phone||'—')+'</strong></div><div class="span-2"><span>Adresa e dërgesës</span><strong>'+esc(o.address_line1||'')+(o.address_line2?' · '+esc(o.address_line2):'')+', '+esc(o.city||'')+(o.postal_code?' '+esc(o.postal_code):'')+', '+esc(o.country_code||'')+'</strong></div></div>'+
  '<div class="zzpfs-finance"><div><span>Përqindja</span><strong>'+esc(marginLabel)+'</strong></div><div><span>Të takon partnerit</span><strong>'+Number(o.supplier_due||0).toFixed(2)+' €</strong></div><div><span>Marzhi ZemZem</span><strong>'+Number(o.zemzem_margin_total||0).toFixed(2)+' €</strong></div><div><span>Vlera e artikujve</span><strong>'+Number(o.partner_retail_total||0).toFixed(2)+' €</strong></div></div>'+
  '<div class="zzpfs-items"><h4>Artikujt e tu</h4><ul>'+items+'</ul></div>'+
  (o.customer_note?'<div class="zzpfs-customer-note"><b>Shënim i klientit</b><p>'+esc(o.customer_note)+'</p></div>':'')+
  '<form class="zzpfs-form" data-fulfillment-form="'+o.fulfillment_id+'">'+
    '<input type="hidden" name="status" value="'+esc(o.fulfillment_status||'pending')+'">'+
    '<label>Transportuesi<input name="carrier" value="'+esc(o.shipping_carrier||'')+'" placeholder="p.sh. Posta / DHL / transport privat" '+(final?'readonly':'')+'></label>'+
    '<label>Tracking / Nr. dërgesës<input name="tracking" value="'+esc(o.tracking_number||'')+'" placeholder="Numri i gjurmimit" '+(final?'readonly':'')+'></label>'+
    '<label class="span-2">Shënime transporti<textarea name="note" rows="3" placeholder="Shënime për dërgesën…" '+(final?'readonly':'')+'>'+esc(o.partner_note||'')+'</textarea></label>'+
    '<div class="zzpfs-form-foot span-2"><div><small>'+Number(o.item_qty||0)+' artikuj për këtë partner</small>'+(o.approved_at?'<small>Aprovuar: '+fmtDate(o.approved_at)+'</small>':'')+(o.shipped_at?'<small>Nisur: '+fmtDate(o.shipped_at)+'</small>':'')+(o.delivered_at?'<small>Dorëzuar: '+fmtDate(o.delivered_at)+'</small>':'')+'</div>'+
      '<div class="zzpfs-actions">'+
       '<button type="button" class="btn secondary" data-print-label="'+o.fulfillment_id+'">Etiketa</button>'+
       '<button type="button" class="btn secondary" data-partner-invoice="'+o.order_id+'">Fatura / PDF</button>'+
       (o.fulfillment_status==='pending'?'<button type="button" class="btn danger" data-reject-order="'+o.fulfillment_id+'">Refuzo</button><button type="button" class="btn primary" data-fulfillment-action="preparing">Aprovo porosinë</button>':'')+
       (o.fulfillment_status==='preparing'?'<button type="button" class="btn danger" data-reject-order="'+o.fulfillment_id+'">Refuzo</button><button type="button" class="btn primary zzpfs-action-ship" data-fulfillment-action="shipped">Shëno si të nisur</button>':'')+
       (o.fulfillment_status==='shipped'?'<button type="button" class="btn primary zzpfs-action-deliver" data-fulfillment-action="delivered">Shëno si të dorëzuar</button>':'')+
       (o.fulfillment_status==='delivered'?'<span class="zzpfs-locked">✓ Dorëzimi është final</span>':'')+
       (o.fulfillment_status==='rejected'?'<span class="zzpfs-locked rejected">Refuzimi është regjistruar</span>':'')+
      '</div></div>'+
    '<div class="zzpfs-state span-2"></div>'+
  '</form>'+historyHtml(o)+messagesHtml(o)+
 '</article>';
}
function render(){
 const content=q('.partner-content');if(!content)return;
 let panel=q('[data-partner-panel="fulfillment"]');
 if(!panel){panel=document.createElement('section');panel.dataset.partnerPanel='fulfillment';panel.hidden=true;content.appendChild(panel)}
 const m=metrics(),open=orders.filter(x=>!['delivered','rejected'].includes(x.fulfillment_status)).length;
 const filtered=filter==='all'?orders:orders.filter(x=>x.fulfillment_status===filter);
 panel.innerHTML='<div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">POROSITË E PARTNERIT</span><h2>Dërgesat & aprovimet</h2><p>Sheh vetëm librat e tu. Aprovo, refuzo, nis dhe ndiq çdo porosi deri në përfundim.</p></div><div class="zzpfs-summary"><strong>'+open+'</strong><span>aktive</span></div></div>'+
 '<div class="zzpfs-kpis"><div><span>Në pritje</span><strong>'+m.awaiting+'</strong></div><div><span>Dorëzuara</span><strong>'+m.done+'</strong></div><div><span>Refuzuara</span><strong>'+m.rejected+'</strong></div><div><span>Koha mes. aprovim</span><strong>'+m.avg+' min</strong></div></div>'+
 '<div class="zzpfs-security-note">🔒 Porositë nuk mund të fshihen. Çdo aprovim, refuzim, nisje dhe mesazh ruhet në historik dhe shihet nga administrata.</div>'+
 '<div class="zzpfs-filterbar">'+
  [['all','Të gjitha'],['pending','Të reja'],['preparing','Në përgatitje'],['shipped','Të nisura'],['delivered','Të dorëzuara'],['rejected','Të refuzuara']].map(x=>'<button type="button" class="'+(filter===x[0]?'active':'')+'" data-fulfillment-filter="'+x[0]+'">'+x[1]+'</button>').join('')+
 '</div>'+
 '<div class="zzpfs-list">'+(filtered.map(orderCard).join('')||'<div class="partner-card"><div class="empty-state">Nuk ka porosi në këtë kategori.</div></div>')+'</div>';
 const badge=q('#zzFulfillmentBadge');if(badge){badge.textContent=m.awaiting||'';badge.hidden=!m.awaiting}
 bindAll();
}
function printLabel(o){
 const items=(o.items||[]).map(i=>esc(i.title)+' × '+Number(i.quantity||0)).join('<br>');
 const w=window.open('','_blank','width=680,height=760');
 if(!w)return;
 w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Etiketa '+esc(o.order_number||'')+'</title><style>body{font-family:Arial,sans-serif;margin:0;padding:28px}.label{border:3px solid #111;padding:24px;max-width:560px}.brand{font-size:14px;font-weight:800}.order{font-size:30px;font-weight:900;margin:12px 0}.to{font-size:13px;color:#555;margin-top:20px}.name{font-size:24px;font-weight:800;margin:5px 0}.addr{font-size:17px;line-height:1.5}.phone{margin-top:10px;font-weight:700}.items{margin-top:20px;padding-top:14px;border-top:1px solid #bbb;font-size:12px;line-height:1.5}.code{font-family:monospace;font-size:18px;letter-spacing:2px;margin-top:22px;text-align:center;border-top:2px dashed #111;padding-top:16px}@media print{body{padding:0}.label{border:2px solid #000}}</style></head><body><div class="label"><div class="brand">ZemZem Partner · Dërgesë</div><div class="order">#'+esc(o.order_number||'')+'</div><div class="to">DËRGO TE</div><div class="name">'+esc(o.first_name)+' '+esc(o.last_name)+'</div><div class="addr">'+esc(o.address_line1||'')+(o.address_line2?'<br>'+esc(o.address_line2):'')+'<br>'+esc(o.postal_code||'')+' '+esc(o.city||'')+' · '+esc(o.country_code||'')+'</div><div class="phone">'+esc(o.phone||'')+'</div><div class="items">'+items+'</div><div class="code">'+esc(o.order_number||String(o.order_id).slice(0,8))+'</div></div><script>window.onload=()=>window.print()<\/script></body></html>');
 w.document.close();
}
function bindNav(){
 qa('[data-partner-section]').forEach(b=>{
  if(b.dataset.zzFulfillBound)return;b.dataset.zzFulfillBound='1';
  b.addEventListener('click',()=>{if(b.dataset.partnerSection!=='fulfillment')return;qa('[data-partner-panel]').forEach(x=>x.hidden=x.dataset.partnerPanel!=='fulfillment');qa('[data-partner-section]').forEach(x=>x.classList.toggle('active',x===b));history.replaceState(null,'','#fulfillment')})
 });
}
function bindAll(){
 qa('[data-fulfillment-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.fulfillmentFilter;render()});
 qa('[data-partner-invoice]').forEach(b=>b.onclick=()=>window.ZemZemPartnerInvoice?.print?.(b.dataset.partnerInvoice));
 qa('[data-print-label]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>String(x.fulfillment_id)===String(b.dataset.printLabel));if(o)printLabel(o)});
 qa('[data-fulfillment-form]').forEach(f=>{
  const save=async(nextStatus,reason=null)=>{
   const id=f.dataset.fulfillmentForm,st=q('.zzpfs-state',f),buttons=qa('button',f),x=Object.fromEntries(new FormData(f));
   x.status=nextStatus||x.status||'pending';if(reason)x.note=reason;
   if(['shipped','delivered'].includes(x.status)&&(!String(x.carrier||'').trim()||!String(x.tracking||'').trim())){st.innerHTML='<div class="partner-msg error">Plotëso transportuesin dhe tracking-un para nisjes.</div>';return}
   buttons.forEach(b=>b.disabled=true);st.innerHTML='<div class="partner-msg">Po ruhet ndryshimi…</div>';
   try{await api().rpc('partner_update_fulfillment',{p_fulfillment_id:id,p_status:x.status,p_shipping_carrier:x.carrier||null,p_tracking_number:x.tracking||null,p_partner_note:x.note||null});await load();render()}
   catch(err){st.innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';buttons.forEach(b=>b.disabled=false)}
  };
  f.onsubmit=e=>e.preventDefault();
  qa('[data-fulfillment-action]',f).forEach(b=>b.onclick=()=>save(b.dataset.fulfillmentAction));
 });
 qa('[data-reject-order]').forEach(b=>b.onclick=()=>{
   const card=b.closest('.zzpfs-card'),f=q('.zzpfs-form',card),reason=prompt('Shkruaj arsyen e refuzimit (e detyrueshme):','Nuk ka stok');
   if(reason&&reason.trim()){const action=q('.zzpfs-state',f);action.innerHTML='<div class="partner-msg">Po regjistrohet refuzimi…</div>';const evt=new CustomEvent('zz:reject',{detail:reason.trim()});f.dispatchEvent(evt)}
 });
 qa('.zzpfs-form').forEach(f=>f.addEventListener('zz:reject',async e=>{
   const id=f.dataset.fulfillmentForm,x=Object.fromEntries(new FormData(f)),buttons=qa('button',f),st=q('.zzpfs-state',f);buttons.forEach(b=>b.disabled=true);
   try{await api().rpc('partner_update_fulfillment',{p_fulfillment_id:id,p_status:'rejected',p_shipping_carrier:x.carrier||null,p_tracking_number:x.tracking||null,p_partner_note:e.detail});await load();render()}
   catch(err){st.innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';buttons.forEach(b=>b.disabled=false)}
 },{once:true}));
 qa('[data-order-message]').forEach(f=>f.onsubmit=async e=>{
   e.preventDefault();const st=q('.zzpfs-message-state',f),btn=q('button',f),body=new FormData(f).get('body');btn.disabled=true;
   try{await api().rpc('partner_order_message_send',{p_order_id:f.dataset.orderMessage,p_body:body});await load();render()}
   catch(err){st.innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';btn.disabled=false}
 });
}
async function enhance(){
 if(busy||!api()||!q('.partner-shell-pro'))return;
 if(initialized){ensureMenu();bindNav();return}
 busy=true;try{await load();ensureMenu();render();bindNav();initialized=true;if(location.hash==='#fulfillment')q('[data-partner-section="fulfillment"]')?.click()}catch(e){console.warn('Fulfillment:',e)}finally{busy=false}
}
new MutationObserver(()=>setTimeout(enhance,80)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(enhance,300));
setInterval(async()=>{if(document.visibilityState==='visible'&&location.hash==='#fulfillment'&&api()){try{await load();render()}catch{}}},30000);
})();