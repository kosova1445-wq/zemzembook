(()=>{
'use strict';
if(window.__zzSiteManagerRuntime)return;window.__zzSiteManagerRuntime=1;
const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
let CFG=null,applying=false,observer=null;
const path=()=>location.pathname.split('/').pop()||'index.html';
const esc=v=>String(v??'');
function exactText(oldText,newText,root=document){
  if(!newText||newText===oldText)return;
  root.querySelectorAll('h1,h2,h3,h4,a,button,strong,span,div,p,label').forEach(el=>{
    if(el.children.length===0 && (el.textContent||'').trim()===oldText) el.textContent=newText;
  });
}
function setText(sel,text){const el=document.querySelector(sel);if(el&&text)el.textContent=text}
function show(sel,on){document.querySelectorAll(sel).forEach(el=>{el.style.setProperty('display',on?'':'none',on?'':'important')})}
function style(){
  if(!CFG)return;
  const d=CFG.design||{},f=CFG.features||{};
  let st=document.getElementById('zzSiteManagerStyle');
  if(!st){st=document.createElement('style');st.id='zzSiteManagerStyle';document.head.appendChild(st)}
  const sec=Math.max(20,Math.min(52,Number(d.section_title_px||32)));
  const cr=Math.max(0,Math.min(40,Number(d.card_radius_px||16)));
  const br=Math.max(0,Math.min(30,Number(d.button_radius_px||10)));
  const scale=Math.max(85,Math.min(115,Number(d.base_scale||100)))/100;
  st.textContent=`
    :root{--zz-sm-section-title:${sec}px;--zz-sm-card-radius:${cr}px;--zz-sm-button-radius:${br}px;--zz-sm-base-scale:${scale}}
    body{font-size:calc(16px * var(--zz-sm-base-scale))}
    body.zemzem-bookstore-v2 .section-head h2{font-size:var(--zz-sm-section-title)!important}
    .book-card,.promo,.why-card,.author-card,.home-blog-card,.zzfl-card,.account-card,.checkout-box,.summary-box{border-radius:var(--zz-sm-card-radius)!important}
    .btn,.primary-btn,.secondary-btn,.add-btn,.premium-primary-btn,.zzfl-btn,.zzfl-download,.checkout-btn,#placeOrderBtn{border-radius:var(--zz-sm-button-radius)!important}
  `;
  show('#trending',f.home_trending!==false);
  show('#new-arrivals',f.home_new!==false);
  show('[data-home-category-cards]\.closest',true);
  const cat=document.querySelector('[data-home-category-cards]');if(cat?.closest('.section'))cat.closest('.section').style.display=f.home_categories===false?'none':'';
  show('#oferta',f.home_offers!==false);
  show('#bestsellers',f.home_bestsellers!==false);
  show('#all-books',f.home_all_books!==false);
  show('#premiumReviews,.premium-reviews',f.product_reviews!==false);
  show('#premiumRelated,.premium-related',f.product_related!==false);
  show('#premiumRecent,.premium-recent',f.product_recent!==false);
  const gw=[...document.querySelectorAll('h2,h3,label,strong,span')].find(x=>(x.textContent||'').trim()==='Paketim dhurate');
  if(gw){const box=gw.closest('.checkout-box,.gift-wrap-box,.field,section,div');if(box)box.style.display=f.checkout_gift_wrap===false?'none':''}
}
function globalText(){
  const g=CFG.global||{};
  exactText('Porosit & Pyet',g.support_label);
  exactText('☎ Porosit & Pyet','☎ '+(g.support_label||'Porosit & Pyet'));
  exactText('Libra me vlerë · porosi e thjeshtë · mbështetje njerëzore',g.footer_tagline);
  exactText('PayPal dhe Cash on Delivery.',g.footer_payment);
  exactText('KS 3 € · AL 6 € · MK 6 €',g.footer_shipping);
}
function home(){
  const x=CFG.home||{};
  setText('#trending .section-head h2',x.trending_title);
  setText('#new-arrivals .section-head h2',x.new_title);
  const cat=document.querySelector('[data-home-category-cards]')?.closest('.section');if(cat)cat.querySelector('h2')&&(cat.querySelector('h2').textContent=x.categories_title||cat.querySelector('h2').textContent);
  setText('#oferta .section-head h2',x.offers_title);
  setText('#bestsellers .section-head h2',x.bestsellers_title);
  setText('#all-books .section-head h2',x.all_books_title);
}
function shop(){
  const x=CFG.shop||{};
  exactText('Libra fizikë për bibliotekën tënde.',x.title);
  exactText('Shfleto katalogun',x.subtitle);
  exactText('Të gjithë librat fizikë',x.all_title);
}
function product(){
  const x=CFG.product||{};
  exactText('Përshkrimi',x.description_tab);
  exactText('Detaje',x.details_tab);
  exactText('Produkte të ngjashme',x.related_tab);
  exactText('Përshkrimi i librit',x.description_title);
  exactText('Detajet e librit',x.details_title);
  exactText('Recensionet',x.reviews_title);
  exactText('Blerësit shikojnë edhe',x.related_title);
  exactText('Ke parë së fundmi',x.recent_title);
}
function checkout(){
  const x=CFG.checkout||{};
  exactText('Shporta & Checkout',x.title);
  exactText('Shporta',x.cart_title);
  exactText('Përmbledhje',x.summary_title);
  exactText('Të dhënat e porosisë',x.order_data_title);
  exactText('Kupon',x.coupon_label);
  exactText('Gift Card / Voucher',x.gift_card_label);
  exactText('Paketim dhurate',x.gift_wrap_label);
  exactText('Mënyra e pagesës',x.payment_title);
  exactText('Porosit me Cash on Delivery',x.cod_button);
  exactText('Totali i porosisë',x.total_title);
}
function ebooks(){
  const x=CFG.ebooks||{};
  exactText('eBook në shqip, me qasje të sigurt.',x.title);
  exactText('Bibliotekë digjitale për lexim të menjëhershëm',x.subtitle);
  exactText('eBook në shqip',x.all_title);
  const lang=document.querySelector('.ebook-language-section,.ebook-languages,[data-ebook-languages]');if(lang)lang.style.display=CFG.features?.ebooks_languages===false?'none':'';
}
function about(){
  const x=CFG.about||{};
  exactText('Rreth ZemZem',x.title);exactText('Libra të zgjedhur, blerje e thjeshtë',x.hero);exactText('Çfarë synojmë',x.mission);exactText('Gati të fillojmë?',x.cta);
}
function contact(){
  const x=CFG.contact||{};
  exactText('Kontakt & Ndihmë',x.title);exactText('Si mund të të ndihmojmë?',x.hero);exactText('Ke pyetje për një libër?',x.question);exactText('Para se të porosisësh',x.before_order);exactText('Gati të fillojmë?',x.cta);
}
function apply(){
  if(!CFG||applying)return;applying=true;
  try{
    globalText();style();
    const p=path();
    if(p==='index.html'||p==='')home();
    else if(p==='shop.html')shop();
    else if(p==='product.html')product();
    else if(p==='checkout.html')checkout();
    else if(p==='ebooks.html'||p==='ebook.html')ebooks();
    else if(p==='about.html')about();
    else if(p==='contact.html')contact();
  }finally{applying=false}
}
async function load(){
  try{
    const r=await fetch(SB_URL+'/rest/v1/site_content?key=eq.site_manager_v1&select=content&limit=1',{headers:{apikey:SB_KEY,Accept:'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const rows=await r.json();CFG=rows?.[0]?.content||{};window.ZemZemSiteManager=CFG;apply();
    // Performance guard: do not observe the entire document permanently.
    // A permanent subtree observer caused self-triggering DOM loops on catalog pages.
    [120,500,1400].forEach(ms=>setTimeout(apply,ms));
    window.dispatchEvent(new CustomEvent('zemzem:site-manager-ready',{detail:CFG}));
  }catch(e){console.warn('ZemZem Site Manager',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();