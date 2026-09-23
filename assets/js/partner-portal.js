(()=>{
'use strict';
const URL='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION_KEY='zemzem_customer_session';
const q=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=v=>Number(v||0).toFixed(2)+' €';
let session=null,status=null,dashboard=null;
async function loadPartnerBranding(){
 try{
   const r=await fetch(URL+'/rest/v1/site_content?key=eq.branding&select=content&limit=1',{headers:{apikey:KEY,Accept:'application/json'},cache:'no-store'});
   if(!r.ok)return;
   const rows=await r.json(),c=rows?.[0]?.content||{},logo=c.partner_logo_url||c.logo_url||'assets/brand/zemzem-logo.svg',width=Math.min(320,Math.max(70,Number(c.partner_logo_width||142))),height=Math.min(140,Math.max(24,Number(c.partner_logo_height||52)));
   document.querySelectorAll('[data-partner-brand-image]').forEach(img=>{img.src=logo;img.style.width=width+'px';img.style.height=height+'px';img.style.objectFit='contain'});
 }catch{}
}
function loadSession(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}
function saveSession(d){session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600),user:d.user};localStorage.setItem(SESSION_KEY,JSON.stringify(session))}
async function raw(path,{method='GET',body,token}={}){const h={apikey:KEY};if(body!==undefined)h['Content-Type']='application/json';if(token)h.Authorization='Bearer '+token;const r=await fetch(URL+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'}),t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.message||d?.msg||d?.error_description||d?.error||'Gabim');return d}
async function ensure(){if(!session)return false;if((session.expires_at||0)-Math.floor(Date.now()/1000)<60){try{const d=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});saveSession(d)}catch{session=null;localStorage.removeItem(SESSION_KEY);return false}}return true}
async function rpc(fn,body={}){if(!await ensure())throw new Error('Duhet të kyçesh.');try{return await raw('/rest/v1/rpc/'+fn,{method:'POST',body,token:session.access_token})}catch(e){const m=String(e?.message||'');if(/sku.*null|slug.*null/i.test(m))throw new Error('Sistemi nuk arriti të krijojë kodin e librit. Provo përsëri.');if(/duplicate key.*isbn|books_isbn_key/i.test(m))throw new Error('Ky ISBN ekziston tashmë në ZemZem.');throw e}}
async function storageUpload(file,slot){
 if(!await ensure())throw new Error('Duhet të kyçesh.');
 if(!file)throw new Error('Zgjidh fotografinë.');
 if(file.size>5*1024*1024)throw new Error('Fotografia mund të jetë maksimumi 5 MB.');
 const ok=['image/jpeg','image/png','image/webp'];if(!ok.includes(file.type))throw new Error('Lejohen vetëm JPG, PNG ose WEBP.');
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
 const uid=session.user?.id;if(!uid)throw new Error('Sesioni nuk është valid.');
 const path='partners/'+uid+'/'+Date.now()+'-'+slot+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
 const r=await fetch(URL+'/storage/v1/object/book-covers/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':file.type,'x-upsert':'false'},body:file});
 const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(d?.message||d?.error||'Ngarkimi i fotografisë dështoi.');
 return URL+'/storage/v1/object/public/book-covers/'+path;
}
async function partnerAssetUpload(file,slot='logo'){
 if(!await ensure())throw new Error('Duhet të kyçesh.');
 if(!file)throw new Error('Zgjidh fotografinë.');
 if(file.size>5*1024*1024)throw new Error('Fotografia mund të jetë maksimumi 5 MB.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Lejohen vetëm JPG, PNG ose WEBP.');
 const uid=session.user?.id;if(!uid)throw new Error('Sesioni nuk është valid.');
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
 const path=uid+'/'+Date.now()+'-'+slot+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
 const r=await fetch(URL+'/storage/v1/object/partner-assets/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':file.type,'x-upsert':'false'},body:file});
 const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(d?.message||d?.error||'Ngarkimi dështoi.');
 return URL+'/storage/v1/object/public/partner-assets/'+path;
}
const picon=(name)=>{
 const icons={
  dashboard:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
  books:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h5v16H5zM10 4h5v16h-5zM15 6h4v14h-4z"/></svg>',
  add:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  orders:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg>',
  money:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M17 7.5c0-2-2-3-5-3s-5 1.2-5 3.2 1.6 3 5 3.8 5 1.7 5 3.8-2.1 3.2-5 3.2-5-1.3-5-3.4"/></svg>',
  reports:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-5 3.4-7 8-7s7.2 2 8 7"/></svg>',
  help:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 0 1 4.7 1.2c0 2.3-2.5 2.4-2.5 4M12 18h.01"/></svg>',
  logout:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H4v16h6M14 8l4 4-4 4M18 12H8"/></svg>'
 };
 return icons[name]||icons.dashboard;
};
function renderAuth(){
 q('#partnerApp').innerHTML=`<div class="partner-auth-wrap"><div class="partner-auth-copy"><span class="partner-kicker">PORTALI I PARTNERIT</span><h2>Menaxho katalogun dhe barazimet në një vend.</h2><p>Një panel privat për librarinë tënde, me çmime transparente dhe llogaritje automatike mujore.</p><div class="partner-auth-points"><span>✓ Katalog i veçantë për librarinë</span><span>✓ Çmimi yt + marzhi ZemZem</span><span>✓ Pasqyrë e shitjeve mujore</span><span>✓ Historik i barazimeve</span></div></div><div class="partner-card" style="margin-top:0"><div class="partner-auth-tabs"><button class="active" data-auth-tab="login">Kyçu</button><button data-auth-tab="signup">Regjistrohu</button></div><form id="pLogin" class="partner-form"><label class="full">Email<input name="email" type="email" required></label><label class="full">Fjalëkalimi<input name="password" type="password" minlength="8" required></label><button class="btn primary" type="submit">Kyçu</button></form><form id="pSignup" class="partner-form" hidden><label class="full">Email<input name="email" type="email" required></label><label class="full">Fjalëkalimi<input name="password" type="password" minlength="8" required></label><button class="btn primary" type="submit">Krijo llogarinë</button></form><div id="pAuthMsg"></div></div></div>`;
 document.querySelectorAll('[data-auth-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-auth-tab]').forEach(x=>x.classList.toggle('active',x===b));q('#pLogin').hidden=b.dataset.authTab!=='login';q('#pSignup').hidden=b.dataset.authTab!=='signup'});
 q('#pLogin').onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{const d=await raw('/auth/v1/token?grant_type=password',{method:'POST',body:x});saveSession(d);await boot()}catch(err){q('#pAuthMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}};
 q('#pSignup').onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{const d=await raw('/auth/v1/signup',{method:'POST',body:x});if(d.access_token){saveSession(d);await boot()}else q('#pAuthMsg').innerHTML='<div class="partner-msg">Kontrollo emailin për verifikim, pastaj kyçu.</div>'}catch(err){q('#pAuthMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}};
}
function renderApply(){
 q('#partnerApp').innerHTML=`<div class="partner-card"><h2>Regjistro librarinë</h2><p>Pas regjistrimit, ZemZem e kontrollon aplikimin dhe e aktivizon llogarinë si partner.</p><form id="partnerApply" class="partner-form"><label>Emri i librarisë<input name="name" required></label><label>Personi kontaktues<input name="contact_name" required></label><label>Telefoni<input name="phone" required></label><label>Shteti<input name="country" required value="Kosovë"></label><label class="full">Adresa<input name="address" required></label><label>Nr. fiskal / Tax ID<input name="tax_id"></label><label>Nr. regjistrimit të biznesit<input name="company_registration_number"></label><button class="btn primary" type="submit">Dërgo aplikimin</button></form><div id="partnerMsg"></div></div>`;
 q('#partnerApply').onsubmit=async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{await rpc('partner_apply',{p_name:x.name,p_contact_name:x.contact_name,p_phone:x.phone,p_country:x.country,p_address:x.address,p_tax_id:x.tax_id||null,p_company_registration_number:x.company_registration_number||null});await boot()}catch(err){q('#partnerMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}};
}
function renderPending(){
 q('#partnerApp').innerHTML=`<div class="partner-card"><span class="partner-status ${esc(status.status)}">${status.status==='pending'?'Në pritje për aprovim':status.status}</span><h2 style="margin-top:12px">${esc(status.name)}</h2><p>Aplikimi është pranuar. Pasi ZemZem ta aprovojë, këtu do të hapet dashboard-i për shtimin e librave dhe barazimet mujore.</p><button class="btn secondary" id="logout">Dil</button></div>`;q('#logout').onclick=()=>{localStorage.removeItem(SESSION_KEY);session=null;renderAuth()};
}
function renderDashboard(){
 const s=dashboard.supplier||{},m=dashboard.month||{},stats=dashboard.stats||{},books=dashboard.books||[],orders=dashboard.orders||[],sets=dashboard.settlements||[];
 const openOrders=Number(stats.open_orders||0),openSets=Number(stats.open_settlements||0),bookCount=Number(stats.book_count||books.length),stockTotal=Number(stats.stock_total||0);
 const statusSq=v=>({pending:'Në pritje',confirmed:'Konfirmuar',processing:'Në përpunim',shipped:'Dërguar',delivered:'Dorëzuar',cancelled:'Anuluar',refunded:'Rimbursuar',draft:'Draft',published:'Publikuar'})[v]||v||'—';
 const partnerInitial=(s.name||'P').trim().charAt(0).toUpperCase();
 q('#partnerApp').innerHTML=`
 <div class="partner-shell partner-shell-pro">
  <aside class="partner-side partner-side-pro">
    <div class="partner-profile-card">
      <div class="partner-profile-logo">${s.logo_url?'<img src="'+esc(s.logo_url)+'" alt="">':'<span>'+esc(partnerInitial)+'</span>'}</div>
      <div class="partner-profile-copy"><small>PANELI I PARTNERIT</small><strong>${esc(s.name||'Libraria')}</strong><span class="partner-profile-status"><i></i> Partner aktiv</span></div>
    </div>
    <div class="partner-side-mini">
      <div><span>Libra</span><b>${bookCount}</b></div><div><span>Në stok</span><b>${stockTotal}</b></div><div><span>Shitje muaj</span><b>${Number(m.quantity||0)}</b></div>
    </div>

    <div class="partner-menu-group"><div class="partner-menu-label">KRYESORE</div>
      <button class="active" data-partner-section="overview"><span class="partner-menu-icon">${picon('dashboard')}</span><span class="partner-menu-text">Dashboard</span></button>
      <button data-partner-section="books"><span class="partner-menu-icon">${picon('books')}</span><span class="partner-menu-text">Librat e mi</span><span class="partner-menu-badge">${bookCount}</span></button>
      <button class="partner-menu-primary" data-partner-section="add"><span class="partner-menu-icon">${picon('add')}</span><span class="partner-menu-text">Shto libër</span></button>
      <button data-partner-section="orders"><span class="partner-menu-icon">${picon('orders')}</span><span class="partner-menu-text">Porositë</span>${openOrders?'<span class="partner-menu-badge hot">'+openOrders+'</span>':''}</button>
    </div>

    <div class="partner-menu-group"><div class="partner-menu-label">FINANCA</div>
      <button data-partner-section="settlements"><span class="partner-menu-icon">${picon('money')}</span><span class="partner-menu-text">Barazimet</span>${openSets?'<span class="partner-menu-badge warm">'+openSets+'</span>':''}</button>
      <button data-partner-section="reports"><span class="partner-menu-icon">${picon('reports')}</span><span class="partner-menu-text">Raportet</span></button>
    </div>

    <div class="partner-menu-group"><div class="partner-menu-label">LLOGARIA</div>
      <button data-partner-section="account"><span class="partner-menu-icon">${picon('profile')}</span><span class="partner-menu-text">Profili i librarisë</span></button>
      <button data-partner-section="help"><span class="partner-menu-icon">${picon('help')}</span><span class="partner-menu-text">Ndihmë / Support</span></button>
      <button id="logout" class="partner-menu-logout"><span class="partner-menu-icon">${picon('logout')}</span><span class="partner-menu-text">Dil</span></button>
    </div>
  </aside>

  <div class="partner-content">
   <section data-partner-panel="overview">
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">DASHBOARD</span><h2>Përmbledhje e aktivitetit</h2><p>Shitjet, katalogu dhe financat e ${esc(s.name||'librarisë')}.</p></div><span class="partner-status approved">Partner aktiv</span></div>
    <div class="partner-kpis partner-kpis-four">
      <div class="partner-kpi"><span>Shitur këtë muaj</span><strong>${Number(m.quantity||0)}</strong><small>libra të dorëzuar</small></div>
      <div class="partner-kpi"><span>Shuma që të takon</span><strong>${money(m.supplier_due)}</strong><small>këtë muaj</small></div>
      <div class="partner-kpi"><span>Shitje bruto</span><strong>${money(m.gross_sales)}</strong><small>këtë muaj</small></div>
      <div class="partner-kpi"><span>Porosi aktive</span><strong>${openOrders}</strong><small>në proces</small></div>
    </div>
    <div class="partner-dashboard-grid">
      <div class="partner-card"><div class="partner-card-head"><div><h3>Aktiviteti i katalogut</h3><p>Gjendja aktuale e librave.</p></div><button class="partner-text-btn" data-open-section="books">Shiko katalogun →</button></div><div class="partner-overview-stats"><div><span>Libra gjithsej</span><b>${bookCount}</b></div><div><span>Publikuar</span><b>${Number(stats.published_count||0)}</b></div><div><span>Copë në stok</span><b>${stockTotal}</b></div></div></div>
      <div class="partner-card"><div class="partner-card-head"><div><h3>Financat</h3><p>Marzhi dhe barazimet.</p></div><button class="partner-text-btn" data-open-section="settlements">Barazimet →</button></div><div class="partner-finance-summary"><span>Marzhi aktual</span><strong>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</strong><small>Çmimi publik llogaritet automatikisht.</small></div></div>
    </div>
    <div class="partner-card"><div class="partner-card-head"><div><h3>Porositë e fundit</h3><p>Aktiviteti më i fundit i librave tuaj.</p></div><button class="partner-text-btn" data-open-section="orders">Të gjitha →</button></div><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Porosia</th><th>Data</th><th>Copë</th><th>Shuma jote</th><th>Statusi</th></tr></thead><tbody>${orders.slice(0,5).map(o=>'<tr><td><b>#'+esc(o.order_number||String(o.id).slice(0,8))+'</b></td><td>'+new Date(o.created_at).toLocaleDateString('sq-AL')+'</td><td>'+Number(o.quantity_total||0)+'</td><td><b>'+money(o.supplier_due)+'</b></td><td><span class="status-pill '+esc(o.order_status)+'">'+esc(statusSq(o.order_status))+'</span></td></tr>').join('')||'<tr><td colspan="5">Ende nuk ka porosi.</td></tr>'}</tbody></table></div></div>
   </section>

   <section data-partner-panel="books" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">KATALOGU</span><h2>Menaxho katalogun e librarisë</h2><p>Shiko librat, çmimet, stokun dhe statusin e publikimit.</p></div><button class="btn primary" data-open-section="add">＋ Shto libër</button></div>
    <div class="partner-card" style="margin-top:0"><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Libri</th><th>Autori</th><th>ISBN</th><th>Çmimi yt</th><th>Publik</th><th>Stoku</th><th>Statusi</th><th>Veprime</th></tr></thead><tbody>${books.map(b=>'<tr><td><div class="book-title-cell">'+(b.cover_url?'<img class="book-cover-mini" src="'+esc(b.cover_url)+'" alt="">':'<div class="book-cover-placeholder">▥</div>')+'<div><b>'+esc(b.title)+'</b><br><small>'+esc(b.partner_publisher_name||'')+'</small></div></div></td><td>'+esc(b.partner_author_name||'—')+'</td><td>'+esc(b.isbn||'—')+'</td><td><span class="price-pill">'+money(b.cost_price)+'</span></td><td><b>'+money(b.price)+'</b></td><td>'+Number(b.stock_quantity||0)+'</td><td><span class="status-pill '+esc(b.partner_review_status==='pending'?'pending':(b.partner_review_status==='rejected'?'cancelled':b.status))+'">'+esc(b.partner_review_status==='pending'?'Në pritje për aprovim':(b.partner_review_status==='rejected'?'Refuzuar':statusSq(b.status)))+'</span>'+(b.partner_review_status==='rejected'&&b.partner_review_note?'<br><small class="partner-reject-note">'+esc(b.partner_review_note)+'</small>':'')+'</td><td><button type="button" class="btn secondary partner-edit-book" data-edit-book="'+esc(b.id)+'">✎ Edito</button></td></tr>').join('')||'<tr><td colspan="8">Ende nuk ke libra.</td></tr>'}</tbody></table></div></div>
   </section>

   <section data-partner-panel="add" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">KATALOGU</span><h2>Shto një titull të ri në platformë</h2><p>Plotëso të dhënat sa më saktë. Fushat me * janë të detyrueshme.</p></div></div>
    <div class="partner-add-layout">
      <div class="partner-card partner-form-card" style="margin-top:0">
       <form id="partnerBookForm" class="partner-form">
        <input type="hidden" name="book_id" id="partnerBookId" value="">
        <div id="partnerEditNotice" class="partner-edit-notice full" hidden><div><strong>Po editon një libër ekzistues</strong><small>Ndryshimet do të dërgohen përsëri për aprovim.</small></div><button type="button" class="btn secondary" id="partnerCancelEdit">Anulo editimin</button></div>
        <div class="partner-form-section full"><h3>1. Fotografitë</h3><p>Fotografia e parë është e detyrueshme për libër të ri. Gjatë editimit, fotoja ekzistuese ruhet nëse nuk zgjedh një të re.</p></div>
        <div class="partner-photo-grid full">
          <label class="partner-photo-upload required"><span class="partner-photo-title">Foto 1 *</span><input id="partnerPhoto1" name="photo1" type="file" accept="image/jpeg,image/png,image/webp"><div class="partner-photo-preview" id="partnerPhotoPreview1"><span>＋</span><small>Ngarko kopertinën kryesore</small></div></label>
          <label class="partner-photo-upload"><span class="partner-photo-title">Foto 2</span><input id="partnerPhoto2" name="photo2" type="file" accept="image/jpeg,image/png,image/webp"><div class="partner-photo-preview" id="partnerPhotoPreview2"><span>＋</span><small>Foto shtesë, opsionale</small></div></label>
        </div>
        <div class="partner-form-section full"><h3>2. Të dhënat bazë</h3></div>
        <label class="full">Titulli i librit *<input name="title" required placeholder="p.sh. El Uasitijeh"></label>
        <label>Autori<input name="author_name" placeholder="Emri i autorit"></label><label>Botuesi<input name="publisher_name" placeholder="Emri i botuesit"></label>
        <label>ISBN *<input name="isbn" required inputmode="numeric" placeholder="978..."></label>
        <label>Gjuha<select name="language"><option value="sq">Shqip</option><option value="ar">Arabisht</option><option value="en">Anglisht</option><option value="fr">Frëngjisht</option><option value="de">Gjermanisht</option><option value="tr">Turqisht</option><option value="other">Tjetër</option></select></label>
        <label>Numri i faqeve<input name="pages" type="number" min="1" step="1" placeholder="p.sh. 320"></label><label>Viti i botimit<input name="publication_year" type="number" min="1000" max="2100" step="1" placeholder="2026"></label>
        <label>Botimi / Edicioni<input name="edition" placeholder="p.sh. Botimi i dytë"></label><label>Vendi i botimit<input name="country" placeholder="Kosovë, Shqipëri..."></label>
        <div class="partner-form-section full"><h3>3. Çmimi dhe stoku</h3></div>
        <label>Çmimi yt € *<input name="cost_price" type="number" min="0" step=".01" required placeholder="8.00"></label><label>Stoku *<input name="stock" type="number" min="0" step="1" required value="0"></label>
        <label>Pesha (gram)<input name="weight_grams" type="number" min="0" step="1" placeholder="450"></label><label>Dimensionet<input name="dimensions" placeholder="14 × 21 cm"></label>
        <label>Gjendja<select name="condition"><option value="new">I ri</option><option value="used_like_new">Pothuajse i ri</option><option value="used_good">I përdorur - gjendje e mirë</option></select></label>
        <div class="partner-form-section full"><h3>4. Përshkrimi</h3></div>
        <label class="full">Përshkrim i shkurtër<textarea name="short_description" rows="2" maxlength="300" placeholder="1–2 fjali për librin"></textarea></label>
        <label class="full">Përshkrimi i plotë<textarea name="description" rows="6" placeholder="Përmbajtja, tema, veçoritë e librit..."></textarea></label>
        <label class="full">Shënim për ZemZem<textarea name="notes" rows="3" placeholder="Opsionale – informacion vetëm për administratën"></textarea></label>
        <div class="partner-submit-row full"><div><strong>Gati për dërgim</strong><small>Libri ruhet si draft derisa të kontrollohet.</small></div><button class="btn primary" id="partnerBookSubmit" type="submit">Ruaj librin</button></div>
       </form><div id="bookMsg"></div>
      </div>
      <aside class="partner-price-card"><div class="partner-card" style="margin-top:0"><h3>Çmimi transparent</h3><p>Ti vendos çmimin tënd. ZemZem shton marzhin e dakorduar.</p><div class="partner-formula" style="background:#173d2b;color:#fff"><small>MARZHI AKTUAL</small><div class="formula-total"><span>ZemZem</span><strong>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</strong></div></div><div class="partner-price-preview"><span>Çmimi yt</span><b id="partnerBasePrice">0.00 €</b><span>Çmimi publik</span><strong id="partnerPublicPrice">0.00 €</strong></div></div></aside>
    </div>
   </section>

   <section data-partner-panel="orders" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">POROSITË</span><h2>Porositë e librarisë</h2><p>Shiko vetëm porositë që përmbajnë librat e tu.</p></div></div>
    <div class="partner-card" style="margin-top:0"><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Porosia</th><th>Data</th><th>Copë</th><th>Shitje bruto</th><th>Të takon</th><th>Statusi</th></tr></thead><tbody>${orders.map(o=>'<tr><td><b>#'+esc(o.order_number||String(o.id).slice(0,8))+'</b></td><td>'+new Date(o.created_at).toLocaleDateString('sq-AL')+'</td><td>'+Number(o.quantity_total||0)+'</td><td>'+money(o.gross_sales)+'</td><td><b>'+money(o.supplier_due)+'</b></td><td><span class="status-pill '+esc(o.order_status)+'">'+esc(statusSq(o.order_status))+'</span></td></tr>').join('')||'<tr><td colspan="6">Ende nuk ka porosi.</td></tr>'}</tbody></table></div></div>
   </section>

   <section data-partner-panel="settlements" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">FINANCA</span><h2>Pasqyra financiare dhe pagesat</h2><p>Historiku i barazimeve mujore me ZemZem.</p></div></div>
    <div class="partner-card" style="margin-top:0"><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Periudha</th><th>Copë</th><th>Shitje bruto</th><th>Të takon</th><th>Fitim ZemZem</th><th>Statusi</th></tr></thead><tbody>${sets.map(x=>'<tr><td>'+esc(x.period_start)+' – '+esc(x.period_end)+'</td><td>'+x.quantity_total+'</td><td>'+money(x.gross_sales)+'</td><td><b>'+money(x.supplier_due)+'</b></td><td>'+money(x.zemzem_profit)+'</td><td><span class="status-pill '+(x.status==='paid'?'published':'')+'">'+(x.status==='paid'?'Paguar':'Hapur')+'</span></td></tr>').join('')||'<tr><td colspan="6">Ende nuk ka barazime.</td></tr>'}</tbody></table></div></div>
   </section>

   <section data-partner-panel="reports" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">RAPORTET</span><h2>Statistikat e librarisë</h2><p>Një pasqyrë e performancës së katalogut dhe shitjeve.</p></div></div>
    <div class="partner-kpis partner-kpis-four"><div class="partner-kpi"><span>Libra në katalog</span><strong>${bookCount}</strong></div><div class="partner-kpi"><span>Stok total</span><strong>${stockTotal}</strong></div><div class="partner-kpi"><span>Porosi gjithsej</span><strong>${orders.length}</strong></div><div class="partner-kpi"><span>Të ardhura këtë muaj</span><strong>${money(m.supplier_due)}</strong></div></div>
    <div class="partner-dashboard-grid"><div class="partner-card"><h3>Statusi i porosive</h3><div class="partner-report-list">${['pending','confirmed','processing','shipped','delivered','cancelled'].map(st=>'<div><span>'+esc(statusSq(st))+'</span><b>'+orders.filter(o=>o.order_status===st).length+'</b></div>').join('')}</div></div><div class="partner-card"><h3>Barazimet</h3><div class="partner-report-list"><div><span>Të paguara</span><b>${sets.filter(x=>x.status==='paid').length}</b></div><div><span>Të hapura</span><b>${sets.filter(x=>x.status==='open').length}</b></div><div><span>Totali i paguar</span><b>${money(sets.filter(x=>x.status==='paid').reduce((a,x)=>a+Number(x.supplier_due||0),0))}</b></div></div></div></div>
   </section>

   <section data-partner-panel="account" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">LLOGARIA</span><h2>Profili i librarisë</h2><p>Menaxho identitetin dhe të dhënat e kontaktit.</p></div></div>
    <div class="partner-grid">
      <div class="partner-card" style="margin-top:0">
       <form id="partnerProfileForm" class="partner-form">
        <div class="partner-profile-upload full"><div class="partner-profile-logo large" id="partnerProfileLogoPreview">${s.logo_url?'<img src="'+esc(s.logo_url)+'" alt="">':'<span>'+esc(partnerInitial)+'</span>'}</div><div><strong>Logoja e librarisë</strong><small>JPG, PNG ose WEBP · maksimumi 5 MB</small><label class="btn secondary partner-logo-button">Ngarko logo<input id="partnerBusinessLogo" type="file" accept="image/jpeg,image/png,image/webp" hidden></label></div></div>
        <label>Emri i librarisë<input name="name" required value="${esc(s.name||'')}"></label><label>Personi kontaktues<input name="contact_name" required value="${esc(s.contact_name||'')}"></label>
        <label>Telefoni<input name="phone" required value="${esc(s.phone||'')}"></label><label>Shteti<input name="country" required value="${esc(s.country||'')}"></label>
        <label class="full">Adresa<input name="address" required value="${esc(s.address||'')}"></label><label class="full">Website<input name="website_url" type="url" value="${esc(s.website_url||'')}" placeholder="https://..."></label>
        <label class="full">Përshkrim i librarisë<textarea name="description" rows="4" placeholder="Përshkruaj shkurt librarinë...">${esc(s.description||'')}</textarea></label>
        <button class="btn primary" id="partnerProfileSave" type="submit">Ruaj profilin</button>
       </form><div id="partnerProfileMsg"></div>
      </div>
      <div class="partner-card" style="margin-top:0"><h3>Kushtet e partneritetit</h3><div class="partner-report-list"><div><span>Statusi</span><b>Partner aktiv</b></div><div><span>Email</span><b>${esc(s.email||'—')}</b></div><div><span>Marzhi ZemZem</span><b>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</b></div></div></div>
    </div>
   </section>

   <section data-partner-panel="help" hidden>
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">SUPPORT</span><h2>Ndihmë për partnerët</h2><p>Informacion i shpejtë për katalogun, porositë dhe barazimet.</p></div></div>
    <div class="partner-help-grid">
      <div class="partner-card"><h3>Si shtohet një libër?</h3><p>Hap “Shto libër”, ngarko kopertinën kryesore, plotëso ISBN-në, çmimin dhe stokun. Libri ruhet si draft për kontroll.</p></div>
      <div class="partner-card"><h3>Si llogaritet çmimi?</h3><p>Ti vendos çmimin bazë. ZemZem shton marzhin e dakorduar dhe çmimi publik krijohet automatikisht.</p></div>
      <div class="partner-card"><h3>Kur bëhet barazimi?</h3><p>Barazimet regjistrohen sipas periudhës dhe tregojnë shitjen bruto, shumën që të takon dhe statusin e pagesës.</p></div>
      <div class="partner-card"><h3>Ke nevojë për ndihmë?</h3><p>Kontakto ekipin ZemZem për çështje të llogarisë, katalogut ose pagesave.</p><a class="btn primary partner-help-link" href="contact.html">Kontakto ZemZem</a></div>
    </div>
   </section>
  </div>
 </div>`;

 function openSection(key){
   document.querySelectorAll('[data-partner-panel]').forEach(x=>x.hidden=x.dataset.partnerPanel!==key);
   document.querySelectorAll('[data-partner-section]').forEach(x=>x.classList.toggle('active',x.dataset.partnerSection===key));
   history.replaceState(null,'','#'+key);
   window.scrollTo({top:Math.max(0,(q('#partnerApp')?.offsetTop||0)-88),behavior:'smooth'});
 }
 document.querySelectorAll('[data-partner-section]').forEach(b=>b.onclick=()=>openSection(b.dataset.partnerSection));
 document.querySelectorAll('[data-open-section]').forEach(b=>b.onclick=()=>openSection(b.dataset.openSection));

 function startEditBook(id){
   const b=books.find(x=>String(x.id)===String(id));if(!b)return;
   openSection('add');
   const f=q('#partnerBookForm');if(!f)return;
   q('#partnerBookId').value=b.id;
   q('#partnerEditNotice').hidden=false;
   q('#partnerBookSubmit').textContent='Ruaj ndryshimet';
   f.title.value=b.title||'';
   f.author_name.value=b.partner_author_name||'';
   f.publisher_name.value=b.partner_publisher_name||'';
   f.isbn.value=b.isbn||'';
   f.language.value=b.language||'sq';
   f.pages.value=b.pages||'';
   f.publication_year.value=b.partner_publication_year||'';
   f.edition.value=b.partner_edition||'';
   f.country.value=b.country||'';
   f.cost_price.value=b.cost_price??'';
   f.stock.value=b.stock_quantity??0;
   f.weight_grams.value=b.weight_grams||'';
   f.dimensions.value=b.dimensions||'';
   f.condition.value=b.partner_condition||'new';
   f.short_description.value=b.short_description||'';
   f.description.value=b.description||'';
   f.notes.value=b.partner_notes||'';
   const p1=q('#partnerPhotoPreview1'),p2=q('#partnerPhotoPreview2');
   if(p1)p1.innerHTML=b.cover_url?'<img src="'+esc(b.cover_url)+'" alt="Kopertina aktuale"><small>Foto aktuale — zgjidh të re vetëm nëse do ta ndryshosh</small>':'<span>＋</span><small>Ngarko kopertinën kryesore</small>';
   const g=Array.isArray(b.gallery_urls)?b.gallery_urls[0]:'';
   if(p2)p2.innerHTML=g?'<img src="'+esc(g)+'" alt="Foto shtesë aktuale"><small>Foto 2 aktuale</small>':'<span>＋</span><small>Foto shtesë, opsionale</small>';
   f.dataset.existingCover=b.cover_url||'';
   f.dataset.existingGallery=g||'';
   calcPrice();
   setTimeout(()=>q('#partnerBookForm')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
 }
 function clearEditBook(){
   const f=q('#partnerBookForm');if(!f)return;
   f.reset();q('#partnerBookId').value='';q('#partnerEditNotice').hidden=true;q('#partnerBookSubmit').textContent='Ruaj librin';delete f.dataset.existingCover;delete f.dataset.existingGallery;
   if(q('#partnerPhotoPreview1'))q('#partnerPhotoPreview1').innerHTML='<span>＋</span><small>Ngarko kopertinën kryesore</small>';
   if(q('#partnerPhotoPreview2'))q('#partnerPhotoPreview2').innerHTML='<span>＋</span><small>Foto shtesë, opsionale</small>';
   calcPrice();
 }
 document.querySelectorAll('[data-edit-book]').forEach(btn=>btn.addEventListener('click',()=>startEditBook(btn.dataset.editBook)));
 q('#partnerCancelEdit')?.addEventListener('click',()=>{clearEditBook();openSection('books')});

 const bindPhotoPicker=(inputSel,boxSel,required=false)=>{
   const input=q(inputSel),box=q(boxSel);if(!input||!box)return;
   const openPicker=e=>{if(e){e.preventDefault();e.stopPropagation()}input.click()};
   box.addEventListener('click',openPicker);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){openPicker(e)}});box.setAttribute('role','button');box.setAttribute('tabindex','0');
   input.addEventListener('change',()=>{const file=input.files?.[0];if(!file){box.innerHTML='<span>＋</span><small>'+(required?'Ngarko kopertinën kryesore':'Foto shtesë, opsionale')+'</small>';return}if(file.size>5*1024*1024){input.value='';box.innerHTML='<span>!</span><small>Maksimumi 5 MB</small>';return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){input.value='';box.innerHTML='<span>!</span><small>Lejohen JPG, PNG ose WEBP</small>';return}const reader=new FileReader();reader.onload=()=>{box.innerHTML='<img src="'+reader.result+'" alt="Preview i fotografisë"><small>'+esc(file.name)+'</small>'};reader.onerror=()=>{box.innerHTML='<span>!</span><small>Preview nuk u hap.</small>'};reader.readAsDataURL(file)});
 };
 bindPhotoPicker('#partnerPhoto1','#partnerPhotoPreview1',true);bindPhotoPicker('#partnerPhoto2','#partnerPhotoPreview2',false);

 const calcPrice=()=>{const base=Number(q('#partnerBookForm [name="cost_price"]')?.value||0);const pub=s.margin_type==='percent'?base*(1+Number(s.margin_value||0)/100):base+Number(s.margin_value||0);if(q('#partnerBasePrice'))q('#partnerBasePrice').textContent=money(base);if(q('#partnerPublicPrice'))q('#partnerPublicPrice').textContent=money(pub)};
 q('#partnerBookForm [name="cost_price"]')?.addEventListener('input',calcPrice);calcPrice();

 q('#partnerBookForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,btn=q('#partnerBookSubmit'),x=Object.fromEntries(new FormData(f));const photo1=q('#partnerPhoto1')?.files?.[0],photo2=q('#partnerPhoto2')?.files?.[0],bookId=x.book_id||null,existingCover=f.dataset.existingCover||'',existingGallery=f.dataset.existingGallery||'';if(!photo1&&!existingCover){q('#bookMsg').innerHTML='<div class="partner-msg error">Foto 1 është e detyrueshme.</div>';return}btn.disabled=true;btn.textContent='Duke ruajtur…';q('#bookMsg').innerHTML='<div class="partner-msg">Duke ngarkuar fotografitë dhe ruajtur librin…</div>';try{const cover=photo1?await storageUpload(photo1,'main'):existingCover,gallery=photo2?await storageUpload(photo2,'extra'):(existingGallery||null);await rpc('partner_book_upsert_v2',{p_id:bookId,p_title:x.title,p_isbn:x.isbn,p_author_name:x.author_name||null,p_publisher_name:x.publisher_name||null,p_cost_price:Number(x.cost_price),p_stock:Number(x.stock||0),p_cover_url:cover,p_gallery_url:gallery,p_short_description:x.short_description||null,p_description:x.description||null,p_language:x.language||'sq',p_pages:x.pages?Number(x.pages):null,p_country:x.country||null,p_dimensions:x.dimensions||null,p_weight_grams:x.weight_grams?Number(x.weight_grams):null,p_edition:x.edition||null,p_publication_year:x.publication_year?Number(x.publication_year):null,p_condition:x.condition||'new',p_notes:x.notes||null});dashboard=await rpc('partner_dashboard',{});renderDashboard();setTimeout(()=>q('[data-partner-section="books"]')?.click(),30)}catch(err){q('#bookMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';btn.disabled=false;btn.textContent='Ruaj librin'}});

 let businessLogoFile=null;
 q('#partnerBusinessLogo')?.addEventListener('change',e=>{businessLogoFile=e.target.files?.[0]||null;if(!businessLogoFile)return;const reader=new FileReader();reader.onload=()=>{q('#partnerProfileLogoPreview').innerHTML='<img src="'+reader.result+'" alt="Logo preview">'};reader.readAsDataURL(businessLogoFile)});
 q('#partnerProfileForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,btn=q('#partnerProfileSave'),x=Object.fromEntries(new FormData(f));btn.disabled=true;btn.textContent='Duke ruajtur…';try{let logo=s.logo_url||null;if(businessLogoFile)logo=await partnerAssetUpload(businessLogoFile,'logo');await rpc('partner_profile_update',{p_name:x.name,p_contact_name:x.contact_name,p_phone:x.phone,p_country:x.country,p_address:x.address,p_website_url:x.website_url||null,p_description:x.description||null,p_logo_url:logo});dashboard=await rpc('partner_dashboard',{});renderDashboard();setTimeout(()=>q('[data-partner-section="account"]')?.click(),30)}catch(err){q('#partnerProfileMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>';btn.disabled=false;btn.textContent='Ruaj profilin'}});

 q('#logout')?.addEventListener('click',()=>{localStorage.removeItem(SESSION_KEY);session=null;renderAuth()});
 const initial=location.hash.replace('#','');if(['overview','books','add','orders','settlements','reports','account','help'].includes(initial))openSection(initial);
}
async function boot(){loadSession();if(!await ensure()){renderAuth();return}try{status=await rpc('partner_my_status',{});if(!status.applied){renderApply();return}if(status.status!=='approved'||!status.enabled){renderPending();return}dashboard=await rpc('partner_dashboard',{});renderDashboard()}catch(err){q('#partnerApp').innerHTML='<div class="partner-card"><div class="partner-msg error">'+esc(err.message)+'</div></div>'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{loadPartnerBranding();boot()});else{loadPartnerBranding();boot();}
})();