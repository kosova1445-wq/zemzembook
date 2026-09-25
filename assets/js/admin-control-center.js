(()=>{
'use strict';
if(window.__zzAdminControlCenter)return;window.__zzAdminControlCenter=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let data=null,loading=false;
async function rpc(name,body={}){return window.api('rpc/'+name,{method:'POST',body})}
function ensureNav(){
 const side=q('.side-nav');if(!side||q('[data-view="control-center"]'))return;
 const btn=document.createElement('button');btn.className='nav-item';btn.dataset.view='control-center';
 btn.innerHTML='<span class="nav-icon">◉</span><span>Control Center</span>';
 btn.onclick=()=>openControlCenter();
 const anchor=q('[data-view="security-release"]',side)||q('[data-view="reports"]',side);
 anchor?side.insertBefore(btn,anchor):side.appendChild(btn);
}
function openControlCenter(){
 ensureView();
 qa('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='control-center'));
 qa('.view').forEach(v=>v.classList.toggle('active-view',v.id==='view-control-center'));
 const title=q('#viewTitle');if(title)title.textContent='Control Center';
 if(window.innerWidth<=760)q('.sidebar')?.classList.remove('mobile-open');
 setTimeout(()=>load('overview'),30);
}
function ensureView(){
 if(q('#view-control-center'))return;
 const main=q('.main');if(!main)return;
 const sec=document.createElement('section');sec.id='view-control-center';sec.className='view';
 sec.innerHTML=`
 <div class="zzcc-head"><div><div class="eyebrow">SYSTEM & OPERATIONS</div><h2>Control Center</h2><p>Settings, shëndeti i sistemit, gabimet, auditimi, njoftimet dhe performanca.</p></div><button class="secondary-btn" id="zzccRefresh">↻ Rifresko</button></div>
 <div class="zzcc-tabs">
   <button data-cc-tab="overview" class="active">Përmbledhje</button><button data-cc-tab="settings">Settings</button>
   <button data-cc-tab="errors">Error Log</button><button data-cc-tab="audit">Audit Log</button>
   <button data-cc-tab="notifications">Njoftimet</button><button data-cc-tab="performance">Performance</button>
 </div>
 <div id="zzccBody"><div class="zzcc-loading">Hape Control Center për të ngarkuar të dhënat.</div></div>`;
 main.appendChild(sec);
}
function metric(label,val,sub=''){return '<div class="zzcc-metric"><span>'+esc(label)+'</span><strong>'+esc(val)+'</strong><small>'+esc(sub)+'</small></div>'}
function renderOverview(){
 const h=data?.health||{},p=data?.performance||[];
 const poor=p.reduce((a,x)=>a+Number(x.poor_count||0),0);
 q('#zzccBody').innerHTML=`
 <div class="zzcc-grid six">
  ${metric('Database',h.database==='ok'?'OK':'Problem','Supabase')}
  ${metric('Libra',h.books_count||0,'në katalog')}
  ${metric('Porosi',h.orders_count||0,'gjithsej')}
  ${metric('Gabime aktive',h.unresolved_errors||0,'pa zgjidhur')}
  ${metric('Njoftime',h.unread_notifications||0,'pa lexuar')}
  ${metric('Poor vitals',poor,'7 ditët e fundit')}
 </div>
 <div class="zzcc-two">
  <article class="zzcc-card"><h3>Health Check</h3>
   <div class="zzcc-health"><span>Database <b class="ok">● OK</b></span><span>Free Library në pritje <b>${h.pending_free_library||0}</b></span><span>Kthime partnerësh <b>${h.pending_partner_returns||0}</b></span><span>Error logs aktive <b>${h.unresolved_errors||0}</b></span></div>
  </article>
  <article class="zzcc-card"><h3>Qasje të shpejta</h3>
   <div class="zzcc-links"><button data-go="operations">Backup & Restore</button><button data-go="security-release">Security & Releases</button><button data-go="customers">Customer CRM</button><button data-go="business-center">Business Center</button><button data-go="reports">Raporte</button></div>
  </article>
 </div>`;
 bindGo();
}
function settingRow(key,field,label,enabled,desc){
 return '<div class="zzcc-setting"><div><strong>'+esc(label)+'</strong><small>'+esc(desc)+'</small></div><button class="'+(enabled?'on':'off')+'" data-setting-key="'+esc(key)+'" data-setting-field="'+esc(field)+'" data-setting-value="'+(enabled?'1':'0')+'">'+(enabled?'Aktive':'Jo aktive')+'</button></div>';
}
function featureRow(f){
 return '<div class="zzcc-setting"><div><strong>'+esc(f.label||f.key)+'</strong><small>'+esc(f.description||'Feature flag')+'</small></div><button class="'+(f.enabled?'on':'off')+'" data-feature-flag="'+esc(f.key)+'" data-feature-enabled="'+(f.enabled?'1':'0')+'">'+(f.enabled?'Aktive':'Jo aktive')+'</button></div>';
}
function siteFeatureRow(key,label,desc,enabled){
 return '<div class="zzcc-setting"><div><strong>'+esc(label)+'</strong><small>'+esc(desc)+'</small></div><button class="'+(enabled?'on':'off')+'" data-site-feature="'+esc(key)+'" data-site-feature-enabled="'+(enabled?'1':'0')+'">'+(enabled?'Aktive':'Jo aktive')+'</button></div>';
}
function settingsGroup(title,desc,rows){
 return '<section class="zzcc-settings-group"><div class="zzcc-settings-group-head"><h4>'+esc(title)+'</h4><p>'+esc(desc)+'</p></div>'+rows+'</section>';
}
function renderSettings(){
 const s=data?.settings||{},inv=s.invoice||{},flags=data?.feature_flags||[],sf=data?.site_features||{};
 const fmap=new Map(flags.map(x=>[x.key,x]));
 const pick=(keys)=>keys.map(k=>fmap.get(k)).filter(Boolean).map(featureRow).join('');
 const systemRows=
   settingRow('free_library_public','enabled','Biblioteka Falas',!!s.free_library_public?.enabled,'Shfaq ose fsheh bibliotekën publike.')+
   settingRow('maintenance','enabled','Maintenance Mode',!!s.maintenance?.enabled,'Mbyll përkohësisht storefront-in për mirëmbajtje.')+
   settingRow('invoice','barcode_enabled','Barcode në faturë',inv.barcode_enabled!==false,'Code 128 në faturat profesionale.')+
   settingRow('invoice','qr_enabled','QR Code në faturë',inv.qr_enabled!==false,'QR në faturat profesionale.');
 const paymentRows=pick(['paypal','cod','gift_cards_public','b2b']);
 const commerceRows=pick(['wishlist','reviews','back_in_stock','bundles','loyalty','affiliate','pwa']);
 const ebookRows=pick(['ebook_conversion','kindle_send']);
 const homeRows=
   siteFeatureRow('home_new','Të sapoardhurat', 'Seksioni i librave të rinj në Ballinë.',sf.home_new!==false)+
   siteFeatureRow('home_offers','Oferta','Shfaq seksionin Oferta në Ballinë.',sf.home_offers!==false)+
   siteFeatureRow('home_trending','Libra të zgjedhur','Shfaq seksionin Trending / të zgjedhur.',sf.home_trending!==false)+
   siteFeatureRow('home_categories','Kategoritë','Shfaq kategoritë kryesore në Ballinë.',sf.home_categories!==false)+
   siteFeatureRow('home_bestsellers','Më të shiturit','Shfaq Bestseller në Ballinë.',sf.home_bestsellers!==false)+
   siteFeatureRow('home_all_books','Të gjithë librat','Shfaq katalogun e plotë në fund të Ballinës.',sf.home_all_books!==false);
 const productRows=
   siteFeatureRow('product_reviews','Reviews te produkti','Shfaq recensionet në faqen e librit.',sf.product_reviews!==false)+
   siteFeatureRow('product_related','Produkte të ngjashme','Shfaq rekomandimet e ngjashme.',sf.product_related!==false)+
   siteFeatureRow('product_recent','Ke parë së fundmi','Shfaq librat e parë së fundmi.',sf.product_recent!==false)+
   siteFeatureRow('ebooks_languages','Gjuhët e eBook','Shfaq filtrat e gjuhëve në katalogun eBook.',sf.ebooks_languages!==false)+
   siteFeatureRow('checkout_gift_wrap','Gift Wrap në checkout','Lejon paketimin dhuratë në checkout.',sf.checkout_gift_wrap!==false);

 q('#zzccBody').innerHTML=
   '<article class="zzcc-card"><div class="zzcc-card-head"><div><h3>Central Settings</h3><p class="muted">Kontrolle reale të lidhura direkt me konfigurimin e ZemZem.</p></div><span class="zzcc-settings-count">'+(4+flags.length+11)+' kontrolle</span></div>'+
   '<div class="zzcc-settings-grid">'+
    settingsGroup('System & Fatura','Kontrollet bazë të sistemit dhe faturës.',systemRows)+
    settingsGroup('Checkout & Pagesa','Metodat e pagesës dhe funksionet e blerjes.',paymentRows)+
    settingsGroup('Commerce & Customers','Funksione për klientët dhe rritjen.',commerceRows)+
    settingsGroup('eBook & Digital','Funksionet digjitale.',ebookRows)+
    settingsGroup('Ballina','Seksionet kryesore të homepage.',homeRows)+
    settingsGroup('Produkt & Checkout','Funksionet në faqen e librit dhe checkout.',productRows)+
   '</div></article>';

 qa('[data-setting-key]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('admin_control_center_toggle',{p_key:b.dataset.settingKey,p_field:b.dataset.settingField,p_value:b.dataset.settingValue!=='1'});await load('settings')}catch(e){window.toast?.(e.message||'Ndryshimi dështoi.','error')}finally{b.disabled=false}});
 qa('[data-feature-flag]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('admin_control_center_set_feature_flag',{p_key:b.dataset.featureFlag,p_enabled:b.dataset.featureEnabled!=='1'});await load('settings')}catch(e){window.toast?.(e.message||'Ndryshimi dështoi.','error')}finally{b.disabled=false}});
 qa('[data-site-feature]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('admin_control_center_set_site_feature',{p_key:b.dataset.siteFeature,p_enabled:b.dataset.siteFeatureEnabled!=='1'});await load('settings')}catch(e){window.toast?.(e.message||'Ndryshimi dështoi.','error')}finally{b.disabled=false}});
}
function renderErrors(){
 const rows=data?.errors||[];
 q('#zzccBody').innerHTML='<article class="zzcc-card"><div class="zzcc-card-head"><h3>Error Log</h3><span>'+rows.filter(x=>!x.resolved).length+' aktive</span></div><div class="zzcc-table-wrap"><table class="zzcc-table"><thead><tr><th>Koha</th><th>Burimi</th><th>Mesazhi</th><th>URL</th><th>Statusi</th><th></th></tr></thead><tbody>'+
 (rows.map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString('sq-AL')+'</td><td>'+esc(x.source||'—')+'</td><td><b>'+esc(x.severity||'error')+'</b><br>'+esc(x.message||'')+'</td><td class="clip">'+esc(x.url||'—')+'</td><td>'+(x.resolved?'<span class="pill ok">Zgjidhur</span>':'<span class="pill bad">Aktiv</span>')+'</td><td>'+(x.resolved?'':'<button class="table-action" data-resolve-error="'+x.id+'">Resolve</button>')+'</td></tr>').join('')||'<tr><td colspan="6">Nuk ka error logs.</td></tr>')+
 '</tbody></table></div></article>';
 qa('[data-resolve-error]').forEach(b=>b.onclick=async()=>{await rpc('admin_control_center_resolve_error',{p_id:Number(b.dataset.resolveError),p_resolved:true});await load('errors')});
}
function renderAudit(){
 const rows=data?.audit||[];
 q('#zzccBody').innerHTML='<article class="zzcc-card"><h3>Audit Log</h3><div class="zzcc-table-wrap"><table class="zzcc-table"><thead><tr><th>Koha</th><th>Burimi</th><th>Veprimi</th><th>Entiteti</th><th>Admin</th></tr></thead><tbody>'+
 (rows.map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString('sq-AL')+'</td><td>'+esc(x.source)+'</td><td><b>'+esc(x.action)+'</b></td><td>'+esc(x.entity_type||'—')+'<br><small>'+esc(x.entity_id||'')+'</small></td><td><small>'+esc(x.admin_user_id||'—')+'</small></td></tr>').join('')||'<tr><td colspan="5">Nuk ka audit entries.</td></tr>')+
 '</tbody></table></div></article>';
}
function renderNotifications(){
 const rows=data?.notifications||[];
 q('#zzccBody').innerHTML='<article class="zzcc-card"><div class="zzcc-card-head"><h3>Notification Center</h3><button class="secondary-btn" id="zzccReadAll">Shëno të gjitha të lexuara</button></div><div class="zzcc-list">'+
 (rows.map(x=>'<div class="zzcc-note '+(x.is_read?'read':'unread')+'"><div><b>'+esc(x.title||x.type||'Njoftim')+'</b><p>'+esc(x.body||'')+'</p></div><small>'+new Date(x.created_at).toLocaleString('sq-AL')+'</small></div>').join('')||'<div class="zzcc-empty">Nuk ka njoftime.</div>')+
 '</div></article>';
 q('#zzccReadAll')?.addEventListener('click',async()=>{await rpc('admin_control_center_mark_notifications_read',{});await load('notifications')});
}
function renderPerformance(){
 const rows=data?.performance||[];
 q('#zzccBody').innerHTML='<article class="zzcc-card"><h3>Performance Center · 7 ditë</h3><div class="zzcc-grid four">'+
 (rows.map(x=>metric((x.metric||'—')+' · '+(x.device||'all'),x.avg_value??'—',String(x.samples||0)+' mostra · '+String(x.poor_count||0)+' poor')).join('')||'<div class="zzcc-empty">Ende nuk ka Web Vitals.</div>')+
 '</div><p class="muted">LCP, INP, CLS dhe TTFB mblidhen nga vizitorët realë.</p></article>';
}
function render(tab='overview'){
 qa('[data-cc-tab]').forEach(b=>b.classList.toggle('active',b.dataset.ccTab===tab));
 ({overview:renderOverview,settings:renderSettings,errors:renderErrors,audit:renderAudit,notifications:renderNotifications,performance:renderPerformance}[tab]||renderOverview)();
}
async function load(tab='overview'){
 if(loading)return;loading=true;
 const body=q('#zzccBody');if(body)body.innerHTML='<div class="zzcc-loading">Po ngarkohen të dhënat…</div>';
 try{data=await rpc('admin_control_center_snapshot',{});render(tab)}catch(e){if(body)body.innerHTML='<div class="zzcc-error">'+esc(e.message||'Control Center nuk u ngarkua.')+'</div>'}finally{loading=false}
}
function bindGo(){qa('[data-go]').forEach(b=>b.onclick=()=>q('[data-view="'+b.dataset.go+'"]')?.click())}
function boot(){
 ensureNav();ensureView();
 document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-view="control-center"]');if(nav){e.preventDefault();openControlCenter();}
  const tab=e.target.closest('[data-cc-tab]');if(tab){e.preventDefault();render(tab.dataset.ccTab)}
 });
 q('#zzccRefresh')?.addEventListener('click',()=>load(q('[data-cc-tab].active')?.dataset.ccTab||'overview'));
 const side=q('.side-nav');if(side){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureNav()})}).observe(side,{childList:true,subtree:false})}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();