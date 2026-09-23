(()=>{
'use strict';
const URL='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION_KEY='zemzem_customer_session';
const q=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=v=>Number(v||0).toFixed(2)+' €';
let session=null,status=null,dashboard=null;
function loadSession(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{session=null}}
function saveSession(d){session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+(d.expires_in||3600),user:d.user};localStorage.setItem(SESSION_KEY,JSON.stringify(session))}
async function raw(path,{method='GET',body,token}={}){const h={apikey:KEY};if(body!==undefined)h['Content-Type']='application/json';if(token)h.Authorization='Bearer '+token;const r=await fetch(URL+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'}),t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.message||d?.msg||d?.error_description||d?.error||'Gabim');return d}
async function ensure(){if(!session)return false;if((session.expires_at||0)-Math.floor(Date.now()/1000)<60){try{const d=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});saveSession(d)}catch{session=null;localStorage.removeItem(SESSION_KEY);return false}}return true}
async function rpc(fn,body={}){if(!await ensure())throw new Error('Duhet të kyçesh.');return raw('/rest/v1/rpc/'+fn,{method:'POST',body,token:session.access_token})}
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
 const s=dashboard.supplier,m=dashboard.month||{},books=dashboard.books||[],sets=dashboard.settlements||[];
 q('#partnerApp').innerHTML=`
 <div class="partner-shell">
  <aside class="partner-side">
   <div class="partner-side-title"><small>LIBRARIA</small><strong>${esc(s.name)}</strong></div>
   <button class="active" data-partner-section="overview"><span>◫</span> Përmbledhje</button>
   <button data-partner-section="books"><span>▥</span> Librat e mi</button>
   <button data-partner-section="add"><span>＋</span> Shto libër</button>
   <button data-partner-section="settlements"><span>€</span> Barazimet</button>
   <button data-partner-section="account"><span>◎</span> Llogaria</button>
  </aside>
  <div class="partner-content">
   <section data-partner-panel="overview">
    <div class="partner-page-head"><div><span class="partner-kicker" style="color:#547363">DASHBOARD</span><h2>Mirë se erdhe, ${esc(s.name)}</h2><p>Pasqyra e këtij muaji dhe aktiviteti i katalogut.</p></div><span class="partner-status approved">Partner aktiv</span></div>
    <div class="partner-kpis"><div class="partner-kpi"><span>Libra të shitur këtë muaj</span><strong>${m.quantity||0}</strong></div><div class="partner-kpi"><span>Shuma që të takon</span><strong>${money(m.supplier_due)}</strong></div><div class="partner-kpi"><span>Fitimi ZemZem</span><strong>${money(m.zemzem_profit)}</strong></div></div>
    <div class="partner-card"><h3>Si llogaritet çmimi</h3><p>Marzhi yt aktual me ZemZem është <b>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</b>. Çmimi publik llogaritet automatikisht sa herë shton ose ndryshon një libër.</p></div>
   </section>
   <section data-partner-panel="books" hidden>
    <div class="partner-page-head"><div><h2>Librat e mi</h2><p>Katalogu që i përket librarisë tënde.</p></div><button class="btn primary" data-open-section="add">＋ Shto libër</button></div>
    <div class="partner-card" style="margin-top:0"><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Libri</th><th>Çmimi yt</th><th>Çmimi publik</th><th>Stoku</th><th>Statusi</th></tr></thead><tbody>${books.map(b=>'<tr><td><div class="book-title-cell">'+(b.cover_url?'<img class="book-cover-mini" src="'+esc(b.cover_url)+'" alt="">':'<div class="book-cover-placeholder">▥</div>')+'<div><b>'+esc(b.title)+'</b><br><small>'+esc(b.isbn||b.sku||'')+'</small></div></div></td><td><span class="price-pill">'+money(b.cost_price)+'</span></td><td><b>'+money(b.price)+'</b></td><td>'+Number(b.stock_quantity||0)+'</td><td><span class="status-pill '+esc(b.status)+'">'+esc(b.status)+'</span></td></tr>').join('')||'<tr><td colspan="5">Ende nuk ke libra.</td></tr>'}</tbody></table></div></div>
   </section>
   <section data-partner-panel="add" hidden>
    <div class="partner-page-head"><div><h2>Shto libër të ri</h2><p>Plotëso të dhënat. Çmimi publik llogaritet automatikisht.</p></div></div>
    <div class="partner-grid"><div class="partner-card" style="margin-top:0"><form id="partnerBookForm" class="partner-form"><label class="full">Titulli<input name="title" required placeholder="Titulli i librit"></label><label>ISBN<input name="isbn" placeholder="978..."></label><label>Çmimi yt €<input name="cost_price" type="number" min="0" step=".01" required placeholder="8.00"></label><label>Stoku<input name="stock" type="number" min="0" step="1" required value="0"></label><label class="full">URL e kopertinës<input name="cover_url" type="url" placeholder="https://..."></label><label class="full">Përshkrimi<textarea name="description" rows="5" placeholder="Përshkrimi i librit"></textarea></label><button class="btn primary" type="submit">Ruaj librin</button></form><div id="bookMsg"></div></div><div class="partner-card" style="margin-top:0"><h3>Çmimi transparent</h3><p>Partneri vendos çmimin bazë. ZemZem shton marzhin e dakorduar dhe klienti sheh vetëm çmimin final.</p><div class="partner-formula" style="background:#173d2b;color:#fff"><small>MARZHI AKTUAL</small><div class="formula-total"><span>ZemZem</span><strong>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</strong></div></div></div></div>
   </section>
   <section data-partner-panel="settlements" hidden>
    <div class="partner-page-head"><div><h2>Barazimet mujore</h2><p>Historiku i shumave të llogaritura dhe pagesave.</p></div></div>
    <div class="partner-card" style="margin-top:0"><div class="partner-book-list"><table class="partner-table"><thead><tr><th>Periudha</th><th>Copë</th><th>Të takon</th><th>Fitim ZemZem</th><th>Statusi</th></tr></thead><tbody>${sets.map(x=>'<tr><td>'+esc(x.period_start)+' – '+esc(x.period_end)+'</td><td>'+x.quantity_total+'</td><td><b>'+money(x.supplier_due)+'</b></td><td>'+money(x.zemzem_profit)+'</td><td><span class="status-pill '+(x.status==='paid'?'published':'')+'">'+(x.status==='paid'?'Paguar':'Hapur')+'</span></td></tr>').join('')||'<tr><td colspan="5">Ende nuk ka barazime.</td></tr>'}</tbody></table></div></div>
   </section>
   <section data-partner-panel="account" hidden>
    <div class="partner-page-head"><div><h2>Llogaria e partnerit</h2><p>Të dhënat bazë dhe kushtet aktuale.</p></div></div>
    <div class="partner-card" style="margin-top:0"><p><b>${esc(s.name)}</b><br>${esc(s.email||'')}<br>${esc(s.phone||'')}<br><br>Marzhi ZemZem: <b>${s.margin_type==='fixed'?money(s.margin_value):Number(s.margin_value)+'%'}</b></p><button class="btn secondary" id="logout">Dil nga llogaria</button></div>
   </section>
  </div>
 </div>`;
 function openSection(key){document.querySelectorAll('[data-partner-panel]').forEach(x=>x.hidden=x.dataset.partnerPanel!==key);document.querySelectorAll('[data-partner-section]').forEach(x=>x.classList.toggle('active',x.dataset.partnerSection===key))}
 document.querySelectorAll('[data-partner-section]').forEach(b=>b.onclick=()=>openSection(b.dataset.partnerSection));document.querySelectorAll('[data-open-section]').forEach(b=>b.onclick=()=>openSection(b.dataset.openSection));
 q('#partnerBookForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));try{await rpc('partner_book_upsert',{p_id:null,p_title:x.title,p_isbn:x.isbn||null,p_cost_price:Number(x.cost_price),p_stock:Number(x.stock||0),p_cover_url:x.cover_url||null,p_description:x.description||null});dashboard=await rpc('partner_dashboard',{});renderDashboard();setTimeout(()=>{document.querySelector('[data-partner-section="books"]')?.click()},30)}catch(err){q('#bookMsg').innerHTML='<div class="partner-msg error">'+esc(err.message)+'</div>'}});
 q('#logout')?.addEventListener('click',()=>{localStorage.removeItem(SESSION_KEY);session=null;renderAuth()});
}
async function boot(){loadSession();if(!await ensure()){renderAuth();return}try{status=await rpc('partner_my_status',{});if(!status.applied){renderApply();return}if(status.status!=='approved'||!status.enabled){renderPending();return}dashboard=await rpc('partner_dashboard',{});renderDashboard()}catch(err){q('#partnerApp').innerHTML='<div class="partner-card"><div class="partner-msg error">'+esc(err.message)+'</div></div>'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();