(()=>{
'use strict';
if(window.__zzSiteManagerPro)return;window.__zzSiteManagerPro=1;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const KEY='site_manager_v1';
const ICONS=['✦','★','＋','◫','▦','%','📚','▣','🎁','☎','⌖','✍','🚚','✓','↺'];
const SECTION_DEFAULTS=[
 {key:'trending',label:'Përzgjedhja ZemZem',selector:'#trending',icon:'✦',visible:true},
 {key:'new',label:'Të sapoardhurat',selector:'#new-arrivals',icon:'＋',visible:true},
 {key:'categories',label:'Kategoritë',selector:'__categories__',icon:'◫',visible:true},
 {key:'authors',label:'Autorët',selector:'#homeAuthors',icon:'✎',visible:true},
 {key:'offers',label:'Oferta',selector:'#oferta',icon:'%',visible:true},
 {key:'bestsellers',label:'Më të shiturit',selector:'#bestsellers',icon:'★',visible:true},
 {key:'blog',label:'Blog',selector:'#homeBlog',icon:'✍',visible:true},
 {key:'all_books',label:'Të gjithë librat',selector:'#all-books',icon:'▦',visible:true}
];
const FOOTER_DEFAULTS=[
 {label:'Libra fizikë',href:'shop.html',icon:'📚',visible:true},
 {label:'eBook',href:'ebooks.html',icon:'▣',visible:true},
 {label:'Oferta',href:'index.html#oferta',icon:'%',visible:true},
 {label:'Gift Card',href:'gift-card.html',icon:'🎁',visible:true},
 {label:'Blog',href:'blog.html',icon:'✍',visible:true},
 {label:'Kontakt',href:'contact.html',icon:'☎',visible:true},
 {label:'Gjurmo porosinë',href:'tracking.html',icon:'⌖',visible:true}
];
let cfg=null,loaded=false,activeIconInput=null;
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function mergeDefaults(x){
 const c=x&&typeof x==='object'?clone(x):{};
 c.home_sections=Array.isArray(c.home_sections)?c.home_sections:clone(SECTION_DEFAULTS);
 c.footer_links=Array.isArray(c.footer_links)?c.footer_links:clone(FOOTER_DEFAULTS);
 c.advanced={section_order_enabled:false,footer_icons:true,...(c.advanced||{})};
 return c;
}
function style(){
 if(q('#zzsmProStyle'))return;
 const st=document.createElement('style');st.id='zzsmProStyle';st.textContent=`
 .zzsm-pro-panel{display:none}.zzsm-pro-panel.active{display:block}
 .zzsm-pro-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 14px}
 .zzsm-repeater{display:grid;gap:9px}.zzsm-row{display:grid;grid-template-columns:42px minmax(140px,.9fr) minmax(180px,1.5fr) 92px auto;gap:8px;align-items:center;padding:10px;border:1px solid #e3eae6;border-radius:12px;background:#fff}
 .zzsm-row.is-deleted{opacity:.5;background:#fafafa}.zzsm-row input{width:100%;border:1px solid #dbe4df;border-radius:9px;padding:9px 10px;min-width:0}.zzsm-row .zzsm-icon-input{text-align:center;font-size:18px}
 .zzsm-row-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.zzsm-mini{border:1px solid #dbe4df;background:#fff;border-radius:8px;padding:7px 9px;cursor:pointer;font-weight:800}.zzsm-mini:hover{background:#f3f7f5}.zzsm-mini.danger{color:#a13e36;border-color:#ead2cf}.zzsm-icon-palette{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 14px}.zzsm-icon-palette button{width:34px;height:34px;border:1px solid #dbe4df;border-radius:9px;background:#fff;cursor:pointer;font-size:17px}
 .zzsm-pro-note{font-size:12px;color:#6f7f77;margin:0 0 12px}.zzsm-pro-status{font-size:12px;font-weight:800;color:#5e7369;margin-top:10px}.zzsm-pro-status.error{color:#a13e36}
 @media(max-width:900px){.zzsm-row{grid-template-columns:40px 1fr}.zzsm-row>[data-pro-href]{grid-column:1/-1}.zzsm-row-actions{grid-column:1/-1;justify-content:flex-start}}
 `;document.head.appendChild(st)
}
function build(){
 const view=q('#view-site-manager'),tabs=q('#zzsmTabs');if(!view||!tabs||q('[data-tab="structure-pro"]'))return false;
 style();
 const tab=document.createElement('button');tab.type='button';tab.className='zzsm-tab';tab.dataset.tab='structure-pro';tab.textContent='Strukturë & Ikona';tabs.appendChild(tab);
 const panel=document.createElement('div');panel.id='zzsmAdvancedPanel';panel.className='zzsm-pro-panel';
 panel.innerHTML=`
 <div class="zzsm-card"><h3>Struktura e Ballinës</h3><p class="zzsm-pro-note">Rendit, fshi/fsheh dhe cakto ikonë për seksionet kryesore. Renditja aplikohet vetëm kur e aktivizon.</p>
   <div class="zzsm-pro-toolbar"><label class="zzsm-toggle"><span>Aktivizo renditjen manuale të seksioneve</span><input type="checkbox" id="zzsmOrderEnabled"></label><button class="secondary-btn" id="zzsmResetSections" type="button">Rikthe seksionet</button></div>
   <div class="zzsm-icon-palette" id="zzsmSectionPalette"></div><div class="zzsm-repeater" id="zzsmSectionRows"></div>
 </div>
 <div class="zzsm-card"><div class="site-card-head"><div><h3>Footer Links</h3><p class="zzsm-pro-note">Shto, dupliko, rendit ose fshi lidhjet e footer-it. Ikonat janë opsionale.</p></div><button class="primary-btn" id="zzsmAddFooter" type="button">＋ Shto link</button></div>
   <div class="zzsm-pro-toolbar"><label class="zzsm-toggle"><span>Shfaq ikonat në footer</span><input type="checkbox" id="zzsmFooterIcons"></label><button class="secondary-btn" id="zzsmResetFooter" type="button">Rikthe footer-in</button></div>
   <div class="zzsm-icon-palette" id="zzsmFooterPalette"></div><div class="zzsm-repeater" id="zzsmFooterRows"></div>
 </div>
 <div class="zzsm-actions"><button class="primary-btn" id="zzsmProSave" type="button">Ruaj Strukturën & Ikonat</button><a class="secondary-btn" href="index.html" target="_blank" rel="noopener">↗ Preview Ballina</a></div><div id="zzsmProStatus" class="zzsm-pro-status">Gati.</div>`;
 q('#zzsmPanels')?.appendChild(panel);
 tab.onclick=()=>activate();
 q('#zzsmProSave').onclick=save;
 q('#zzsmAddFooter').onclick=()=>{cfg.footer_links.push({label:'Link i ri',href:'#',icon:'•',visible:true,custom:true});renderFooter()};
 q('#zzsmResetSections').onclick=()=>{if(confirm('T’i rikthejmë seksionet fillestare?')){cfg.home_sections=clone(SECTION_DEFAULTS);renderSections()}};
 q('#zzsmResetFooter').onclick=()=>{if(confirm('T’i rikthejmë linket fillestare të footer-it?')){cfg.footer_links=clone(FOOTER_DEFAULTS);renderFooter()}};
 q('#zzsmOrderEnabled')?.addEventListener('change',e=>{cfg.advanced.section_order_enabled=e.target.checked});
 q('#zzsmFooterIcons')?.addEventListener('change',e=>{cfg.advanced.footer_icons=e.target.checked});
 palettes();
 return true;
}
function activate(){
 qa('.zzsm-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='structure-pro'));
 qa('.zzsm-panel').forEach(x=>x.classList.remove('active'));
 q('#zzsmAdvancedPanel')?.classList.add('active');
 if(!loaded)load();
}
function palettes(){
 const html=ICONS.map(i=>'<button type="button" data-icon="'+esc(i)+'">'+esc(i)+'</button>').join('');
 q('#zzsmSectionPalette').innerHTML=html;q('#zzsmFooterPalette').innerHTML=html;
 qa('.zzsm-icon-palette [data-icon]').forEach(b=>b.onclick=()=>{
   if(!activeIconInput){status('Kliko fillimisht fushën e ikonës që dëshiron të ndryshosh.');return}
   activeIconInput.value=b.dataset.icon;activeIconInput.dispatchEvent(new Event('input',{bubbles:true}));
 });
}
function status(t,e=false){const s=q('#zzsmProStatus');if(s){s.textContent=t;s.className='zzsm-pro-status'+(e?' error':'')}}
function sectionRow(x,i){
 return '<div class="zzsm-row'+(x.deleted?' is-deleted':'')+'" data-section-i="'+i+'">'+
 '<input class="zzsm-icon-input" data-pro-icon value="'+esc(x.icon||'')+'" maxlength="8">'+
 '<input data-pro-label value="'+esc(x.label||'')+'" placeholder="Emri">'+
 '<input value="'+esc(x.selector||'')+'" disabled title="Selector teknik">'+
 '<label class="site-check"><input type="checkbox" data-pro-visible '+(x.visible!==false&&!x.deleted?'checked':'')+'> Shfaqe</label>'+
 '<div class="zzsm-row-actions"><button class="zzsm-mini" type="button" data-up>↑</button><button class="zzsm-mini" type="button" data-down>↓</button><button class="zzsm-mini danger" type="button" data-del>'+(x.deleted?'Rikthe':'Fshi')+'</button></div></div>';
}
function renderSections(){
 q('#zzsmSectionRows').innerHTML=(cfg.home_sections||[]).map(sectionRow).join('');
 qa('[data-section-i]').forEach(r=>{const i=Number(r.dataset.sectionI),x=cfg.home_sections[i];
  const iconInput=r.querySelector('[data-pro-icon]');iconInput.onfocus=()=>activeIconInput=iconInput;iconInput.onclick=()=>activeIconInput=iconInput;iconInput.oninput=e=>x.icon=e.target.value;
  r.querySelector('[data-pro-label]').oninput=e=>x.label=e.target.value;
  r.querySelector('[data-pro-visible]').onchange=e=>{x.visible=e.target.checked;if(e.target.checked)x.deleted=false};
  r.querySelector('[data-up]').onclick=()=>move(cfg.home_sections,i,-1,renderSections);
  r.querySelector('[data-down]').onclick=()=>move(cfg.home_sections,i,1,renderSections);
  r.querySelector('[data-del]').onclick=()=>{x.deleted=!x.deleted;if(x.deleted)x.visible=false;renderSections()};
 });
 q('#zzsmOrderEnabled').checked=cfg.advanced?.section_order_enabled===true;
}
function footerRow(x,i){
 return '<div class="zzsm-row'+(x.deleted?' is-deleted':'')+'" data-footer-i="'+i+'">'+
 '<input class="zzsm-icon-input" data-pro-icon value="'+esc(x.icon||'')+'" maxlength="8">'+
 '<input data-pro-label value="'+esc(x.label||'')+'" placeholder="Emri">'+
 '<input data-pro-href value="'+esc(x.href||'')+'" placeholder="shop.html ose https://...">'+
 '<label class="site-check"><input type="checkbox" data-pro-visible '+(x.visible!==false&&!x.deleted?'checked':'')+'> Shfaqe</label>'+
 '<div class="zzsm-row-actions"><button class="zzsm-mini" type="button" data-up>↑</button><button class="zzsm-mini" type="button" data-down>↓</button><button class="zzsm-mini" type="button" data-copy>⧉</button><button class="zzsm-mini danger" type="button" data-del>'+(x.deleted?'Rikthe':'Fshi')+'</button></div></div>';
}
function renderFooter(){
 q('#zzsmFooterRows').innerHTML=(cfg.footer_links||[]).map(footerRow).join('');
 qa('[data-footer-i]').forEach(r=>{const i=Number(r.dataset.footerI),x=cfg.footer_links[i];
  const iconInput=r.querySelector('[data-pro-icon]');iconInput.onfocus=()=>activeIconInput=iconInput;iconInput.onclick=()=>activeIconInput=iconInput;iconInput.oninput=e=>x.icon=e.target.value;
  r.querySelector('[data-pro-label]').oninput=e=>x.label=e.target.value;
  r.querySelector('[data-pro-href]').oninput=e=>x.href=e.target.value;
  r.querySelector('[data-pro-visible]').onchange=e=>{x.visible=e.target.checked;if(e.target.checked)x.deleted=false};
  r.querySelector('[data-up]').onclick=()=>move(cfg.footer_links,i,-1,renderFooter);
  r.querySelector('[data-down]').onclick=()=>move(cfg.footer_links,i,1,renderFooter);
  r.querySelector('[data-copy]').onclick=()=>{const cp=clone(x);cp.label=(cp.label||'Link')+' kopje';cp.custom=true;cfg.footer_links.splice(i+1,0,cp);renderFooter()};
  r.querySelector('[data-del]').onclick=()=>{x.deleted=!x.deleted;if(x.deleted)x.visible=false;renderFooter()};
 });
 q('#zzsmFooterIcons').checked=cfg.advanced?.footer_icons!==false;
}
function move(arr,i,d,render){const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];render()}
async function load(){
 status('Duke ngarkuar…');
 try{const rows=await window.api('site_content?key=eq.'+KEY+'&select=content&limit=1');cfg=mergeDefaults(rows?.[0]?.content||{});renderSections();renderFooter();loaded=true;status('Gati për ndryshime.')}
 catch(e){status('Nuk u ngarkua: '+e.message,true)}
}
async function save(){
 const b=q('#zzsmProSave');b.disabled=true;status('Duke ruajtur…');
 try{
   cfg.advanced=cfg.advanced||{};cfg.advanced.section_order_enabled=q('#zzsmOrderEnabled').checked;cfg.advanced.footer_icons=q('#zzsmFooterIcons').checked;
   await window.api('site_content?key=eq.'+KEY,{method:'PATCH',body:{content:cfg,updated_at:new Date().toISOString()},prefer:'return=minimal'});
   status('U ruajt. Rifresko faqen për t’i parë ndryshimet.');window.toast?.('Struktura & ikonat u ruajtën');
 }catch(e){status('Ruajtja dështoi: '+e.message,true);window.toast?.(e.message,'error')}finally{b.disabled=false}
}
function boot(){let n=0;const t=setInterval(()=>{n++;if(build()||n>100)clearInterval(t)},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();