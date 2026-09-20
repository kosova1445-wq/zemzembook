(()=>{
'use strict';
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=n=>Number(n||0).toFixed(2)+' €';
let tasks=[],notes=[],flags=[],errors=[],warehouses=[],stockLocs=[],proformas=[],proItems=[],payouts=[],pwaStats=[],releases=[];

function ok(msg,type='ok'){if(typeof toast==='function')toast(msg,type)}
function full(){return !!window.ZemZemAdminAccess?.full_access}
function viewButton(name,label,icon='◈'){const b=document.createElement('button');b.className='nav-item';b.dataset.superView=name;b.innerHTML=icon+' '+label;b.onclick=()=>openView(name);return b}
function openView(name){
 qa('.nav-item').forEach(x=>x.classList.remove('active'));qa('.view').forEach(x=>x.classList.remove('active-view'));
 q('[data-super-view="'+name+'"]')?.classList.add('active');q('#view-'+name)?.classList.add('active-view');
 const map={command:'Command Center',bulk:'Bulk Center',profit:'Profit & Warehouse',quotes:'Quotes / Proforma',system:'System Center'};
 if(q('#viewTitle'))q('#viewTitle').textContent=map[name]||name;
 if(name==='command')loadCommand();if(name==='bulk')renderBulk();if(name==='profit')loadProfit();if(name==='quotes')loadQuotes();if(name==='system')loadSystem();
 if(window.innerWidth<=760)q('.sidebar')?.classList.remove('mobile-open');
}
function style(){
 if(q('#adminSuperSuiteStyle'))return;
 document.head.insertAdjacentHTML('beforeend',`<style id="adminSuperSuiteStyle">
 .super-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}.super-card{grid-column:span 6;background:#fff;border:1px solid #e2e9e5;border-radius:18px;padding:18px}.super-card.span-12{grid-column:1/-1}.super-card.span-4{grid-column:span 4}.super-card h3{margin:0 0 5px;color:var(--navy,#233a4a)}.super-card>p{margin:0 0 14px;color:#77858c;font-size:12px}.super-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}.super-toolbar input,.super-toolbar select,.super-field input,.super-field select,.super-field textarea{min-height:40px;border:1px solid #dce5e0;border-radius:9px;padding:8px 10px;background:#fff}.super-toolbar input{flex:1;min-width:180px}.super-list{display:grid;gap:8px}.super-row{border:1px solid #e8edeb;border-radius:11px;padding:11px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.super-row small{display:block;color:#7a8880;margin-top:3px}.super-actions{display:flex;gap:6px;flex-wrap:wrap}.super-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.super-field{display:grid;gap:5px}.super-field.full{grid-column:1/-1}.super-field label{font-size:10px;font-weight:900;color:#66756d;text-transform:uppercase}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.metric{padding:13px;border:1px solid #e4ebe7;border-radius:12px;background:#fafcfb}.metric span{display:block;color:#77857d;font-size:10px}.metric b{display:block;font-size:19px;margin-top:4px;color:#203b2e}.notif-bell{position:relative}.notif-count{position:absolute;right:-4px;top:-6px;min-width:18px;height:18px;border-radius:999px;padding:0 5px;background:#d04b3e;color:#fff;font-size:9px;display:grid;place-items:center}.command-overlay{position:fixed;inset:0;background:rgba(12,21,17,.52);z-index:500;display:grid;place-items:start center;padding-top:10vh}.command-overlay[hidden]{display:none}.command-box{width:min(760px,94vw);background:#fff;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.25);overflow:hidden}.command-box input{width:100%;border:0;border-bottom:1px solid #e7ece9;padding:18px;font-size:17px;outline:0}.command-results{max-height:60vh;overflow:auto;padding:8px}.command-item{width:100%;border:0;background:#fff;border-radius:10px;padding:11px 12px;text-align:left;display:flex;justify-content:space-between;gap:10px}.command-item:hover{background:#f3f7f5}.command-item small{color:#7a8880}.bulk-list{max-height:500px;overflow:auto;border:1px solid #e4ebe7;border-radius:12px}.bulk-row{display:grid;grid-template-columns:34px 1fr 120px 120px;gap:8px;align-items:center;padding:9px 10px;border-bottom:1px solid #eef2f0}.health-ok{color:#17653b}.health-warn{color:#986100}.health-bad{color:#a22118}.flag-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-bottom:1px solid #eef2f0;padding:10px 0}.toggle{width:44px;height:24px;border-radius:999px;border:0;background:#cfd8d3;position:relative}.toggle:after{content:'';position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.18s}.toggle.on{background:#2d7252}.toggle.on:after{left:23px}.pick-table{width:100%;border-collapse:collapse}.pick-table th,.pick-table td{padding:8px 10px;border-bottom:1px solid #edf1ef;font-size:11px;text-align:left}.tag{display:inline-flex;padding:3px 7px;border-radius:999px;background:#eff4f1;font-size:10px}.scan-box{border:1px dashed #bdcbc3;border-radius:12px;padding:14px;text-align:center}.maintenance-banner{padding:10px 12px;border-radius:10px;background:#fff4df;color:#805600;margin-bottom:10px}
 @media(max-width:1000px){.super-card,.super-card.span-4{grid-column:1/-1}.metric-grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.super-form{grid-template-columns:1fr}.super-field.full{grid-column:auto}.metric-grid{grid-template-columns:1fr}.bulk-row{grid-template-columns:30px 1fr}.bulk-row>*:nth-child(n+3){display:none}}
 </style>`);
}
function nav(){
 const n=q('.side-nav');if(!n||q('[data-super-view="command"]'))return;
 const before=q('[data-growth-view="collections"]')||q('[data-view="integrations"]');
 const label=document.createElement('div');label.className='side-section-label';label.textContent='COMMAND';
 n.insertBefore(label,before||null);
 [viewButton('command','Command Center','⌘'),viewButton('bulk','Bulk Center','☷'),viewButton('profit','Profit & Warehouse','€'),viewButton('quotes','Quotes / Proforma','▤'),viewButton('system','System Center','⚙')].forEach(b=>n.insertBefore(b,before||null));
}
function views(){
 if(q('#view-command'))return;
 const main=q('.main'),marker=q('#view-integrations')||main?.lastElementChild;if(!main)return;
 marker.insertAdjacentHTML('beforebegin',`
 <section id="view-command" class="view"><div class="super-grid">
  <article class="super-card span-12"><div class="metric-grid"><div class="metric"><span>Detyra aktive</span><b id="ccTasks">0</b></div><div class="metric"><span>Njoftime pa lexuar</span><b id="ccNotifs">0</b></div><div class="metric"><span>Gabime aktive</span><b id="ccErrors">0</b></div><div class="metric"><span>Porosi në pritje</span><b id="ccPending">0</b></div></div></article>
  <article class="super-card"><h3>Quick Actions</h3><p>Veprimet më të përdorura nga një vend.</p><div class="super-actions" id="quickActions"></div></article>
  <article class="super-card"><h3>Detyrë e re</h3><form id="taskForm" class="super-form"><div class="super-field full"><label>Titulli</label><input id="taskTitle" required></div><div class="super-field"><label>Prioriteti</label><select id="taskPriority"><option>normal</option><option>high</option><option>urgent</option><option>low</option></select></div><div class="super-field"><label>Afati</label><input id="taskDue" type="datetime-local"></div><div class="super-field full"><label>Përshkrimi</label><textarea id="taskDescription" rows="3"></textarea></div><div class="super-field full"><button class="primary-btn">Shto detyrën</button></div></form></article>
  <article class="super-card"><h3>Tasks / To-Do</h3><div id="taskList" class="super-list"></div></article>
  <article class="super-card"><h3>Notifications</h3><div class="super-toolbar"><button class="secondary-btn" id="markAllNotifs">Shëno të gjitha si të lexuara</button></div><div id="notifList" class="super-list"></div></article>
 </div></section>

 <section id="view-bulk" class="view"><div class="super-grid">
  <article class="super-card span-12"><h3>Bulk Actions — Libra</h3><p>Zgjidh disa libra dhe apliko ndryshime në një hap.</p><div class="super-toolbar"><input id="bulkBookSearch" placeholder="Kërko libër / SKU"><select id="bulkBookStatus"><option value="">— Ndrysho statusin —</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><input id="bulkBookStock" type="number" placeholder="Vendos stok"><button class="primary-btn" id="applyBookBulk">Apliko</button><button class="secondary-btn" id="exportSelectedBooks">Export selected</button></div><div id="bulkBooks" class="bulk-list"></div></article>
  <article class="super-card span-12"><h3>Bulk Actions — Porosi</h3><div class="super-toolbar"><select id="bulkOrderStatus"><option value="">— Ndrysho statusin —</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><button class="primary-btn" id="applyOrderBulk">Apliko te të zgjedhurat</button><button class="secondary-btn" id="printPickList">Print Pick List</button></div><div id="bulkOrders" class="bulk-list"></div></article>
 </div></section>

 <section id="view-profit" class="view"><div class="super-grid">
  <article class="super-card span-12"><h3>Profit Center</h3><p>Të ardhura, kosto dhe margjina nga katalogu fizik.</p><div id="profitMetrics" class="metric-grid"></div><div id="profitTable" style="overflow:auto;margin-top:14px"></div></article>
  <article class="super-card"><h3>Warehouse Locations</h3><form id="warehouseForm" class="super-form"><div class="super-field"><label>Kodi</label><input id="whCode" required placeholder="MAG-1"></div><div class="super-field"><label>Emri</label><input id="whName" required placeholder="Magazina kryesore"></div><div class="super-field full"><button class="primary-btn">Shto lokacionin</button></div></form><div id="warehouseList" class="super-list" style="margin-top:12px"></div></article>
  <article class="super-card"><h3>Vendos stok sipas lokacionit</h3><div class="super-form"><div class="super-field"><label>Lokacioni</label><select id="stockWh"></select></div><div class="super-field"><label>Libri</label><select id="stockBook"></select></div><div class="super-field"><label>Sasia</label><input id="stockQty" type="number" min="0"></div><div class="super-field"><label>Rafti</label><input id="stockShelf" placeholder="A-03"></div><div class="super-field full"><button class="primary-btn" id="saveLocationStock">Ruaj stokun</button></div></div></article>
  <article class="super-card span-12"><h3>Pick / Packing List</h3><p>Lista e artikujve nga porositë aktive për magazinë.</p><div id="pickList"></div></article>
 </div></section>

 <section id="view-quotes" class="view"><div class="super-grid">
  <article class="super-card"><h3>Proforma e re</h3><form id="proformaForm" class="super-form"><div class="super-field"><label>Klienti</label><input id="pfName" required></div><div class="super-field"><label>Email</label><input id="pfEmail" type="email"></div><div class="super-field"><label>Telefon</label><input id="pfPhone"></div><div class="super-field"><label>Kompania</label><input id="pfCompany"></div><div class="super-field"><label>Transporti €</label><input id="pfShipping" type="number" step=".01" value="0"></div><div class="super-field"><label>Zbritja €</label><input id="pfDiscount" type="number" step=".01" value="0"></div><div class="super-field"><label>Valid deri</label><input id="pfValid" type="date"></div><div class="super-field full"><label>Shënime</label><textarea id="pfNotes" rows="2"></textarea></div><div class="super-field full"><button class="primary-btn">Krijo proformën</button></div></form></article>
  <article class="super-card"><h3>Shto artikull</h3><div class="super-form"><div class="super-field full"><label>Libri</label><select id="pfBook"></select></div><div class="super-field"><label>Sasia</label><input id="pfQty" type="number" min="1" value="1"></div><div class="super-field"><label>Çmimi</label><input id="pfPrice" type="number" step=".01"></div><div class="super-field full"><button class="primary-btn" id="addPfItem" disabled>Shto artikull</button></div></div><div id="pfCurrent" class="super-list" style="margin-top:12px"></div></article>
  <article class="super-card span-12"><h3>Proformat</h3><div id="proformaList" class="super-list"></div></article>
 </div></section>

 <section id="view-system" class="view"><div class="super-grid">
  <article class="super-card span-12"><h3>Health Center</h3><div id="healthGrid" class="metric-grid"></div></article>
  <article class="super-card"><h3>Error Center</h3><div class="super-toolbar"><button class="secondary-btn" id="resolveAllErrors">Resolve all</button></div><div id="errorList" class="super-list"></div></article>
  <article class="super-card"><h3>Feature Flags</h3><p>Ndez/fik module pa ndryshuar kodin.</p><div id="flagList"></div></article>
  <article class="super-card"><h3>Maintenance & Preview</h3><div id="maintenanceState"></div><div class="super-actions"><button class="secondary-btn" id="toggleMaintenance">Toggle Maintenance</button><button class="secondary-btn" id="openDesktopPreview">Preview Desktop</button><button class="secondary-btn" id="openMobilePreview">Preview Mobile</button><button class="secondary-btn" id="snapshotConfig">Snapshot Config</button></div></article>
  <article class="super-card"><h3>PWA Analytics</h3><div id="pwaMetrics" class="metric-grid"></div></article>
  <article class="super-card"><h3>Affiliate Payout Center</h3><div id="payoutList" class="super-list"></div></article>
  <article class="super-card span-12"><h3>Release Center</h3><div class="super-toolbar"><input id="releaseVersion" placeholder="v1.0.0"><input id="releaseSha" placeholder="Commit SHA"><input id="releaseTitle" placeholder="Titulli"><button class="primary-btn" id="addRelease">Shto release note</button></div><div id="releaseList" class="super-list"></div></article>
 </div></section>

 <div id="adminCommandOverlay" class="command-overlay" hidden><div class="command-box"><input id="commandInput" placeholder="Kërko libër, porosi, klient, kupon... (Esc për mbyllje)"><div id="commandResults" class="command-results"></div></div></div>`);
}
async function loadCommand(){
 try{
  [tasks,notes,errors]=await Promise.all([api('admin_tasks?select=*&order=created_at.desc&limit=200'),api('admin_notifications?select=*&order=created_at.desc&limit=200'),api('app_error_logs?resolved=eq.false&select=*&order=created_at.desc&limit=100')]);
  renderCommand();
 }catch(e){ok(e.message,'error')}
}
function renderCommand(){
 q('#ccTasks').textContent=tasks.filter(x=>!['done','cancelled'].includes(x.status)).length;
 q('#ccNotifs').textContent=notes.filter(x=>!x.is_read).length;q('#ccErrors').textContent=errors.length;
 q('#ccPending').textContent=(typeof orders!=='undefined'?orders:[]).filter(x=>['pending','confirmed'].includes(x.order_status)).length;
 q('#taskList').innerHTML=tasks.slice(0,30).map(x=>`<div class="super-row"><div><b>${E(x.title)}</b><small>${E(x.priority)} · ${x.due_at?new Date(x.due_at).toLocaleString('sq-AL'):'pa afat'} · ${E(x.status)}</small></div><div class="super-actions"><button class="secondary-btn" data-task-done="${x.id}">Done</button><button class="danger-btn" data-task-del="${x.id}">Fshi</button></div></div>`).join('')||'<div class="empty-state">Pa detyra.</div>';
 q('#notifList').innerHTML=notes.slice(0,30).map(x=>`<div class="super-row"><div><b>${E(x.title)}</b><small>${E(x.body||'')} · ${new Date(x.created_at).toLocaleString('sq-AL')}</small></div><button class="secondary-btn" data-notif-read="${x.id}">${x.is_read?'Lexuar':'Shëno lexuar'}</button></div>`).join('')||'<div class="empty-state">Pa njoftime.</div>';
 qa('[data-task-done]').forEach(b=>b.onclick=()=>taskDone(b.dataset.taskDone));qa('[data-task-del]').forEach(b=>b.onclick=()=>taskDel(b.dataset.taskDel));qa('[data-notif-read]').forEach(b=>b.onclick=()=>notifRead(b.dataset.notifRead));
 const qaWrap=q('#quickActions');qaWrap.innerHTML='';
 const actions=[['Libër i ri',()=>q('#newBookBtn')?.click()],['Porositë',()=>typeof setView==='function'&&setView('orders')],['Kupon',()=>typeof setView==='function'&&setView('coupons')],['Gift Card',()=>q('[data-view="gift-cards"]')?.click()],['Collection',()=>openView('collections')],['Affiliate',()=>openView('affiliate')],['Proforma',()=>openView('quotes')],['Backup',()=>q('[data-view="backup"]')?.click()]];
 actions.forEach(([label,fn])=>{const b=document.createElement('button');b.className='secondary-btn';b.textContent=label;b.onclick=fn;qaWrap.appendChild(b)});
 updateBell();
}
async function addTask(e){e.preventDefault();const body={title:q('#taskTitle').value.trim(),description:q('#taskDescription').value.trim()||null,priority:q('#taskPriority').value,due_at:q('#taskDue').value?new Date(q('#taskDue').value).toISOString():null};try{await api('admin_tasks',{method:'POST',body,prefer:'return=minimal'});q('#taskForm').reset();ok('Detyra u shtua');await loadCommand()}catch(err){ok(err.message,'error')}}
async function taskDone(id){await api('admin_tasks?id=eq.'+id,{method:'PATCH',body:{status:'done',updated_at:new Date().toISOString()},prefer:'return=minimal'});await loadCommand()}
async function taskDel(id){if(!confirm('Ta fshij detyrën?'))return;await api('admin_tasks?id=eq.'+id,{method:'DELETE'});await loadCommand()}
async function notifRead(id){await api('admin_notifications?id=eq.'+id,{method:'PATCH',body:{is_read:true},prefer:'return=minimal'});await loadCommand()}
async function markAll(){await api('admin_notifications?is_read=eq.false',{method:'PATCH',body:{is_read:true},prefer:'return=minimal'});await loadCommand()}
function bell(){
 if(q('#adminNotifBell'))return;
 const actions=q('.top-actions');if(!actions)return;
 const b=document.createElement('button');b.id='adminNotifBell';b.className='icon-action notif-bell';b.type='button';b.innerHTML='🔔<span id="adminNotifCount" class="notif-count" hidden>0</span>';b.onclick=()=>openView('command');actions.insertBefore(b,actions.firstChild);
}
function updateBell(){const n=notes.filter(x=>!x.is_read).length,el=q('#adminNotifCount');if(!el)return;el.textContent=n;el.hidden=!n}
function command(){
 if(!q('#adminCommandOverlay'))return;
 const overlay=q('#adminCommandOverlay'),inp=q('#commandInput');document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden=false;inp.value='';renderCommandSearch('');setTimeout(()=>inp.focus(),20)}else if(e.key==='Escape')overlay.hidden=true});
 overlay.onclick=e=>{if(e.target===overlay)overlay.hidden=true};inp.oninput=()=>renderCommandSearch(inp.value);
}
function renderCommandSearch(term){
 const s=String(term||'').trim().toLowerCase(),res=[];
 const B=typeof books!=='undefined'?books:[],O=typeof orders!=='undefined'?orders:[],C=typeof customers!=='undefined'?customers:[],CP=typeof coupons!=='undefined'?coupons:[];
 B.filter(x=>!s||(`${x.title} ${x.sku||''} ${x.isbn||''}`.toLowerCase().includes(s))).slice(0,8).forEach(x=>res.push({type:'Libër',title:x.title,sub:x.sku||'',go:()=>{overlayClose();typeof setView==='function'&&setView('books')}}));
 O.filter(x=>!s||(`${x.order_number} ${x.first_name||''} ${x.last_name||''} ${x.guest_email||''}`.toLowerCase().includes(s))).slice(0,8).forEach(x=>res.push({type:'Porosi',title:x.order_number,sub:(x.first_name||'')+' '+(x.last_name||''),go:()=>{overlayClose();typeof setView==='function'&&setView('orders')}}));
 C.filter(x=>!s||JSON.stringify(x).toLowerCase().includes(s)).slice(0,6).forEach(x=>res.push({type:'Klient',title:x.full_name||x.email||x.user_id||'Klient',sub:x.email||'',go:()=>{overlayClose();typeof setView==='function'&&setView('customers')}}));
 CP.filter(x=>!s||String(x.code||'').toLowerCase().includes(s)).slice(0,6).forEach(x=>res.push({type:'Kupon',title:x.code,sub:x.discount_type||'',go:()=>{overlayClose();typeof setView==='function'&&setView('coupons')}}));
 q('#commandResults').innerHTML=res.map((x,i)=>`<button class="command-item" data-command="${i}"><span><b>${E(x.title)}</b><small>${E(x.sub)}</small></span><span class="tag">${E(x.type)}</span></button>`).join('')||'<div class="empty-state">Nuk u gjet asgjë.</div>';
 qa('[data-command]').forEach(b=>b.onclick=()=>res[Number(b.dataset.command)].go());
}
function overlayClose(){q('#adminCommandOverlay').hidden=true}
function renderBulk(){
 const B=typeof books!=='undefined'?books:[],O=typeof orders!=='undefined'?orders:[];
 const s=(q('#bulkBookSearch')?.value||'').toLowerCase();
 q('#bulkBooks').innerHTML=B.filter(x=>!s||(`${x.title} ${x.sku||''}`.toLowerCase().includes(s))).map(x=>`<label class="bulk-row"><input type="checkbox" data-bulk-book="${x.id}"><span><b>${E(x.title)}</b><small>${E(x.sku||'')}</small></span><span>${E(x.status)}</span><span>Stok: ${Number(x.stock_quantity||0)}</span></label>`).join('');
 q('#bulkOrders').innerHTML=O.slice(0,300).map(x=>`<label class="bulk-row"><input type="checkbox" data-bulk-order="${x.id}"><span><b>${E(x.order_number)}</b><small>${E((x.first_name||'')+' '+(x.last_name||''))}</small></span><span>${E(x.order_status)}</span><span>${M(x.total)}</span></label>`).join('');
}
async function applyBookBulk(){
 const ids=qa('[data-bulk-book]:checked').map(x=>x.dataset.bulkBook);if(!ids.length)return ok('Zgjidh së paku një libër','error');
 const body={updated_at:new Date().toISOString()};if(q('#bulkBookStatus').value)body.status=q('#bulkBookStatus').value;if(q('#bulkBookStock').value!=='')body.stock_quantity=Number(q('#bulkBookStock').value);
 try{await api('books?id=in.('+ids.join(',')+')',{method:'PATCH',body,prefer:'return=minimal'});ok('Librat u përditësuan');if(typeof loadBooks==='function')await loadBooks();renderBulk()}catch(e){ok(e.message,'error')}
}
async function applyOrderBulk(){
 const ids=qa('[data-bulk-order]:checked').map(x=>x.dataset.bulkOrder),st=q('#bulkOrderStatus').value;if(!ids.length||!st)return ok('Zgjidh porositë dhe statusin','error');
 if(['delivered','cancelled'].includes(st)&&!confirm('Ky është ndryshim i rëndësishëm. Vazhdo?'))return;
 try{for(const id of ids)await api('rpc/admin_update_physical_order',{method:'POST',body:{p_order_id:id,p_order_status:st,p_shipping_carrier:null,p_tracking_number:null,p_cancellation_reason:st==='cancelled'?'Bulk action':null,p_notes:'Bulk action'}});ok('Porositë u përditësuan');if(typeof loadOrders==='function')await loadOrders();renderBulk()}catch(e){ok(e.message,'error')}
}
function exportSelected(){
 const ids=new Set(qa('[data-bulk-book]:checked').map(x=>x.dataset.bulkBook)),B=(typeof books!=='undefined'?books:[]).filter(x=>ids.has(x.id));if(!B.length)return ok('Zgjidh libra','error');
 const cols=['sku','title','isbn','price','stock_quantity','status'],csv=[cols.join(','),...B.map(r=>cols.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='zemzem-selected-books.csv';a.click();URL.revokeObjectURL(a.href)
}
async function loadProfit(){
 try{
  const B=typeof books!=='undefined'?books:await api('books?select=*&limit=2000');warehouses=await api('warehouse_locations?select=*&order=name.asc');stockLocs=await api('stock_location_quantities?select=*&limit=5000');renderProfit(B)
 }catch(e){ok(e.message,'error')}
}
function renderProfit(B){
 const sold=typeof orders!=='undefined'?orders.filter(o=>o.order_status!=='cancelled'):[],revenue=sold.reduce((s,o)=>s+Number(o.total||0),0),inventoryCost=B.reduce((s,b)=>s+Number(b.cost_price||0)*Number(b.stock_quantity||0),0),inventoryRetail=B.reduce((s,b)=>s+Number(b.price||0)*Number(b.stock_quantity||0),0);
 q('#profitMetrics').innerHTML=`<div class="metric"><span>Revenue porosi</span><b>${M(revenue)}</b></div><div class="metric"><span>Vlerë retail e stokut</span><b>${M(inventoryRetail)}</b></div><div class="metric"><span>Kosto e stokut</span><b>${M(inventoryCost)}</b></div><div class="metric"><span>Potencial bruto</span><b>${M(inventoryRetail-inventoryCost)}</b></div>`;
 const rows=[...B].sort((a,b)=>(Number(b.price||0)-Number(b.cost_price||0))-(Number(a.price||0)-Number(a.cost_price||0))).slice(0,100);
 q('#profitTable').innerHTML='<table class="pick-table"><thead><tr><th>Libri</th><th>Çmimi</th><th>Kosto</th><th>Fitim/copë</th><th>Margjina</th><th>Stok</th></tr></thead><tbody>'+rows.map(b=>{const p=Number(b.price||0)-Number(b.cost_price||0),m=Number(b.price||0)>0?p/Number(b.price)*100:0;return `<tr><td>${E(b.title)}</td><td>${M(b.price)}</td><td>${M(b.cost_price)}</td><td>${M(p)}</td><td>${m.toFixed(1)}%</td><td>${Number(b.stock_quantity||0)}</td></tr>`}).join('')+'</tbody></table>';
 q('#warehouseList').innerHTML=warehouses.map(w=>`<div class="super-row"><div><b>${E(w.code)} · ${E(w.name)}</b><small>${w.active?'Aktiv':'Joaktiv'}</small></div><button class="danger-btn" data-wh-del="${w.id}">Fshi</button></div>`).join('')||'<div class="empty-state">Pa lokacione.</div>';
 qa('[data-wh-del]').forEach(b=>b.onclick=()=>deleteWh(b.dataset.whDel));
 q('#stockWh').innerHTML='<option value="">— Zgjidh —</option>'+warehouses.map(w=>`<option value="${w.id}">${E(w.code)} · ${E(w.name)}</option>`).join('');
 q('#stockBook').innerHTML='<option value="">— Zgjidh —</option>'+B.map(b=>`<option value="${b.id}">${E(b.title)} · ${E(b.sku||'')}</option>`).join('');
 q('#pickList').innerHTML=buildPickList();
}
function buildPickList(){
 const O=(typeof orders!=='undefined'?orders:[]).filter(o=>['confirmed','processing'].includes(o.order_status));if(!O.length)return '<div class="empty-state">Nuk ka porosi për paketim.</div>';
 return '<table class="pick-table"><thead><tr><th>Porosia</th><th>Klienti</th><th>Statusi</th><th>Totali</th></tr></thead><tbody>'+O.map(o=>`<tr><td>${E(o.order_number)}</td><td>${E((o.first_name||'')+' '+(o.last_name||''))}</td><td>${E(o.order_status)}</td><td>${M(o.total)}</td></tr>`).join('')+'</tbody></table>'
}
async function addWh(e){e.preventDefault();try{await api('warehouse_locations',{method:'POST',body:{code:q('#whCode').value.trim().toUpperCase(),name:q('#whName').value.trim()},prefer:'return=minimal'});q('#warehouseForm').reset();ok('Lokacioni u shtua');await loadProfit()}catch(err){ok(err.message,'error')}}
async function deleteWh(id){if(!confirm('Ta fshij lokacionin?'))return;await api('warehouse_locations?id=eq.'+id,{method:'DELETE'});await loadProfit()}
async function saveLocStock(){const location_id=q('#stockWh').value,book_id=q('#stockBook').value;if(!location_id||!book_id)return ok('Zgjidh lokacionin dhe librin','error');const body={location_id,book_id,quantity:Number(q('#stockQty').value||0),shelf:q('#stockShelf').value.trim()||null,updated_at:new Date().toISOString()};try{await api('stock_location_quantities?on_conflict=location_id,book_id',{method:'POST',body,prefer:'resolution=merge-duplicates,return=minimal'});ok('Stoku sipas lokacionit u ruajt');await loadProfit()}catch(e){ok(e.message,'error')}}
function printPick(){const w=window.open('','_blank');w.document.write('<html><head><title>Pick List</title></head><body><h2>ZemZem — Pick List</h2>'+buildPickList()+'<script>window.print()<\/script></body></html>');w.document.close()}
async function loadQuotes(){
 try{[proformas,proItems]=await Promise.all([api('proformas?select=*&order=created_at.desc&limit=300'),api('proforma_items?select=*&limit=3000')]);renderQuotes()}catch(e){ok(e.message,'error')}
}
function renderQuotes(){
 const B=typeof books!=='undefined'?books:[];q('#pfBook').innerHTML='<option value="">— Zgjidh librin —</option>'+B.map(b=>`<option value="${b.id}" data-price="${Number(b.price||0)}">${E(b.title)} · ${M(b.price)}</option>`).join('');
 q('#proformaList').innerHTML=proformas.map(p=>`<div class="super-row"><div><b>${E(p.number)} · ${E(p.customer_name)}</b><small>${E(p.status)} · ${M(p.total)} · ${p.valid_until||'pa afat'}</small></div><div class="super-actions"><button class="secondary-btn" data-pf-open="${p.id}">Hap</button><button class="secondary-btn" data-pf-print="${p.id}">Print</button><button class="danger-btn" data-pf-del="${p.id}">Fshi</button></div></div>`).join('')||'<div class="empty-state">Pa proforma.</div>';
 qa('[data-pf-open]').forEach(b=>b.onclick=()=>openPf(b.dataset.pfOpen));qa('[data-pf-print]').forEach(b=>b.onclick=()=>printPf(b.dataset.pfPrint));qa('[data-pf-del]').forEach(b=>b.onclick=()=>deletePf(b.dataset.pfDel));
}
async function newPf(e){e.preventDefault();const num='PF-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();const body={number:num,customer_name:q('#pfName').value.trim(),customer_email:q('#pfEmail').value.trim()||null,customer_phone:q('#pfPhone').value.trim()||null,company_name:q('#pfCompany').value.trim()||null,shipping:Number(q('#pfShipping').value||0),discount:Number(q('#pfDiscount').value||0),total:Number(q('#pfShipping').value||0)-Number(q('#pfDiscount').value||0),valid_until:q('#pfValid').value||null,notes:q('#pfNotes').value.trim()||null};try{const r=await api('proformas',{method:'POST',body,prefer:'return=representation'});q('#proformaForm').reset();ok('Proforma u krijua');await loadQuotes();openPf(r?.[0]?.id)}catch(err){ok(err.message,'error')}}
function openPf(id){const p=proformas.find(x=>x.id===id);if(!p)return;q('#addPfItem').disabled=false;q('#addPfItem').dataset.pf=id;const items=proItems.filter(x=>x.proforma_id===id);q('#pfCurrent').innerHTML=`<div class="super-row"><div><b>${E(p.number)} · ${E(p.customer_name)}</b><small>Total ${M(p.total)}</small></div><span class="tag">${E(p.status)}</span></div>`+items.map(i=>`<div class="super-row"><div>${E(i.description)}<small>${i.quantity} × ${M(i.unit_price)}</small></div><b>${M(i.line_total)}</b></div>`).join('')}
async function addPfItem(){const id=q('#addPfItem').dataset.pf,book_id=q('#pfBook').value;if(!id||!book_id)return;const b=(typeof books!=='undefined'?books:[]).find(x=>x.id===book_id),qty=Math.max(1,Number(q('#pfQty').value||1)),price=Number(q('#pfPrice').value||b?.price||0);try{await api('proforma_items',{method:'POST',body:{proforma_id:id,book_id,description:b?.title||'Artikull',sku:b?.sku||null,quantity:qty,unit_price:price,line_total:qty*price},prefer:'return=minimal'});const items=await api('proforma_items?proforma_id=eq.'+id+'&select=line_total'),p=proformas.find(x=>x.id===id),sub=items.reduce((s,x)=>s+Number(x.line_total||0),0),total=sub+Number(p.shipping||0)-Number(p.discount||0);await api('proformas?id=eq.'+id,{method:'PATCH',body:{subtotal:sub,total,updated_at:new Date().toISOString()},prefer:'return=minimal'});ok('Artikulli u shtua');await loadQuotes();openPf(id)}catch(e){ok(e.message,'error')}}
async function deletePf(id){if(!confirm('Ta fshij proformën?'))return;await api('proformas?id=eq.'+id,{method:'DELETE'});await loadQuotes()}
function printPf(id){const p=proformas.find(x=>x.id===id);if(!p)return;const items=proItems.filter(x=>x.proforma_id===id),w=window.open('','_blank');w.document.write(`<html><head><title>${E(p.number)}</title><style>body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h1>ZemZem</h1><h2>Proforma ${E(p.number)}</h2><p>${E(p.customer_name)} ${E(p.company_name||'')}</p><table><tr><th>Artikulli</th><th>Sasia</th><th>Çmimi</th><th>Total</th></tr>${items.map(i=>`<tr><td>${E(i.description)}</td><td>${i.quantity}</td><td>${M(i.unit_price)}</td><td>${M(i.line_total)}</td></tr>`).join('')}</table><h3>Total: ${M(p.total)}</h3><script>window.print()<\/script></body></html>`);w.document.close()}
async function loadSystem(){
 try{
  [flags,errors,payouts,pwaStats,releases]=await Promise.all([api('feature_flags?select=*&order=key.asc'),api('app_error_logs?select=*&order=created_at.desc&limit=100'),api('affiliate_payouts?select=*&order=created_at.desc&limit=200'),api('pwa_events?select=*&order=created_at.desc&limit=5000'),api('admin_release_notes?select=*&order=created_at.desc&limit=100')]);
  renderSystem();
 }catch(e){ok(e.message,'error')}
}
function renderSystem(){
 const health=[['Supabase',navigator.onLine?'Online':'Offline',navigator.onLine],['Session',typeof session!=='undefined'&&!!session?.access_token?'Active':'Missing',typeof session!=='undefined'&&!!session?.access_token],['PayPal','Server-side',true],['PWA','Service Worker',('serviceWorker'in navigator)]];
 q('#healthGrid').innerHTML=health.map(x=>`<div class="metric"><span>${E(x[0])}</span><b class="${x[2]?'health-ok':'health-bad'}">${E(x[1])}</b></div>`).join('');
 q('#errorList').innerHTML=errors.filter(x=>!x.resolved).slice(0,30).map(x=>`<div class="super-row"><div><b>${E(x.message)}</b><small>${E(x.source)} · ${new Date(x.created_at).toLocaleString('sq-AL')}</small></div><button class="secondary-btn" data-resolve-error="${x.id}">Resolve</button></div>`).join('')||'<div class="empty-state">Pa gabime aktive.</div>';
 qa('[data-resolve-error]').forEach(b=>b.onclick=()=>resolveErr(b.dataset.resolveError));
 q('#flagList').innerHTML=flags.map(f=>`<div class="flag-row"><div><b>${E(f.label)}</b><small>${E(f.description||'')}</small></div><button class="toggle ${f.enabled?'on':''}" data-flag="${E(f.key)}" aria-label="Toggle"></button></div>`).join('');qa('[data-flag]').forEach(b=>b.onclick=()=>toggleFlag(b.dataset.flag));
 const installs=pwaStats.filter(x=>x.event_type==='installed').length,prompts=pwaStats.filter(x=>x.event_type==='install_prompt').length,standalone=pwaStats.filter(x=>x.event_type==='opened_standalone').length;
 q('#pwaMetrics').innerHTML=`<div class="metric"><span>Prompts</span><b>${prompts}</b></div><div class="metric"><span>Installs</span><b>${installs}</b></div><div class="metric"><span>Standalone opens</span><b>${standalone}</b></div><div class="metric"><span>Konvertim</span><b>${prompts?((installs/prompts)*100).toFixed(1):'0'}%</b></div>`;
 q('#payoutList').innerHTML=payouts.slice(0,30).map(x=>`<div class="super-row"><div><b>${M(x.amount)}</b><small>${E(x.status)} · ${x.period_start||''} — ${x.period_end||''}</small></div><button class="secondary-btn" data-payout-paid="${x.id}">Mark paid</button></div>`).join('')||'<div class="empty-state">Pa payouts të regjistruara.</div>';qa('[data-payout-paid]').forEach(b=>b.onclick=()=>markPayout(b.dataset.payoutPaid));
 q('#releaseList').innerHTML=releases.map(x=>`<div class="super-row"><div><b>${E(x.version||'')} ${E(x.title)}</b><small>${E(x.commit_sha||'')} · ${E(x.status)} · ${new Date(x.created_at).toLocaleString('sq-AL')}</small></div><span class="tag">${E(x.status)}</span></div>`).join('')||'<div class="empty-state">Pa release notes.</div>';
 loadMaintenance();
}
async function resolveErr(id){await api('app_error_logs?id=eq.'+id,{method:'PATCH',body:{resolved:true},prefer:'return=minimal'});await loadSystem()}
async function resolveAll(){await api('app_error_logs?resolved=eq.false',{method:'PATCH',body:{resolved:true},prefer:'return=minimal'});await loadSystem()}
async function toggleFlag(key){const f=flags.find(x=>x.key===key);if(!f)return;await api('feature_flags?key=eq.'+encodeURIComponent(key),{method:'PATCH',body:{enabled:!f.enabled,updated_at:new Date().toISOString()},prefer:'return=minimal'});await loadSystem()}
async function markPayout(id){await api('affiliate_payouts?id=eq.'+id,{method:'PATCH',body:{status:'paid',paid_at:new Date().toISOString()},prefer:'return=minimal'});await loadSystem()}
async function loadMaintenance(){try{const r=await api('site_content?key=eq.maintenance&select=content&limit=1'),c=r?.[0]?.content||{};q('#maintenanceState').innerHTML=c.enabled?'<div class="maintenance-banner">Maintenance Mode është AKTIV.</div>':'<div class="muted-note">Maintenance Mode është joaktiv.</div>';q('#toggleMaintenance').dataset.enabled=String(!!c.enabled)}catch{}}
async function toggleMaintenance(){const enabled=q('#toggleMaintenance').dataset.enabled!=='true',content={enabled,message:'Dyqani është përkohësisht në mirëmbajtje. Ju lutemi provoni përsëri së shpejti.'};const r=await api('site_content?key=eq.maintenance&select=key&limit=1');if(r?.length)await api('site_content?key=eq.maintenance',{method:'PATCH',body:{content,updated_at:new Date().toISOString()},prefer:'return=minimal'});else await api('site_content',{method:'POST',body:{key:'maintenance',content},prefer:'return=minimal'});ok(enabled?'Maintenance u aktivizua':'Maintenance u çaktivizua');await loadMaintenance()}
function preview(kind){const w=kind==='mobile'?390:1440,h=kind==='mobile'?844:900,win=window.open('index.html?preview=1','zemzem_preview',`width=${w},height=${h}`);win?.focus()}
async function snapshot(){try{if(typeof api==='function'){await api('rpc/admin_create_config_backup',{method:'POST',body:{}});ok('Snapshot u krijua')}}catch(e){ok(e.message,'error')}}
async function addRelease(){const body={version:q('#releaseVersion').value.trim()||null,commit_sha:q('#releaseSha').value.trim()||null,title:q('#releaseTitle').value.trim()};if(!body.title)return ok('Shkruaj titullin','error');await api('admin_release_notes',{method:'POST',body,prefer:'return=minimal'});q('#releaseVersion').value='';q('#releaseSha').value='';q('#releaseTitle').value='';await loadSystem()}
function bind(){
 q('#taskForm').onsubmit=addTask;q('#markAllNotifs').onclick=markAll;
 q('#bulkBookSearch').oninput=renderBulk;q('#applyBookBulk').onclick=applyBookBulk;q('#applyOrderBulk').onclick=applyOrderBulk;q('#exportSelectedBooks').onclick=exportSelected;q('#printPickList').onclick=printPick;
 q('#warehouseForm').onsubmit=addWh;q('#saveLocationStock').onclick=saveLocStock;
 q('#proformaForm').onsubmit=newPf;q('#pfBook').onchange=()=>{const o=q('#pfBook').selectedOptions[0];q('#pfPrice').value=o?.dataset.price||''};q('#addPfItem').onclick=addPfItem;
 q('#resolveAllErrors').onclick=resolveAll;q('#toggleMaintenance').onclick=toggleMaintenance;q('#openDesktopPreview').onclick=()=>preview('desktop');q('#openMobilePreview').onclick=()=>preview('mobile');q('#snapshotConfig').onclick=snapshot;q('#addRelease').onclick=addRelease;
}
function init(){style();views();nav();bell();command();bind();window.addEventListener('zemzem:admin-access-ready',()=>{setTimeout(loadCommand,100)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,260));else setTimeout(init,260);
})();