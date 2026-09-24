(()=>{
'use strict';
if(window.__zzPartnerProCenter)return;window.__zzPartnerProCenter=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>Number(v||0).toFixed(2)+' €';
let center=null,busy=false;
const api=()=>window.ZemZemPartner;
function tier(t){return({standard:'Standard',silver:'Silver',gold:'Gold',premium:'Premium'})[t]||'Standard'}
function addMenu(){
 const side=q('.partner-side-pro');if(!side||q('.zz-b2b-group',side))return;
 const g=document.createElement('div');g.className='partner-menu-group zz-b2b-group';
 g.innerHTML='<div class="partner-menu-label">B2B TOOLS</div>'+
 '<button data-partner-section="wholesale"><span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Porosi / Rezervime</span></button>'+
 '<button data-partner-section="documents"><span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Dokumentet</span></button>'+
 '<button data-partner-section="messages"><span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Mesazhet</span></button>'+
 '<button data-partner-section="returns"><span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Kthimet</span></button>'+
 '<button data-partner-section="notifications"><span class="partner-menu-icon zz-pro-dot"></span><span class="partner-menu-text">Njoftimet</span></button>';
 const last=q('.partner-menu-logout',side)?.closest('.partner-menu-group');last?side.insertBefore(g,last):side.appendChild(g);
}
function addOverview(){
 const d=api().getDashboard?.(),s=d?.supplier||{},m=d?.month||{},ov=q('[data-partner-panel="overview"]');
 if(!ov||q('.zz-b2b-overview',ov))return;
 const mt=Number(s.sales_target_monthly||0),cur=Number(m.supplier_due||0),pct=mt?Math.min(100,Math.round(cur/mt*100)):0;
 const x=document.createElement('div');x.className='zz-b2b-overview';
 x.innerHTML='<div class="zz-b2b-strip">'+
 '<div><span>Niveli</span><strong class="zz-tier '+esc(s.partner_tier||'standard')+'">'+esc(tier(s.partner_tier))+'</strong></div>'+
 '<div><span>Credit limit</span><strong>'+money(s.credit_limit)+'</strong><small>'+Number(s.payment_terms_days||0)+' ditë</small></div>'+
 '<div><span>Territori</span><strong>'+esc(s.territory||s.country||'—')+'</strong></div>'+
 '<div><span>Minimum porosie</span><strong>'+money(s.minimum_order_value)+'</strong></div>'+
 '<div><span>Zbritja B2B</span><strong>'+Number(s.partner_discount_percent||0).toFixed(1)+'%</strong></div></div>'+
 '<div class="zz-b2b-target"><div><span>Targeti mujor</span><strong>'+money(cur)+' / '+money(mt)+'</strong></div><div class="zz-progress"><i style="width:'+pct+'%"></i></div><small>'+(mt?pct+'% e targetit mujor':'Nuk ka target të caktuar')+'</small></div>';
 ov.querySelector('.partner-page-head')?.insertAdjacentElement('afterend',x);
}
function panel(key,title,sub,html){
 const c=q('.partner-content');if(!c||q('[data-partner-panel="'+key+'"]'))return;
 const s=document.createElement('section');s.dataset.partnerPanel=key;s.hidden=true;
 s.innerHTML='<div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">PARTNER CENTER</span><h2>'+title+'</h2><p>'+sub+'</p></div></div>'+html;c.appendChild(s);
}
function renderPanels(){
 const d=api().getDashboard?.()||{},s=d.supplier||{},books=d.books||[],orders=d.orders||[];
 panel('wholesale','Porosi & rezervime B2B','Quick order, çmime partneri dhe rezervim stoku.',
 '<div class="partner-card" style="margin-top:0"><div class="zz-pro-toolbar"><div><strong>Quick Order</strong><small>Rezervimi zgjat '+Number(s.stock_reservation_hours||24)+' orë.</small></div><button class="btn secondary" id="zzExportBooks">Export CSV</button></div><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Libri</th><th>Publik</th><th>Partner</th><th>Stok</th><th>Sasi</th><th></th></tr></thead><tbody>'+
 books.map(b=>'<tr><td><b>'+esc(b.title)+'</b></td><td>'+money(b.price)+'</td><td><b>'+money(Number(b.price||0)*(1-Number(s.partner_discount_percent||0)/100))+'</b></td><td>'+Number(b.stock_quantity||0)+'</td><td><input class="zz-qty" data-book-qty="'+b.id+'" type="number" min="1" max="'+Number(b.stock_quantity||0)+'" value="1"></td><td><button class="btn primary zz-reserve" data-book="'+b.id+'">Rezervo</button></td></tr>').join('')+
 '</tbody></table></div><div id="zzReserveMsg"></div></div>');
 panel('documents','Dokumentet','Kontrata, fatura, certifikata dhe dokumente fiskale.',
 '<div class="partner-card" style="margin-top:0"><div class="zz-doc-grid">'+((center?.documents||[]).map(x=>'<article class="zz-doc-card"><div class="zz-doc-icon">DOC</div><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.document_type)+' · '+new Date(x.created_at).toLocaleDateString('sq-AL')+'</small></div>'+(x.file_url?'<a class="btn secondary" target="_blank" href="'+esc(x.file_url)+'">Hap</a>':'<span class="zz-muted">Pa skedar</span>')+'</article>').join('')||'<div class="empty-state">Nuk ka dokumente.</div>')+'</div></div>');
 panel('messages','Mesazhet me ZemZem','Komunikim direkt me administratën.',
 '<div class="partner-card" style="margin-top:0"><div class="zz-thread">'+((center?.messages||[]).map(x=>'<div class="zz-msg '+esc(x.sender_role)+'"><small>'+(x.sender_role==='admin'?'ZemZem':'Ti')+' · '+new Date(x.created_at).toLocaleString('sq-AL')+'</small><p>'+esc(x.body)+'</p></div>').join('')||'<div class="empty-state">Nuk ka mesazhe.</div>')+'</div><form id="zzPartnerMessageForm" class="zz-message-form"><textarea name="body" rows="3" maxlength="5000" required placeholder="Shkruaj mesazhin…"></textarea><button class="btn primary">Dërgo</button></form><div id="zzMessageState"></div></div>');
 panel('returns','Kthime & ankesa','Hap kërkesë për kthim dhe ndiq statusin.',
 '<div class="partner-grid"><div class="partner-card" style="margin-top:0"><h3>Krijo kërkesë</h3><form id="zzReturnForm" class="partner-form"><label class="full">Porosia<select name="order_id"><option value="">Pa porosi</option>'+orders.map(o=>'<option value="'+o.id+'">#'+esc(o.order_number||String(o.id).slice(0,8))+'</option>').join('')+'</select></label><label class="full">Arsyeja<input name="reason" required></label><label class="full">Detaje<textarea name="details" rows="4"></textarea></label><button class="btn primary">Dërgo kërkesën</button></form><div id="zzReturnState"></div></div><div class="partner-card" style="margin-top:0"><h3>Historiku</h3><div class="zz-return-list">'+((center?.returns||[]).map(x=>'<div><span><b>'+esc(x.reason)+'</b><small>'+new Date(x.created_at).toLocaleDateString('sq-AL')+'</small></span><strong>'+esc(x.status)+'</strong></div>').join('')||'<div class="empty-state">Nuk ka kthime.</div>')+'</div></div></div>');
 panel('notifications','Njoftimet','Pagesa, stok, dokumente dhe komunikime nga ZemZem.',
 '<div class="partner-card" style="margin-top:0"><div class="zz-notify-list">'+((center?.notifications||[]).map(x=>'<article><div class="zz-notify-dot"></div><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.body||'')+'</p><small>'+new Date(x.created_at).toLocaleString('sq-AL')+'</small></div></article>').join('')||'<div class="empty-state">Nuk ka njoftime.</div>')+'</div></div>');
}
function bind(){
 qa('[data-partner-section]').forEach(b=>{if(b.dataset.proBound)return;b.dataset.proBound='1';b.addEventListener('click',()=>{const k=b.dataset.partnerSection;qa('[data-partner-panel]').forEach(x=>x.hidden=x.dataset.partnerPanel!==k);qa('[data-partner-section]').forEach(x=>x.classList.toggle('active',x.dataset.partnerSection===k));history.replaceState(null,'','#'+k)})});
 q('#zzExportBooks')?.addEventListener('click',()=>{const d=api().getDashboard(),rows=[['Titulli','ISBN','Çmimi yt','Publik','Stoku'],...(d.books||[]).map(b=>[b.title,b.isbn,b.cost_price,b.price,b.stock_quantity])],csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='partner-librat.csv';a.click()});
 qa('.zz-reserve').forEach(b=>b.onclick=async()=>{const qty=Number(q('[data-book-qty="'+b.dataset.book+'"]')?.value||1);try{await api().rpc('partner_stock_reserve',{p_book_id:b.dataset.book,p_quantity:qty});q('#zzReserveMsg').innerHTML='<div class="partner-msg">Stoku u rezervua.</div>'}catch(e){q('#zzReserveMsg').innerHTML='<div class="partner-msg error">'+esc(e.message)+'</div>'}});
 q('#zzPartnerMessageForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await api().rpc('partner_send_message',{p_body:new FormData(e.currentTarget).get('body')});location.reload()}catch(err){q('#zzMessageState').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}});
 q('#zzReturnForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{await api().rpc('partner_return_create',{p_order_id:x.order_id||null,p_reason:x.reason,p_details:x.details||null});location.reload()}catch(err){q('#zzReturnState').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}});
}
async function enhance(){
 if(busy||!api()||!q('.partner-shell-pro'))return;busy=true;
 try{center=await api().rpc('partner_center_data',{});addMenu();addOverview();renderPanels();bind();const h=location.hash.replace('#','');if(['wholesale','documents','messages','returns','notifications'].includes(h))q('[data-partner-section="'+h+'"]')?.click()}catch{}finally{busy=false}
}
new MutationObserver(()=>setTimeout(enhance,80)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(enhance,250));
})();