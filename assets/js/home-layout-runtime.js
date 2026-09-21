(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const DEF=[
 {key:'feature_strip',visible:true},{key:'collection_rail',visible:true},{key:'why',visible:true},{key:'trending',visible:true},{key:'new_arrivals',visible:true},{key:'categories',visible:true},{key:'offers',visible:true},{key:'bestsellers',visible:true},{key:'newsletter',visible:true},{key:'all_books',visible:true}
];
const SELECTORS={feature_strip:'.feature-strip',collection_rail:'.collection-rail',why:'#homeWhy',trending:'#trending',new_arrivals:'#new-arrivals',categories:'[data-home-category-cards]',offers:'#oferta',bestsellers:'#bestsellers',newsletter:'#zv2Newsletter',all_books:'#all-books'};
async function api(path){const r=await fetch(SB+'/rest/v1/'+path,{headers:{apikey:KEY},cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function nodeFor(k){const el=document.querySelector(SELECTORS[k]);if(!el)return null;return k==='categories'?el.closest('section'):el}
function normalizeLayout(raw){const known=new Set(DEF.map(x=>x.key)),arr=[];(Array.isArray(raw)?raw:[]).forEach(x=>{if(typeof x==='string')x={key:x,visible:true};if(x&&known.has(x.key)&&!arr.some(y=>y.key===x.key))arr.push({key:x.key,visible:x.visible!==false})});DEF.forEach(x=>{if(!arr.some(y=>y.key===x.key))arr.push({...x})});return arr}
function ensureCss(){if(document.getElementById('zzIndexManagerStyle'))return;document.head.insertAdjacentHTML('beforeend',`<style id="zzIndexManagerStyle">.zz-index-hidden{display:none!important}.zz-index-banner{width:min(1180px,calc(100% - 32px));margin:20px auto}.zz-index-banner-card{position:relative;min-height:150px;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,#173847,#0b6f75);color:#fff;display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.7fr);align-items:center;box-shadow:0 16px 42px rgba(24,52,68,.1)}.zz-index-banner-copy{padding:28px 34px;position:relative;z-index:2}.zz-index-banner-copy h2{margin:0 0 8px;font-size:30px;line-height:1.05}.zz-index-banner-copy p{margin:0 0 16px;color:rgba(255,255,255,.82);line-height:1.55}.zz-index-banner-copy a{display:inline-flex;padding:10px 16px;border-radius:999px;background:#fff;color:#173847;font-weight:850;font-size:12px}.zz-index-banner-media{height:100%;min-height:150px}.zz-index-banner-media img{width:100%;height:100%;object-fit:cover}.zz-index-banner.no-image .zz-index-banner-card{grid-template-columns:1fr;background:linear-gradient(135deg,#f1d0c7,#f8eee8);color:#233a4a}.zz-index-banner.no-image .zz-index-banner-copy p{color:#61717a}.zz-index-banner.no-image .zz-index-banner-copy a{background:#233a4a;color:#fff}.zz-index-banner.theme-light .zz-index-banner-card{background:linear-gradient(135deg,#fbf7f2,#efe7dd);color:#233a4a}.zz-index-banner.theme-light .zz-index-banner-copy p{color:#61717a}.zz-index-banner.theme-light .zz-index-banner-copy a{background:#233a4a;color:#fff}.zz-index-banner.theme-sale .zz-index-banner-card{background:linear-gradient(135deg,#a84338,#dd6a59);color:#fff}.zz-index-banner.theme-sale .zz-index-banner-copy a{background:#fff;color:#9b3c32}.zz-index-banner.is-clickable .zz-index-banner-card{cursor:pointer}.zz-index-banner.is-clickable .zz-index-banner-card:hover{transform:translateY(-2px);box-shadow:0 20px 48px rgba(24,52,68,.14)}.zz-index-banner-card{transition:.18s ease}@media(max-width:700px){.zz-index-banner{width:min(100% - 20px,1180px);margin:14px auto}.zz-index-banner-card{grid-template-columns:1fr}.zz-index-banner-copy{padding:22px}.zz-index-banner-copy h2{font-size:24px}.zz-index-banner-media{min-height:160px;max-height:220px}}</style>`)}
function applyVisibility(layout){layout.forEach(x=>{const n=nodeFor(x.key);if(n)n.classList.toggle('zz-index-hidden',x.visible===false)})}
function reorder(layout){const visibleNodes=layout.map(x=>({cfg:x,node:nodeFor(x.key)})).filter(x=>x.node);if(!visibleNodes.length)return;const parent=visibleNodes[0].node.parentNode;if(!parent||!visibleNodes.every(x=>x.node.parentNode===parent))return;const footer=document.querySelector('footer');for(const {node} of visibleNodes)parent.insertBefore(node,footer&&footer.parentNode===parent?footer:null)}
function bannerTarget(pos){if(pos==='after_hero')return {ref:document.querySelector('.hero-wrap'),after:true};if(pos==='after_features')return {ref:document.querySelector('.feature-strip'),after:true};if(pos==='before_trending')return {ref:nodeFor('trending')};if(pos==='before_new_arrivals')return {ref:nodeFor('new_arrivals')};if(pos==='before_offers')return {ref:nodeFor('offers')};if(pos==='before_bestsellers')return {ref:nodeFor('bestsellers')};if(pos==='before_newsletter')return {ref:nodeFor('newsletter')||document.querySelector('#homeNewsletter')};if(pos==='before_footer')return {ref:document.querySelector('footer')};return {ref:nodeFor('newsletter')||document.querySelector('footer')}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderBanners(rows){
  document.querySelectorAll('[data-index-managed-banner]').forEach(x=>x.remove());
  const mobile=matchMedia('(max-width:700px)').matches,now=Date.now();
  (rows||[]).filter(x=>{
    if(!x||x.visible===false)return false;
    if(!(x.device==='all'||!x.device||(mobile?x.device==='mobile':x.device==='desktop')))return false;
    const start=x.start_at?new Date(x.start_at).getTime():null,end=x.end_at?new Date(x.end_at).getTime():null;
    if(start&&Number.isFinite(start)&&now<start)return false;
    if(end&&Number.isFinite(end)&&now>end)return false;
    return true
  }).forEach((x,i)=>{
    const target=bannerTarget(x.position);if(!target.ref)return;
    const href=x.product_id?('product.html?id='+encodeURIComponent(x.product_id)):(x.href||'');
    const wrap=document.createElement('section');
    wrap.className='zz-index-banner theme-'+(x.theme||'dark')+(x.image_url?'':' no-image')+(href?' is-clickable':'');
    wrap.dataset.indexManagedBanner=x.id||String(i);
    wrap.innerHTML=`<div class="zz-index-banner-card" ${href?`data-banner-href="${esc(href)}" role="link" tabindex="0"`:''}><div class="zz-index-banner-copy"><h2>${esc(x.title||'')}</h2>${x.subtitle?`<p>${esc(x.subtitle)}</p>`:''}${href?`<a href="${esc(href)}">${esc(x.button_label||'Porosit tani')} →</a>`:''}</div>${x.image_url?`<div class="zz-index-banner-media"><img src="${esc(x.image_url)}" alt=""></div>`:''}</div>`;
    const card=wrap.querySelector('[data-banner-href]');
    if(card){card.addEventListener('click',e=>{if(e.target.closest('a'))return;location.href=href});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.href=href}})}
    if(target.after)target.ref.insertAdjacentElement('afterend',wrap);else target.ref.insertAdjacentElement('beforebegin',wrap)
  })
}
function applyConfig(content){ensureCss();const layout=normalizeLayout(content?.index_layout||content?.layout_order||DEF);applyVisibility(layout);reorder(layout);renderBanners(content?.index_banners||[])}
async function boot(){if(!/\/(index\.html)?$/.test(location.pathname)&&location.pathname!=='/')return;try{const home=await api('site_content?key=eq.homepage&select=content&limit=1');const content=home?.[0]?.content||{};const apply=()=>applyConfig(content);apply();setTimeout(apply,350);setTimeout(apply,900);setTimeout(apply,1800);const mo=new MutationObserver(()=>{clearTimeout(window.__zzIndexLayoutTick);window.__zzIndexLayoutTick=setTimeout(apply,120)});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),7000)}catch(e){console.warn('Homepage layout manager unavailable',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();