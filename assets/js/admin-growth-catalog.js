(()=>{
'use strict';
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
let collections=[],collectionItems=[],partners=[],events=[],editingCollection=null,editingPartner=null,importRows=[];

function e(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function t(msg,type='ok'){if(typeof toast==='function')toast(msg,type)}
function access(){return !!(window.ZemZemAdminAccess?.full_access||window.ZemZemAdminAccess?.is_owner)}
function button(view,label,icon){
 const b=document.createElement('button');b.className='nav-item';b.dataset.growthView=view;b.innerHTML=icon+' '+label;b.onclick=()=>activate(view);return b
}
function activate(view){
 qa('.nav-item').forEach(x=>x.classList.remove('active'));
 qa('.view').forEach(x=>x.classList.remove('active-view'));
 const b=q('[data-growth-view="'+view+'"]'),v=q('#view-'+view);if(b)b.classList.add('active');if(v)v.classList.add('active-view');
 const titles={collections:'Collections / Series',affiliate:'Affiliate',importexport:'Import / Export',pwa:'PWA / Mobile App'};
 if(q('#viewTitle'))q('#viewTitle').textContent=titles[view]||view;
 if(window.innerWidth<=760)q('.sidebar')?.classList.remove('mobile-open');
 if(view==='collections')loadCollections();
 if(view==='affiliate')loadAffiliates();
 if(view==='pwa')loadPwa();
}
function injectStyle(){
 if(q('#growthCatalogStyle'))return;
 document.head.insertAdjacentHTML('beforeend',`<style id="growthCatalogStyle">
 .growth-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.growth-card{background:#fff;border:1px solid var(--zz-line,#e2e8e4);border-radius:18px;padding:18px}.growth-card h3{margin:0 0 5px;color:var(--navy,#233a4a)}.growth-card p{margin:0 0 14px;color:#77858c;font-size:12px}.growth-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.growth-field{display:grid;gap:5px}.growth-field.full{grid-column:1/-1}.growth-field label{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:#6f7d84}.growth-field input,.growth-field select,.growth-field textarea{width:100%;border:1px solid #dfe6e3;border-radius:10px;padding:10px 11px;background:#fff}.growth-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.growth-list{display:grid;gap:9px}.growth-row{border:1px solid #e6ece9;border-radius:12px;padding:12px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start}.growth-row small{display:block;color:#7d8b91;margin-top:3px}.growth-row-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.growth-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:9px}.growth-stat{background:#f7f9f8;border-radius:9px;padding:8px}.growth-stat span{display:block;font-size:9px;color:#7a8880}.growth-stat b{display:block;margin-top:2px}.book-picker{max-height:360px;overflow:auto;border:1px solid #e1e7e4;border-radius:12px;padding:8px;display:grid;gap:4px}.book-pick{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px}.book-pick:hover{background:#f6f8f7}.preview-table{width:100%;border-collapse:collapse;min-width:700px}.preview-table th,.preview-table td{padding:8px 10px;border-bottom:1px solid #edf1ef;font-size:11px;text-align:left}.import-wrap{overflow:auto;border:1px solid #e5ebe8;border-radius:12px}.code-chip{font-family:ui-monospace,monospace;background:#f3f6f4;border-radius:7px;padding:4px 7px}.pwa-preview{background:linear-gradient(145deg,#183c2b,#275b42);color:#fff;border-radius:24px;padding:22px;min-height:210px;display:grid;align-content:space-between}.pwa-icon{width:68px;height:68px;border-radius:18px;background:#fff;color:#183c2b;display:grid;place-items:center;font-weight:900;font-size:22px}.muted-note{font-size:11px;color:#7b8981;line-height:1.5}
 @media(max-width:900px){.growth-grid{grid-template-columns:1fr}}@media(max-width:600px){.growth-form{grid-template-columns:1fr}.growth-field.full{grid-column:auto}.growth-row{grid-template-columns:1fr}.growth-row-actions{justify-content:flex-start}}
 </style>`);
}
function injectViews(){
 if(q('#view-collections'))return;
 const main=q('.main'); if(!main)return;
 const marker=q('#view-integrations')||main.lastElementChild;
 const html=`
 <section id="view-collections" class="view"><div class="growth-grid">
  <article class="growth-card"><h3>Krijo / edito Collection</h3><p>Serie, tema, sete ose koleksione që mund të shfaqen publikisht.</p>
   <form id="collectionForm" class="growth-form">
    <input id="collectionId" type="hidden">
    <div class="growth-field"><label>Emri</label><input id="collectionName" required></div>
    <div class="growth-field"><label>Slug</label><input id="collectionSlug" required></div>
    <div class="growth-field full"><label>Përshkrimi</label><textarea id="collectionDescription" rows="3"></textarea></div>
    <div class="growth-field full"><label>Cover URL</label><input id="collectionCover" placeholder="https://..."></div>
    <div class="growth-field"><label>Statusi</label><select id="collectionActive"><option value="true">Aktiv</option><option value="false">Joaktiv</option></select></div>
    <div class="growth-field"><label>Renditja</label><input id="collectionSort" type="number" value="100"></div>
    <div class="growth-field full"><div class="growth-actions"><button class="primary-btn">Ruaj Collection</button><button type="button" class="secondary-btn" id="collectionReset">Pastro</button><a class="secondary-btn" href="collections.html" target="_blank">↗ Shiko publikisht</a></div></div>
   </form>
  </article>
  <article class="growth-card"><h3>Librat në Collection</h3><p>Zgjidh collection-in nga lista, pastaj librat që duhet të përmbajë.</p><div id="collectionPickerEmpty" class="muted-note">Zgjidh një collection për ta menaxhuar.</div><div id="collectionBookPicker" hidden></div></article>
  <article class="growth-card" style="grid-column:1/-1"><h3>Collections ekzistuese</h3><div id="collectionsList" class="growth-list"></div></article>
 </div></section>
 <section id="view-affiliate" class="view"><div class="growth-grid">
  <article class="growth-card"><h3>Partner Affiliate</h3><p>Krijo kodin dhe komisionin. Linku gjenerohet automatikisht.</p>
   <form id="affiliateForm" class="growth-form">
    <input id="affiliateId" type="hidden"><div class="growth-field"><label>Emri</label><input id="affiliateName" required></div><div class="growth-field"><label>Kodi</label><input id="affiliateCode" required placeholder="PARTNER10"></div>
    <div class="growth-field"><label>Email</label><input id="affiliateEmail" type="email"></div><div class="growth-field"><label>Komision %</label><input id="affiliateCommission" type="number" min="0" max="100" step=".1" value="5"></div>
    <div class="growth-field"><label>Statusi</label><select id="affiliateStatus"><option value="active">Aktiv</option><option value="paused">Pauzuar</option><option value="disabled">Çaktivizuar</option></select></div>
    <div class="growth-field"><label>Mënyra e pagesës</label><input id="affiliatePayout" placeholder="Bankë / PayPal"></div><div class="growth-field full"><label>Shënime</label><textarea id="affiliateNotes" rows="3"></textarea></div>
    <div class="growth-field full"><div class="growth-actions"><button class="primary-btn">Ruaj partnerin</button><button type="button" class="secondary-btn" id="affiliateReset">Pastro</button></div></div>
   </form>
  </article>
  <article class="growth-card"><h3>Si funksionon</h3><p>Çdo partner merr link me <span class="code-chip">?ref=KODI</span>. Referenca ruhet për 30 ditë dhe lidhet me porosinë.</p><div class="muted-note">Klikimet dhe konvertimet regjistrohen server-side. Komisioni llogaritet nga totali i porosisë në momentin e konvertimit.</div></article>
  <article class="growth-card" style="grid-column:1/-1"><h3>Partnerët & rezultatet</h3><div id="affiliateList" class="growth-list"></div></article>
 </div></section>
 <section id="view-importexport" class="view"><div class="growth-grid">
  <article class="growth-card"><h3>Export katalogu</h3><p>Shkarko katalogun fizik si CSV për Excel.</p><div class="growth-actions"><button class="primary-btn" id="exportBooksCsv">Shkarko CSV</button></div></article>
  <article class="growth-card"><h3>Import katalogu</h3><p>CSV me kolonat: sku, title, slug, isbn, price, stock_quantity, status, language, format.</p><input id="importBooksFile" type="file" accept=".csv,text/csv"><div class="growth-actions"><button class="primary-btn" id="applyBooksImport" disabled>Apliko importin</button><button class="secondary-btn" id="downloadCsvTemplate" type="button">Template CSV</button></div><div id="importStatus" class="muted-note" style="margin-top:10px"></div></article>
  <article class="growth-card" style="grid-column:1/-1"><h3>Preview</h3><div id="importPreview" class="import-wrap"><div class="empty-state">Ngarko një CSV për preview.</div></div></article>
 </div></section>
 <section id="view-pwa" class="view"><div class="growth-grid">
  <article class="growth-card"><h3>PWA / Install App</h3><p>Lejo klientin ta instalojë ZemZem si app në telefon ose desktop.</p>
   <form id="pwaForm" class="growth-form"><div class="growth-field"><label>Aktiv</label><select id="pwaEnabled"><option value="true">Po</option><option value="false">Jo</option></select></div><div class="growth-field"><label>Install prompt</label><select id="pwaPrompt"><option value="true">Shfaq</option><option value="false">Mos shfaq</option></select></div>
   <div class="growth-field full"><label>Emri i app-it</label><input id="pwaName" value="ZemZem"></div><div class="growth-field"><label>Emri i shkurtër</label><input id="pwaShort" value="ZemZem"></div><div class="growth-field"><label>Theme color</label><input id="pwaTheme" type="color" value="#233a4a"></div>
   <div class="growth-field"><label>Background</label><input id="pwaBg" type="color" value="#ffffff"></div><div class="growth-field full"><label>Përshkrimi</label><textarea id="pwaDescription" rows="3">Libra fizikë dhe eBook nga ZemZem.</textarea></div>
   <div class="growth-field full"><div class="growth-actions"><button class="primary-btn">Ruaj PWA</button></div></div></form>
  </article>
  <article class="growth-card"><div class="pwa-preview"><div class="pwa-icon">ZZ</div><div><strong id="pwaPreviewName">ZemZem</strong><small style="display:block;opacity:.75;margin-top:4px">Installable Web App</small></div></div><p class="muted-note" style="margin-top:12px">PWA përdor service worker për cache të shell-it bazë dhe manifest dinamik nga konfigurimi i Adminit.</p></article>
 </div></section>`;
 marker.insertAdjacentHTML('beforebegin',html);
}
function injectNav(){
 const nav=q('.side-nav');if(!nav||q('[data-growth-view="collections"]'))return;
 const before=q('[data-view="integrations"]');
 const label=document.createElement('div');label.className='side-section-label';label.textContent='ZGJERIME';
 nav.insertBefore(label,before||null);
 for(const b of [button('collections','Collections / Series','◫'),button('affiliate','Affiliate','↗'),button('importexport','Import / Export','⇅'),button('pwa','PWA / App','▣')])nav.insertBefore(b,before||null);
}
function slugifyLocal(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function resetCollection(){editingCollection=null;q('#collectionForm')?.reset();if(q('#collectionSort'))q('#collectionSort').value='100';if(q('#collectionActive'))q('#collectionActive').value='true';if(q('#collectionId'))q('#collectionId').value='';q('#collectionBookPicker')?.setAttribute('hidden','');if(q('#collectionPickerEmpty'))q('#collectionPickerEmpty').hidden=false}
async function loadCollections(){
 if(!access()&&!(window.ZemZemAdminAccess?.permissions||[]).includes('catalog'))return;
 try{
  [collections,collectionItems]=await Promise.all([api('book_collections?select=*&order=sort_order.asc,name.asc'),api('book_collection_items?select=*&order=sort_order.asc')]);
  renderCollections();
 }catch(err){t(err.message,'error')}
}
function renderCollections(){
 const list=q('#collectionsList');if(!list)return;
 list.innerHTML=collections.map(c=>{
  const count=collectionItems.filter(x=>x.collection_id===c.id).length;
  return `<div class="growth-row"><div><strong>${e(c.name)}</strong><small>/collections.html?slug=${e(c.slug)} · ${count} libra · ${c.is_active?'Aktiv':'Joaktiv'}</small></div><div class="growth-row-actions"><button class="secondary-btn" data-edit-collection="${c.id}">Edito</button><button class="secondary-btn" data-books-collection="${c.id}">Librat</button><button class="danger-btn" data-delete-collection="${c.id}">Fshij</button></div></div>`
 }).join('')||'<div class="empty-state">Nuk ka collections ende.</div>';
 qa('[data-edit-collection]').forEach(b=>b.onclick=()=>editCollection(b.dataset.editCollection));
 qa('[data-books-collection]').forEach(b=>b.onclick=()=>openCollectionBooks(b.dataset.booksCollection));
 qa('[data-delete-collection]').forEach(b=>b.onclick=()=>deleteCollection(b.dataset.deleteCollection));
}
function editCollection(id){const c=collections.find(x=>x.id===id);if(!c)return;editingCollection=c;q('#collectionId').value=c.id;q('#collectionName').value=c.name;q('#collectionSlug').value=c.slug;q('#collectionDescription').value=c.description||'';q('#collectionCover').value=c.cover_url||'';q('#collectionActive').value=String(c.is_active);q('#collectionSort').value=c.sort_order??100}
async function saveCollection(ev){ev.preventDefault();const body={name:q('#collectionName').value.trim(),slug:q('#collectionSlug').value.trim()||slugifyLocal(q('#collectionName').value),description:q('#collectionDescription').value.trim()||null,cover_url:q('#collectionCover').value.trim()||null,is_active:q('#collectionActive').value==='true',sort_order:Number(q('#collectionSort').value||100),updated_at:new Date().toISOString()};try{if(editingCollection)await api('book_collections?id=eq.'+editingCollection.id,{method:'PATCH',body,prefer:'return=minimal'});else await api('book_collections',{method:'POST',body,prefer:'return=minimal'});t('Collection u ruajt');resetCollection();await loadCollections()}catch(err){t(err.message,'error')}}
async function deleteCollection(id){if(!confirm('Ta fshij këtë collection?'))return;try{await api('book_collections?id=eq.'+id,{method:'DELETE'});t('Collection u fshi');await loadCollections()}catch(err){t(err.message,'error')}}
async function openCollectionBooks(id){
 const c=collections.find(x=>x.id===id);if(!c)return;editingCollection=c;q('#collectionPickerEmpty').hidden=true;const wrap=q('#collectionBookPicker');wrap.hidden=false;
 let rows=typeof books!=='undefined'&&books?.length?books:await api('books?select=id,title,sku,status&order=title.asc&limit=2000');
 const selected=new Set(collectionItems.filter(x=>x.collection_id===id).map(x=>x.book_id));
 wrap.innerHTML=`<div class="book-picker">${rows.map(b=>`<label class="book-pick"><input type="checkbox" value="${b.id}" ${selected.has(b.id)?'checked':''}><span><strong>${e(b.title)}</strong><small>${e(b.sku||'')} · ${e(b.status||'')}</small></span></label>`).join('')}</div><div class="growth-actions"><button class="primary-btn" id="saveCollectionBooks">Ruaj librat</button></div>`;
 q('#saveCollectionBooks').onclick=()=>saveCollectionBooks(id,wrap);
}
async function saveCollectionBooks(id,wrap){const ids=qa('#collectionBookPicker input[type="checkbox"]:checked').map(x=>x.value);try{await api('book_collection_items?collection_id=eq.'+id,{method:'DELETE'});if(ids.length)await api('book_collection_items',{method:'POST',body:ids.map((book_id,i)=>({collection_id:id,book_id,sort_order:(i+1)*10})),prefer:'return=minimal'});t('Librat e collection u ruajtën');await loadCollections()}catch(err){t(err.message,'error')}}
function resetAffiliate(){editingPartner=null;q('#affiliateForm')?.reset();if(q('#affiliateCommission'))q('#affiliateCommission').value='5';if(q('#affiliateStatus'))q('#affiliateStatus').value='active';if(q('#affiliateId'))q('#affiliateId').value=''}
async function loadAffiliates(){if(!access())return;try{[partners,events]=await Promise.all([api('affiliate_partners?select=*&order=created_at.desc'),api('affiliate_events?select=*&order=created_at.desc&limit=5000')]);renderAffiliates()}catch(err){t(err.message,'error')}}
function renderAffiliates(){
 const list=q('#affiliateList');if(!list)return;
 list.innerHTML=partners.map(p=>{const ev=events.filter(x=>x.affiliate_id===p.id),clicks=ev.filter(x=>x.event_type==='click').length,orders=ev.filter(x=>x.event_type==='order').length,comm=ev.filter(x=>x.event_type==='order').reduce((s,x)=>s+Number(x.commission_amount||0),0),url='https://www.zemzem.al/?ref='+encodeURIComponent(p.code);return `<div class="growth-row"><div><strong>${e(p.name)} <span class="code-chip">${e(p.code)}</span></strong><small>${e(url)}</small><div class="growth-stat-grid"><div class="growth-stat"><span>Klikime</span><b>${clicks}</b></div><div class="growth-stat"><span>Porosi</span><b>${orders}</b></div><div class="growth-stat"><span>Komision</span><b>${comm.toFixed(2)} €</b></div></div></div><div class="growth-row-actions"><button class="secondary-btn" data-copy-aff="${e(url)}">Kopjo linkun</button><button class="secondary-btn" data-edit-aff="${p.id}">Edito</button><button class="danger-btn" data-delete-aff="${p.id}">Fshij</button></div></div>`}).join('')||'<div class="empty-state">Nuk ka partnerë affiliate.</div>';
 qa('[data-copy-aff]').forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copyAff);t('Linku u kopjua')});
 qa('[data-edit-aff]').forEach(b=>b.onclick=()=>editAffiliate(b.dataset.editAff));
 qa('[data-delete-aff]').forEach(b=>b.onclick=()=>deleteAffiliate(b.dataset.deleteAff));
}
function editAffiliate(id){const p=partners.find(x=>x.id===id);if(!p)return;editingPartner=p;q('#affiliateId').value=p.id;q('#affiliateName').value=p.name;q('#affiliateCode').value=p.code;q('#affiliateEmail').value=p.email||'';q('#affiliateCommission').value=p.commission_percent;q('#affiliateStatus').value=p.status;q('#affiliatePayout').value=p.payout_method||'';q('#affiliateNotes').value=p.notes||''}
async function saveAffiliate(ev){ev.preventDefault();const body={name:q('#affiliateName').value.trim(),code:q('#affiliateCode').value.trim().toUpperCase(),email:q('#affiliateEmail').value.trim()||null,commission_percent:Number(q('#affiliateCommission').value||0),status:q('#affiliateStatus').value,payout_method:q('#affiliatePayout').value.trim()||null,notes:q('#affiliateNotes').value.trim()||null,updated_at:new Date().toISOString()};try{if(editingPartner)await api('affiliate_partners?id=eq.'+editingPartner.id,{method:'PATCH',body,prefer:'return=minimal'});else await api('affiliate_partners',{method:'POST',body,prefer:'return=minimal'});t('Partneri u ruajt');resetAffiliate();await loadAffiliates()}catch(err){t(err.message,'error')}}
async function deleteAffiliate(id){if(!confirm('Ta fshij këtë partner affiliate?'))return;try{await api('affiliate_partners?id=eq.'+id,{method:'DELETE'});t('Partneri u fshi');await loadAffiliates()}catch(err){t(err.message,'error')}}
function csvCell(v){const s=String(v??'');return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s}
function download(name,text,type='text/csv;charset=utf-8'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
async function exportCsv(){try{const rows=await api('books?select=sku,title,slug,isbn,price,stock_quantity,status,language,format&order=title.asc&limit=5000');const headers=['sku','title','slug','isbn','price','stock_quantity','status','language','format'];const csv=[headers.join(','),...rows.map(r=>headers.map(h=>csvCell(r[h])).join(','))].join('\n');download('zemzem-books.csv',csv);t('CSV u shkarkua')}catch(err){t(err.message,'error')}}
function parseCsv(text){const rows=[];let row=[],cell='',qtd=false;for(let i=0;i<text.length;i++){const ch=text[i],n=text[i+1];if(qtd&&ch==='"'&&n==='"'){cell+='"';i++;continue}if(ch==='"'){qtd=!qtd;continue}if(!qtd&&ch===','){row.push(cell);cell='';continue}if(!qtd&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&n==='\n')i++;row.push(cell);cell='';if(row.some(x=>x!==''))rows.push(row);row=[];continue}cell+=ch}row.push(cell);if(row.some(x=>x!==''))rows.push(row);return rows}
function importPreview(file){const fr=new FileReader();fr.onload=()=>{const rows=parseCsv(String(fr.result||''));if(rows.length<2){t('CSV është bosh','error');return}const headers=rows[0].map(x=>x.trim());const allowed=['sku','title','slug','isbn','price','stock_quantity','status','language','format'];if(!['sku','title','slug'].every(x=>headers.includes(x))){t('CSV duhet të ketë së paku sku, title, slug','error');return}importRows=rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??'']))).filter(x=>x.sku&&x.title&&x.slug).map(x=>({sku:x.sku.trim(),title:x.title.trim(),slug:x.slug.trim(),isbn:x.isbn?.trim()||null,price:Number(x.price||0),stock_quantity:Number(x.stock_quantity||0),status:allowed.includes('status')?(x.status||'draft').trim():'draft',language:x.language?.trim()||null,format:x.format?.trim()||'physical',updated_at:new Date().toISOString()}));renderImportPreview();q('#applyBooksImport').disabled=!importRows.length};fr.readAsText(file)}
function renderImportPreview(){const wrap=q('#importPreview');q('#importStatus').textContent=importRows.length+' rreshta gati për import.';wrap.innerHTML='<table class="preview-table"><thead><tr><th>SKU</th><th>Titulli</th><th>Slug</th><th>Çmimi</th><th>Stoku</th><th>Statusi</th></tr></thead><tbody>'+importRows.slice(0,100).map(r=>`<tr><td>${e(r.sku)}</td><td>${e(r.title)}</td><td>${e(r.slug)}</td><td>${r.price}</td><td>${r.stock_quantity}</td><td>${e(r.status)}</td></tr>`).join('')+'</tbody></table>'}
async function applyImport(){if(!importRows.length)return;const b=q('#applyBooksImport');b.disabled=true;q('#importStatus').textContent='Duke importuar…';try{await api('books?on_conflict=sku',{method:'POST',body:importRows,prefer:'resolution=merge-duplicates,return=minimal'});q('#importStatus').textContent='Importi u krye: '+importRows.length+' libra.';t('Importi u krye');importRows=[];b.disabled=true;if(typeof loadBooks==='function')await loadBooks()}catch(err){q('#importStatus').textContent='Importi dështoi: '+err.message;t(err.message,'error');b.disabled=false}}
function templateCsv(){download('zemzem-books-template.csv','sku,title,slug,isbn,price,stock_quantity,status,language,format\nLIB-001,Shembull Libri,shembull-libri,9780000000000,9.90,10,draft,sq,physical\n')}
async function loadPwa(){try{const rows=await api('site_content?key=eq.pwa&select=content&limit=1');const x=rows?.[0]?.content||{};q('#pwaEnabled').value=String(x.enabled!==false);q('#pwaPrompt').value=String(x.install_prompt_enabled!==false);q('#pwaName').value=x.app_name||'ZemZem';q('#pwaShort').value=x.short_name||'ZemZem';q('#pwaTheme').value=x.theme_color||'#233a4a';q('#pwaBg').value=x.background_color||'#ffffff';q('#pwaDescription').value=x.description||'Libra fizikë dhe eBook nga ZemZem.';q('#pwaPreviewName').textContent=q('#pwaName').value}catch(err){t(err.message,'error')}}
async function savePwa(ev){ev.preventDefault();const content={enabled:q('#pwaEnabled').value==='true',install_prompt_enabled:q('#pwaPrompt').value==='true',app_name:q('#pwaName').value.trim()||'ZemZem',short_name:q('#pwaShort').value.trim()||'ZemZem',theme_color:q('#pwaTheme').value,background_color:q('#pwaBg').value,description:q('#pwaDescription').value.trim()};try{const rows=await api('site_content?key=eq.pwa&select=key&limit=1');if(rows?.length)await api('site_content?key=eq.pwa',{method:'PATCH',body:{content,updated_at:new Date().toISOString()},prefer:'return=minimal'});else await api('site_content',{method:'POST',body:{key:'pwa',content},prefer:'return=minimal'});q('#pwaPreviewName').textContent=content.app_name;t('PWA u ruajt')}catch(err){t(err.message,'error')}}
function bind(){
 q('#collectionForm').addEventListener('submit',saveCollection);q('#collectionReset').onclick=resetCollection;q('#collectionName').addEventListener('input',()=>{if(!editingCollection)q('#collectionSlug').value=slugifyLocal(q('#collectionName').value)});
 q('#affiliateForm').addEventListener('submit',saveAffiliate);q('#affiliateReset').onclick=resetAffiliate;q('#affiliateName').addEventListener('input',()=>{if(!editingPartner&&!q('#affiliateCode').value)q('#affiliateCode').value=slugifyLocal(q('#affiliateName').value).replaceAll('-','').toUpperCase().slice(0,16)});
 q('#exportBooksCsv').onclick=exportCsv;q('#downloadCsvTemplate').onclick=templateCsv;q('#importBooksFile').onchange=()=>q('#importBooksFile').files?.[0]&&importPreview(q('#importBooksFile').files[0]);q('#applyBooksImport').onclick=applyImport;
 q('#pwaForm').addEventListener('submit',savePwa);q('#pwaName').addEventListener('input',()=>q('#pwaPreviewName').textContent=q('#pwaName').value||'ZemZem');
}
function init(){injectStyle();injectViews();injectNav();bind()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();