(()=>{
'use strict';
if(window.__zzSiteManagerAdmin)return;window.__zzSiteManagerAdmin=1;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const KEY='site_manager_v1';
const defaults={
 version:1,
 global:{support_label:'Porosit & Pyet',footer_tagline:'Libra me vlerë · porosi e thjeshtë · mbështetje njerëzore',footer_payment:'PayPal dhe Cash on Delivery.',footer_shipping:'KS 3 € · AL 6 € · MK 6 €'},
 home:{trending_title:'Libra të zgjedhur',new_title:'Të sapoardhurat',categories_title:'Kategoritë kryesore',offers_title:'Oferta',bestsellers_title:'Më të shiturit',all_books_title:'Të gjithë librat'},
 shop:{title:'Libra fizikë për bibliotekën tënde.',subtitle:'Shfleto katalogun',all_title:'Të gjithë librat fizikë'},
 product:{description_tab:'Përshkrimi',details_tab:'Detaje',related_tab:'Produkte të ngjashme',description_title:'Përshkrimi i librit',details_title:'Detajet e librit',reviews_title:'Recensionet',related_title:'Blerësit shikojnë edhe',recent_title:'Ke parë së fundmi'},
 checkout:{title:'Shporta & Checkout',cart_title:'Shporta',summary_title:'Përmbledhje',order_data_title:'Të dhënat e porosisë',coupon_label:'Kupon',gift_card_label:'Gift Card / Voucher',gift_wrap_label:'Paketim dhurate',payment_title:'Mënyra e pagesës',cod_button:'Porosit me Cash on Delivery',total_title:'Totali i porosisë'},
 ebooks:{title:'eBook në shqip, me qasje të sigurt.',subtitle:'Bibliotekë digjitale për lexim të menjëhershëm',all_title:'eBook në shqip'},
 about:{title:'Rreth ZemZem',hero:'Libra të zgjedhur, blerje e thjeshtë',mission:'Çfarë synojmë',cta:'Gati të fillojmë?'},
 contact:{title:'Kontakt & Ndihmë',hero:'Si mund të të ndihmojmë?',question:'Ke pyetje për një libër?',before_order:'Para se të porosisësh',cta:'Gati të fillojmë?'},
 design:{section_title_px:32,card_radius_px:16,button_radius_px:10,base_scale:100},
 features:{home_trending:true,home_new:true,home_categories:true,home_offers:true,home_bestsellers:true,home_all_books:true,product_reviews:true,product_related:true,product_recent:true,checkout_gift_wrap:true,ebooks_languages:true}
};
const clone=o=>JSON.parse(JSON.stringify(o));
let cfg=clone(defaults),loaded=false,dirty=false;
const tabs=[
 ['global','Header + Footer'],['home','Ballina'],['shop','Shop'],['product','Product'],['checkout','Checkout'],['ebooks','eBook'],['about','About'],['contact','Contact'],['design','Global Design'],['features','Feature Toggles']
];
const fields={
 global:[['support_label','Teksti i kontaktit'],['footer_tagline','Footer tagline'],['footer_payment','Pagesat në footer'],['footer_shipping','Transporti në footer']],
 home:[['trending_title','Përzgjedhja ZemZem'],['new_title','Të sapoardhurat'],['categories_title','Kategoritë kryesore'],['offers_title','Oferta'],['bestsellers_title','Më të shiturit'],['all_books_title','Të gjithë librat']],
 shop:[['title','Titulli kryesor'],['subtitle','Teksti i butonit/katalogut'],['all_title','Titulli i katalogut']],
 product:[['description_tab','Tab Përshkrimi'],['details_tab','Tab Detaje'],['related_tab','Tab Produkte të ngjashme'],['description_title','Titulli i përshkrimit'],['details_title','Titulli i detajeve'],['reviews_title','Titulli i recensioneve'],['related_title','Titulli i produkteve të ngjashme'],['recent_title','Titulli “Ke parë së fundmi”']],
 checkout:[['title','Titulli i checkout'],['cart_title','Titulli Shporta'],['summary_title','Titulli Përmbledhje'],['order_data_title','Të dhënat e porosisë'],['coupon_label','Kupon'],['gift_card_label','Gift Card / Voucher'],['gift_wrap_label','Paketim dhurate'],['payment_title','Mënyra e pagesës'],['cod_button','Butoni COD'],['total_title','Totali i porosisë']],
 ebooks:[['title','Titulli eBook'],['subtitle','Nëntitulli'],['all_title','Titulli i katalogut eBook']],
 about:[['title','Titulli i faqes'],['hero','Hero'],['mission','Seksioni i misionit'],['cta','CTA']],
 contact:[['title','Titulli i faqes'],['hero','Hero'],['question','Pyetja kryesore'],['before_order','Para porosisë'],['cta','CTA']]
};
const previews={global:'index.html',home:'index.html',shop:'shop.html',product:'product.html',checkout:'checkout.html',ebooks:'ebooks.html',about:'about.html',contact:'contact.html',design:'index.html',features:'index.html'};
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function merge(base,next){const out=clone(base);Object.keys(next||{}).forEach(k=>{out[k]=next[k]&&typeof next[k]==='object'&&!Array.isArray(next[k])?merge(out[k]||{},next[k]):next[k]});return out}
function ensureStyle(){
 if(q('#zzSiteManagerAdminStyle'))return;
 const st=document.createElement('style');st.id='zzSiteManagerAdminStyle';st.textContent=`
 #view-site-manager{padding-bottom:60px}.zzsm-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.zzsm-head h2{margin:3px 0 5px}.zzsm-actions{display:flex;gap:8px;flex-wrap:wrap}
 .zzsm-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px}.zzsm-tab{border:1px solid #dce5e1;background:#fff;border-radius:10px;padding:9px 12px;font-weight:850;cursor:pointer}.zzsm-tab.active{background:#173d2b;color:#fff;border-color:#173d2b}
 .zzsm-panel{display:none}.zzsm-panel.active{display:block}.zzsm-card{background:#fff;border:1px solid #e0e7e4;border-radius:16px;padding:18px;margin-bottom:14px}.zzsm-card h3{margin:0 0 5px}.zzsm-card p{margin:0 0 16px;color:#718079;font-size:12px}
 .zzsm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.zzsm-field{display:grid;gap:6px}.zzsm-field label{font-size:11px;font-weight:850;color:#51645b}.zzsm-field input,.zzsm-field select{width:100%;border:1px solid #dce5e1;border-radius:10px;padding:11px 12px;background:#fff}
 .zzsm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid #e6ece9;border-radius:12px}.zzsm-toggle input{width:20px;height:20px}.zzsm-state{margin-top:10px;font-size:12px;font-weight:800;color:#597167}.zzsm-state.error{color:#a33d34}.zzsm-preview{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
 @media(max-width:760px){.zzsm-head{flex-direction:column}.zzsm-grid{grid-template-columns:1fr}.zzsm-actions{width:100%}.zzsm-actions>*{flex:1}}
 `;document.head.appendChild(st)
}
function build(){
 if(q('#view-site-manager'))return;
 ensureStyle();
 const main=q('.main');if(!main)return;
 const sec=document.createElement('section');sec.id='view-site-manager';sec.className='view';
 sec.innerHTML=`<div class="zzsm-head"><div><div class="eyebrow">SITE MANAGER</div><h2>Menaxhimi i plotë i faqes</h2><p>Ndrysho tekstet, dizajnin dhe modulet pa hyrë në kod.</p></div><div class="zzsm-actions"><button class="secondary-btn" id="zzsmReload">Rikthe nga databaza</button><button class="danger-btn" id="zzsmReset">Reset</button><button class="primary-btn" id="zzsmSave">Ruaj të gjitha</button></div></div><div class="zzsm-tabs" id="zzsmTabs"></div><div id="zzsmPanels"></div><div id="zzsmState" class="zzsm-state">Hape Site Manager për të ngarkuar konfigurimin.</div>`;
 main.appendChild(sec);
 const tabsHost=q('#zzsmTabs'),panels=q('#zzsmPanels');
 tabs.forEach(([key,label],i)=>{
   const b=document.createElement('button');b.type='button';b.className='zzsm-tab'+(i===0?' active':'');b.dataset.tab=key;b.textContent=label;tabsHost.appendChild(b);
   const p=document.createElement('div');p.className='zzsm-panel'+(i===0?' active':'');p.dataset.panel=key;p.innerHTML=panelHtml(key,label);panels.appendChild(p);
 });
 qa('.zzsm-tab').forEach(b=>b.onclick=()=>activate(b.dataset.tab));
 q('#zzsmSave').onclick=save;q('#zzsmReload').onclick=load;q('#zzsmReset').onclick=reset;
 sec.addEventListener('input',()=>{dirty=true;state('Ka ndryshime të paruajtura.')});sec.addEventListener('change',()=>{dirty=true;state('Ka ndryshime të paruajtura.')});
}
function panelHtml(key,label){
 if(fields[key]){
   return `<div class="zzsm-card"><h3>${label}</h3><p>Ndryshimet këtu dalin live pasi t’i ruash.</p><div class="zzsm-grid">${fields[key].map(([name,l])=>`<div class="zzsm-field"><label>${l}</label><input data-path="${key}.${name}"></div>`).join('')}</div><div class="zzsm-preview"><a class="secondary-btn" target="_blank" rel="noopener" href="${previews[key]}">↗ Preview</a></div></div>`;
 }
 if(key==='design')return `<div class="zzsm-card"><h3>Global Design</h3><p>Madhësi dhe forma që aplikohen në të gjithë storefront-in.</p><div class="zzsm-grid"><div class="zzsm-field"><label>Tituj seksionesh (px)</label><input type="number" min="20" max="52" data-path="design.section_title_px"></div><div class="zzsm-field"><label>Rrumbullakimi i kartave (px)</label><input type="number" min="0" max="40" data-path="design.card_radius_px"></div><div class="zzsm-field"><label>Rrumbullakimi i butonave (px)</label><input type="number" min="0" max="30" data-path="design.button_radius_px"></div><div class="zzsm-field"><label>Shkalla bazë e tekstit (%)</label><input type="number" min="85" max="115" data-path="design.base_scale"></div></div><div class="zzsm-preview"><a class="secondary-btn" target="_blank" rel="noopener" href="index.html">↗ Preview Ballina</a><a class="secondary-btn" target="_blank" rel="noopener" href="shop.html">↗ Preview Shop</a></div></div>`;
 if(key==='features'){
   const labels={home_trending:'Përzgjedhja ZemZem',home_new:'Të sapoardhurat',home_categories:'Kategoritë',home_offers:'Oferta',home_bestsellers:'Më të shiturit',home_all_books:'Të gjithë librat',product_reviews:'Recensione në Product',product_related:'Produkte të ngjashme',product_recent:'Ke parë së fundmi',checkout_gift_wrap:'Paketim dhurate',ebooks_languages:'Filtrat sipas gjuhës'};
   return `<div class="zzsm-card"><h3>Feature Toggles</h3><p>Aktivizo ose fsheh module pa deploy.</p><div class="zzsm-grid">${Object.entries(labels).map(([n,l])=>`<label class="zzsm-toggle"><span>${l}</span><input type="checkbox" data-path="features.${n}"></label>`).join('')}</div><div class="zzsm-preview"><a class="secondary-btn" target="_blank" rel="noopener" href="index.html">↗ Preview</a></div></div>`;
 }
 return '';
}
function sidebar(){
 const side=q('.side-nav');if(!side||q('[data-view="site-manager"]'))return;
 const b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.view='site-manager';b.innerHTML='<span class="side-menu-icon">⚙️</span><span>Site Manager</span>';
 const anchor=q('[data-view="site"]');if(anchor?.nextSibling)side.insertBefore(b,anchor.nextSibling);else side.appendChild(b);
 b.onclick=()=>open();
}
function activate(key){qa('.zzsm-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===key));qa('.zzsm-panel').forEach(x=>x.classList.toggle('active',x.dataset.panel===key))}
function getPath(obj,path){return path.split('.').reduce((a,k)=>a?.[k],obj)}
function setPath(obj,path,val){const a=path.split('.');let x=obj;a.slice(0,-1).forEach(k=>x=x[k]||(x[k]={}));x[a.at(-1)]=val}
function fill(){
 qa('#view-site-manager [data-path]').forEach(el=>{const v=getPath(cfg,el.dataset.path);if(el.type==='checkbox')el.checked=v!==false;else el.value=v??''});
}
function gather(){
 const out=clone(cfg);qa('#view-site-manager [data-path]').forEach(el=>{let v=el.type==='checkbox'?el.checked:el.value;if(el.type==='number')v=Number(v);setPath(out,el.dataset.path,v)});return out;
}
function state(t,err=false){const s=q('#zzsmState');if(!s)return;s.textContent=t;s.className='zzsm-state'+(err?' error':'')}
async function load(){
 state('Duke ngarkuar…');try{const rows=await window.api('site_content?key=eq.'+KEY+'&select=content,updated_at&limit=1');cfg=merge(defaults,rows?.[0]?.content||{});fill();loaded=true;dirty=false;state('Gati për ndryshime.')}catch(e){state('Nuk u ngarkua: '+e.message,true)}
}
async function save(){
 const btn=q('#zzsmSave');btn.disabled=true;state('Duke ruajtur…');try{cfg=gather();await window.api('site_content?key=eq.'+KEY,{method:'PATCH',body:{content:cfg,updated_at:new Date().toISOString()},prefer:'return=minimal'});dirty=false;state('U ruajt. Ndryshimet dalin live pas rifreskimit të faqes.');window.toast?.('Site Manager u ruajt')}catch(e){state('Ruajtja dështoi: '+e.message,true);window.toast?.(e.message,'error')}finally{btn.disabled=false}
}
async function reset(){
 if(!confirm('T’i rikthejmë të gjitha vlerat e Site Manager në gjendjen fillestare?'))return;
 cfg=clone(defaults);fill();dirty=true;await save();
}
async function open(){
 try{if(typeof window.setView==='function')window.setView('site-manager')}catch{}
 qa('.view').forEach(v=>v.classList.toggle('active-view',v.id==='view-site-manager'));const t=q('#viewTitle');if(t)t.textContent='Site Manager';qa('.nav-item[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view==='site-manager'));if(!loaded)await load();
}
function boot(){build();sidebar();let n=0;const t=setInterval(()=>{n++;build();sidebar();if(q('#view-site-manager')&&q('[data-view="site-manager"]')||n>80)clearInterval(t)},200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();