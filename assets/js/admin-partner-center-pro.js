(()=>{
'use strict';
if(window.__zzAdminPartnerCenterPro)return;window.__zzAdminPartnerCenterPro=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>Number(v||0).toFixed(2)+' €';
const rpc=(fn,body={})=>window.api('rpc/'+fn,{method:'POST',body});
function data(){return window.ZemZemAdminPartners?.getData?.()}
function ensureDialog(){
 if(q('#zzPartnerCenterDialog'))return;
 const d=document.createElement('dialog');d.id='zzPartnerCenterDialog';d.className='zz-pcenter-dialog';document.body.appendChild(d);
}
function decorateCards(){
 const d=data();if(!d)return;const ps=d.partners||[],cards=qa('#zzPartnerList .zz-partner-card');
 cards.forEach((card,i)=>{const p=ps[i];if(!p||q('[data-open-partner-center]',card))return;card.dataset.partnerId=p.id;
   const c=q('.zz-partner-controls',card);if(!c)return;
   const b=document.createElement('button');b.type='button';b.className='primary-btn';b.dataset.openPartnerCenter=p.id;b.textContent='Partner Center';c.appendChild(b);
   const badges=document.createElement('div');badges.className='zz-pcenter-mini-badges';
   badges.innerHTML='<span>'+esc((p.partner_tier||'standard').toUpperCase())+'</span><span>Credit '+money(p.credit_limit)+'</span><span>'+esc(p.territory||p.country||'—')+'</span>'+(Number(p.unread_messages||0)?'<span class="hot">'+p.unread_messages+' mesazh</span>':'')+(Number(p.pending_returns||0)?'<span class="warn">'+p.pending_returns+' kthim</span>':'');
   q('.zz-partner-metrics',card)?.insertAdjacentElement('afterend',badges);
 });
}
function partnerById(id){return (data()?.partners||[]).find(x=>String(x.id)===String(id))}
function openCenter(id){
 ensureDialog();const p=partnerById(id);if(!p)return;const d=data(),docs=(d.documents||[]).filter(x=>x.supplier_id===p.id),msgs=(d.messages||[]).filter(x=>x.supplier_id===p.id),rets=(d.returns||[]).filter(x=>x.supplier_id===p.id);
 const dialog=q('#zzPartnerCenterDialog');
 dialog.innerHTML='<div class="zz-pcenter-shell"><div class="zz-pcenter-head"><div><span class="eyebrow">PARTNER CENTER</span><h2>'+esc(p.name)+'</h2><p>'+esc(p.contact_name||'')+' · '+esc(p.email||'')+'</p></div><button class="zz-pcenter-close" type="button">×</button></div>'+
 '<div class="zz-pcenter-kpis"><div><span>Niveli</span><strong>'+esc(p.partner_tier||'standard')+'</strong></div><div><span>Shitje muaj</span><strong>'+money(p.month_due)+'</strong></div><div><span>Pa barazuar</span><strong>'+money(p.unsettled_due)+'</strong></div><div><span>Libra</span><strong>'+Number(p.book_count||0)+'</strong></div></div>'+
 '<div class="zz-pcenter-tabs"><button class="active" data-pctab="terms">Kushtet B2B</button><button data-pctab="messages">Mesazhe</button><button data-pctab="documents">Dokumente</button><button data-pctab="returns">Kthime</button><button data-pctab="notify">Njoftim</button></div>'+
 '<section data-pcpanel="terms"><form id="zzPartnerTermsForm" class="zz-pcenter-form"><input type="hidden" name="supplier_id" value="'+p.id+'">'+
 '<label>Niveli<select name="tier"><option value="standard">Standard</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="premium">Premium</option></select></label>'+
 '<label>Credit limit €<input name="credit_limit" type="number" min="0" step=".01" value="'+Number(p.credit_limit||0)+'"></label>'+
 '<label>Afati pagesës (ditë)<input name="payment_terms_days" type="number" min="0" value="'+Number(p.payment_terms_days||0)+'"></label>'+
 '<label>Territori<input name="territory" value="'+esc(p.territory||'')+'"></label>'+
 '<label>Target mujor €<input name="sales_target_monthly" type="number" min="0" step=".01" value="'+Number(p.sales_target_monthly||0)+'"></label>'+
 '<label>Target vjetor €<input name="sales_target_yearly" type="number" min="0" step=".01" value="'+Number(p.sales_target_yearly||0)+'"></label>'+
 '<label>Minimum porosie €<input name="minimum_order_value" type="number" min="0" step=".01" value="'+Number(p.minimum_order_value||0)+'"></label>'+
 '<label>Rezervim stoku (orë)<input name="stock_reservation_hours" type="number" min="1" value="'+Number(p.stock_reservation_hours||24)+'"></label>'+
 '<label>IBAN<input name="iban" value="'+esc(p.iban||'')+'"></label><label>TVSH / VAT<input name="vat_number" value="'+esc(p.vat_number||'')+'"></label>'+
 '<label>Zbritja B2B %<input name="discount_percent" type="number" min="0" max="100" step=".01" value="'+Number(p.partner_discount_percent||0)+'"></label>'+
 '<label class="zz-check"><input name="private_catalog" type="checkbox" '+(p.private_catalog_enabled?'checked':'')+'> Katalog privat</label>'+
 '<div class="zz-pcenter-actions"><button class="primary-btn">Ruaj kushtet B2B</button></div></form><div id="zzPCTermsState"></div></section>'+
 '<section data-pcpanel="messages" hidden><div class="zz-pcenter-thread">'+(msgs.map(m=>'<div class="'+esc(m.sender_role)+'"><small>'+(m.sender_role==='admin'?'ZemZem':'Partneri')+' · '+new Date(m.created_at).toLocaleString('sq-AL')+'</small><p>'+esc(m.body)+'</p></div>').join('')||'<div class="empty-state">Nuk ka mesazhe.</div>')+'</div><form id="zzPCMessageForm" class="zz-pcenter-inline-form"><textarea name="body" rows="3" required placeholder="Shkruaj partnerit…"></textarea><button class="primary-btn">Dërgo</button></form><div id="zzPCMessageState"></div></section>'+
 '<section data-pcpanel="documents" hidden><div class="zz-pcenter-docs">'+(docs.map(x=>'<div><span><b>'+esc(x.title)+'</b><small>'+esc(x.document_type)+' · '+new Date(x.created_at).toLocaleDateString('sq-AL')+'</small></span>'+(x.file_url?'<a target="_blank" href="'+esc(x.file_url)+'">Hap</a>':'<em>Pa link</em>')+'</div>').join('')||'<div class="empty-state">Nuk ka dokumente.</div>')+'</div><form id="zzPCDocForm" class="zz-pcenter-form compact"><label>Lloji<input name="document_type" value="contract"></label><label>Titulli<input name="title" required></label><label class="span-2">URL dokumentit<input name="file_url" type="url" placeholder="https://..."></label><label>Skadon më<input name="expires_at" type="date"></label><div class="zz-pcenter-actions"><button class="primary-btn">Shto dokument</button></div></form><div id="zzPCDocState"></div></section>'+
 '<section data-pcpanel="returns" hidden><div class="zz-pcenter-returns">'+(rets.map(r=>'<div><div><b>'+esc(r.reason)+'</b><small>'+new Date(r.created_at).toLocaleDateString('sq-AL')+' · '+esc(r.status)+'</small><p>'+esc(r.details||'')+'</p></div><div><button class="secondary-btn" data-return-action="'+r.id+'|approved">Aprovo</button><button class="secondary-btn" data-return-action="'+r.id+'|rejected">Refuzo</button><button class="primary-btn" data-return-action="'+r.id+'|completed">Përfundo</button></div></div>').join('')||'<div class="empty-state">Nuk ka kthime.</div>')+'</div></section>'+
 '<section data-pcpanel="notify" hidden><form id="zzPCNotifyForm" class="zz-pcenter-form"><label>Lloji<select name="type"><option value="info">Info</option><option value="payment">Pagesë</option><option value="stock">Stok</option><option value="document">Dokument</option></select></label><label class="span-2">Titulli<input name="title" required></label><label class="span-2">Mesazhi<textarea name="body" rows="4"></textarea></label><div class="zz-pcenter-actions"><button class="primary-btn">Dërgo njoftim</button></div></form><div id="zzPCNotifyState"></div></section>'+
 '</div>';
 dialog.showModal();q('.zz-pcenter-close',dialog).onclick=()=>dialog.close();
 q('[name="tier"]',dialog).value=p.partner_tier||'standard';
 qa('[data-pctab]',dialog).forEach(b=>b.onclick=()=>{qa('[data-pctab]',dialog).forEach(x=>x.classList.toggle('active',x===b));qa('[data-pcpanel]',dialog).forEach(x=>x.hidden=x.dataset.pcpanel!==b.dataset.pctab)});
 q('#zzPartnerTermsForm',dialog).onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));x.p_supplier_id=p.id;x.p_tier=x.tier;x.p_credit_limit=Number(x.credit_limit||0);x.p_payment_terms_days=Number(x.payment_terms_days||0);x.p_territory=x.territory||null;x.p_sales_target_monthly=Number(x.sales_target_monthly||0);x.p_sales_target_yearly=Number(x.sales_target_yearly||0);x.p_minimum_order_value=Number(x.minimum_order_value||0);x.p_stock_reservation_hours=Number(x.stock_reservation_hours||24);x.p_iban=x.iban||null;x.p_vat_number=x.vat_number||null;x.p_discount_percent=Number(x.discount_percent||0);x.p_private_catalog=!!q('[name="private_catalog"]',e.currentTarget).checked;delete x.supplier_id;delete x.tier;delete x.credit_limit;delete x.payment_terms_days;delete x.territory;delete x.sales_target_monthly;delete x.sales_target_yearly;delete x.minimum_order_value;delete x.stock_reservation_hours;delete x.iban;delete x.vat_number;delete x.discount_percent;delete x.private_catalog;try{await rpc('admin_partner_center_update',x);q('#zzPCTermsState').innerHTML='<div class="zz-pcenter-ok">U ruajt.</div>';await window.ZemZemAdminPartners.reload();dialog.close()}catch(err){q('#zzPCTermsState').textContent=err.message}};
 q('#zzPCMessageForm',dialog).onsubmit=async e=>{e.preventDefault();try{await rpc('admin_partner_send_message',{p_supplier_id:p.id,p_body:new FormData(e.currentTarget).get('body')});q('#zzPCMessageState').innerHTML='<div class="zz-pcenter-ok">Mesazhi u dërgua.</div>'}catch(err){q('#zzPCMessageState').textContent=err.message}};
 q('#zzPCDocForm',dialog).onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{await rpc('admin_partner_document_add',{p_supplier_id:p.id,p_document_type:x.document_type,p_title:x.title,p_file_url:x.file_url||null,p_expires_at:x.expires_at||null});q('#zzPCDocState').innerHTML='<div class="zz-pcenter-ok">Dokumenti u shtua.</div>'}catch(err){q('#zzPCDocState').textContent=err.message}};
 q('#zzPCNotifyForm',dialog).onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{await rpc('admin_partner_notify',{p_supplier_id:p.id,p_title:x.title,p_body:x.body||null,p_type:x.type});q('#zzPCNotifyState').innerHTML='<div class="zz-pcenter-ok">Njoftimi u dërgua.</div>'}catch(err){q('#zzPCNotifyState').textContent=err.message}};
 qa('[data-return-action]',dialog).forEach(b=>b.onclick=async()=>{const [rid,st]=b.dataset.returnAction.split('|'),note=prompt('Shënim për partnerin (opsional):')||null;await rpc('admin_partner_return_update',{p_return_id:rid,p_status:st,p_admin_note:note});b.closest('div').innerHTML='<span class="zz-pcenter-ok">U përditësua</span>'});
}
function boot(){ensureDialog();decorateCards();document.addEventListener('click',e=>{const b=e.target.closest('[data-open-partner-center]');if(b)openCenter(b.dataset.openPartnerCenter)});new MutationObserver(()=>decorateCards()).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();