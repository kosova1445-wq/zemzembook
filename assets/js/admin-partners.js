(()=>{
'use strict';
if(window.__zzAdminPartners)return;window.__zzAdminPartners=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>Number(v||0).toFixed(2)+' €';
const date=v=>v?new Intl.DateTimeFormat('sq-AL',{dateStyle:'medium'}).format(new Date(v)):'—';
const rpc=(fn,body={})=>window.api('rpc/'+fn,{method:'POST',body});
let data=null;

function ensureNav(){
 const side=q('.side-nav');if(!side)return;
 if(!q('[data-view="partners"]',side)){
  const b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.view='partners';b.innerHTML='<span class="side-menu-icon">🤝</span><span>Partnerët / Libraritë</span>';
  const ops=q('[data-view="operations"]',side);if(ops?.nextSibling)side.insertBefore(b,ops.nextSibling);else side.appendChild(b);
  b.onclick=()=>{window.setView?.('partners');load()};
 }
}
function ensureView(){
 if(q('#view-partners'))return;
 const s=document.createElement('section');s.id='view-partners';s.className='view';
 s.innerHTML='<div id="zzPartnerAdmin"><div class="empty-state">Duke ngarkuar Partnerët…</div></div>';
 q('main.main')?.appendChild(s);
}
function statusLabel(s){return ({pending:'Në pritje',approved:'Aktiv',suspended:'Pezulluar',rejected:'Refuzuar'})[s]||s}
function statusClass(s){return 'zz-partner-status '+s}
function render(){
 const host=q('#zzPartnerAdmin');if(!host||!data)return;
 const ps=data.partners||[], ss=data.settlements||[];
 const active=ps.filter(x=>x.partner_status==='approved').length,pending=ps.filter(x=>x.partner_status==='pending').length;
 const due=ps.reduce((a,x)=>a+Number(x.unsettled_due||0),0);
 const profit=ss.reduce((a,x)=>a+Number(x.zemzem_profit||0),0);
 host.innerHTML=`
 <div class="zz-partner-head"><div><div class="eyebrow">MARKETPLACE I LIBRARIVE</div><h2>Partnerët / Libraritë</h2><p>Libraria vendos çmimin bazë. ZemZem i shton automatikisht marzhin dhe llogarit barazimin mujor.</p></div><div class="zz-partner-head-actions"><a class="secondary-btn" href="partner.html" target="_blank">↗ Portali i partnerit</a><button class="primary-btn" id="zzPartnerRefresh">↻ Rifresko</button></div></div>
 <div class="zz-partner-kpis">
  <div><span>Partnerë aktivë</span><strong>${active}</strong></div>
  <div><span>Aplikime në pritje</span><strong>${pending}</strong></div>
  <div><span>Për t'u barazuar</span><strong>${money(due)}</strong></div>
  <div><span>Fitim ZemZem (settlements)</span><strong>${money(profit)}</strong></div>
 </div>
 <div class="zz-partner-grid">
  <article class="panel zz-partner-panel"><div class="panel-head"><div><h3>Libraritë partnere</h3><p>Menaxho aplikimet, statusin dhe marzhin e secilit partner.</p></div></div><div class="zz-partner-toolbar"><div class="zz-partner-search"><input id="zzPartnerSearch" placeholder="Kërko librari, kontakt ose email…"></div><select id="zzPartnerStatusFilter"><option value="">Të gjitha statuset</option><option value="pending">Në pritje</option><option value="approved">Aktive</option><option value="suspended">Pezulluara</option><option value="rejected">Refuzuara</option></select></div><div class="zz-partner-list" id="zzPartnerList">
   ${ps.map(p=>`<div class="zz-partner-card">
    <div class="zz-partner-card-top"><div class="zz-partner-identity"><div class="zz-partner-avatar">${esc((p.name||'L').trim().charAt(0).toUpperCase())}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.contact_name||'')} · ${esc(p.email||'')}</small></div></div><span class="${statusClass(p.partner_status)}">${statusLabel(p.partner_status)}</span></div>
    <div class="zz-partner-metrics"><span><b>${p.book_count||0}</b> libra</span><span><b>${p.sold_qty||0}</b> të shitur</span><span><b>${money(p.unsettled_due)}</b> pa barazuar</span></div>
    <div class="zz-partner-controls">
     <label>Marzhi<select data-margin-type="${p.id}"><option value="fixed" ${p.margin_type==='fixed'?'selected':''}>€ fiks</option><option value="percent" ${p.margin_type==='percent'?'selected':''}>%</option></select></label>
     <label>Vlera<input data-margin-value="${p.id}" type="number" min="0" step=".01" value="${Number(p.margin_value||2)}"></label>
     <button data-save-partner="${p.id}" class="secondary-btn">Ruaj</button>
     ${p.partner_status!=='approved'?'<button data-partner-status="'+p.id+'|approved" class="primary-btn">Aprovo</button>':'<button data-partner-status="'+p.id+'|suspended" class="secondary-btn">Pezullo</button>'}
     ${p.partner_status==='pending'?'<button data-partner-status="'+p.id+'|rejected" class="secondary-btn">Refuzo</button>':''}
     <button data-settle-partner="${p.id}" data-partner-name="${esc(p.name)}" class="secondary-btn">Barazimi mujor</button>
    </div>
   </div>`).join('')||'<div class="empty-state">Ende nuk ka librari partnere.</div>'}
  </div></article>
  <article class="panel zz-partner-panel"><div class="panel-head"><div><h3>Barazimet</h3><p>Historiku mujor i pagesave.</p></div></div><div class="zz-partner-list">
   ${ss.map(s=>`<div class="zz-settlement-card"><div class="zz-partner-card-top"><div><strong>${esc(s.supplier_name)}</strong><small>${date(s.period_start)} – ${date(s.period_end)}</small></div><span class="zz-partner-status ${s.status==='paid'?'approved':'pending'}">${s.status==='paid'?'Paguar':'Hapur'}</span></div>
   <div class="zz-partner-metrics"><span><b>${s.quantity_total}</b> copë</span><span><b>${money(s.supplier_due)}</b> partnerit</span><span><b>${money(s.zemzem_profit)}</b> ZemZem</span><span><b>${money(s.gross_sales)}</b> shitje</span></div>
   ${s.status==='open'?'<div class="zz-partner-controls"><button class="primary-btn" data-mark-paid="'+s.id+'">Shëno si të paguar</button></div>':''}
   </div>`).join('')||'<div class="empty-state">Nuk ka barazime të krijuara.</div>'}
  </div></article>
 </div>
 <dialog id="zzSettlementDialog" class="zz-partner-dialog"><form method="dialog" id="zzSettlementForm"><h3>Krijo barazimin mujor</h3><p id="zzSettlementPartnerName"></p><input type="hidden" name="supplier_id"><label>Nga<input type="date" name="period_start" required></label><label>Deri<input type="date" name="period_end" required></label><div class="zz-dialog-actions"><button value="cancel" class="secondary-btn">Anulo</button><button value="default" class="primary-btn" id="zzCreateSettlement">Krijo barazimin</button></div></form></dialog>`;
 bind();
}
async function load(){try{data=await rpc('admin_partner_snapshot',{});render()}catch(e){const h=q('#zzPartnerAdmin');if(h)h.innerHTML='<div class="empty-state">'+esc(e.message)+'</div>'}}
function previousMonth(){const d=new Date(),first=new Date(d.getFullYear(),d.getMonth()-1,1),last=new Date(d.getFullYear(),d.getMonth(),0);const f=x=>x.toISOString().slice(0,10);return [f(first),f(last)]}
function bind(){
 q('#zzPartnerRefresh')?.addEventListener('click',load);
 const filterPartners=()=>{const term=(q('#zzPartnerSearch')?.value||'').toLowerCase(),status=q('#zzPartnerStatusFilter')?.value||'';qa('#zzPartnerList .zz-partner-card').forEach((card,i)=>{const p=(data.partners||[])[i],hay=[p?.name,p?.contact_name,p?.email,p?.country].join(' ').toLowerCase();card.hidden=!!((term&&!hay.includes(term))||(status&&p?.partner_status!==status))})};
 q('#zzPartnerSearch')?.addEventListener('input',filterPartners);q('#zzPartnerStatusFilter')?.addEventListener('change',filterPartners);
 qa('[data-save-partner]').forEach(b=>b.onclick=async()=>{const id=b.dataset.savePartner,p=(data.partners||[]).find(x=>x.id===id);await rpc('admin_partner_set_status',{p_supplier_id:id,p_status:p.partner_status,p_margin_type:q('[data-margin-type="'+id+'"]').value,p_margin_value:Number(q('[data-margin-value="'+id+'"]').value||0)});await load()});
 qa('[data-partner-status]').forEach(b=>b.onclick=async()=>{const [id,status]=b.dataset.partnerStatus.split('|'),mt=q('[data-margin-type="'+id+'"]')?.value||'fixed',mv=Number(q('[data-margin-value="'+id+'"]')?.value||2);await rpc('admin_partner_set_status',{p_supplier_id:id,p_status:status,p_margin_type:mt,p_margin_value:mv});await load()});
 qa('[data-settle-partner]').forEach(b=>b.onclick=()=>{const d=q('#zzSettlementDialog'),f=q('#zzSettlementForm'),[a,z]=previousMonth();f.supplier_id.value=b.dataset.settlePartner;f.period_start.value=a;f.period_end.value=z;q('#zzSettlementPartnerName').textContent=b.dataset.partnerName;d.showModal()});
 q('#zzSettlementForm')?.addEventListener('submit',async e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const f=e.currentTarget;try{await rpc('admin_partner_create_settlement',{p_supplier_id:f.supplier_id.value,p_period_start:f.period_start.value,p_period_end:f.period_end.value});q('#zzSettlementDialog').close();await load()}catch(err){alert(err.message)}});
 qa('[data-mark-paid]').forEach(b=>b.onclick=async()=>{const ref=prompt('Referenca e pagesës (opsionale):')||'';await rpc('admin_partner_mark_paid',{p_settlement_id:b.dataset.markPaid,p_reference:ref,p_notes:''});await load()});
}
function boot(){ensureView();ensureNav();new MutationObserver(()=>ensureNav()).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-view="partners"]'))setTimeout(load,50)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();