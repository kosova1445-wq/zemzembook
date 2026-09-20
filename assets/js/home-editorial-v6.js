(()=>{const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function forceEditorialCss(){
  let old=q('link[data-home-editorial-v6]');
  if(old) old.remove();
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href='assets/css/home-editorial-v6.css?v=2';
  l.dataset.homeEditorialV6='1';
  document.head.appendChild(l);
}
function enhanceHeader(){
  document.body.classList.add('zemzem-editorial-v6');
  const row=q('.header-row');
  if(row&&!q('.ze-header-motto',row)){
    const m=document.createElement('div');
    m.className='ze-header-motto';
    m.textContent='Libra që ndërtojnë nesër më të mirë';
    row.appendChild(m);
  }
}
function enhanceCategories(){
  const box=q('.category-box-premium');
  if(!box)return;
  if(!q('.ze-all-categories',box)){
    const a=document.createElement('a');
    a.className='ze-all-categories';
    a.href='shop.html';
    a.innerHTML='☷ <span>Shiko të gjitha kategoritë</span> →';
    box.appendChild(a);
  }
}
function enhanceHero(){
  qa('.home-slide').forEach(slide=>{
    const cover=q('.home-slide-cover',slide);
    if(cover&&!q('.ze-hero-quote',cover)){
      const quote=document.createElement('div');
      quote.className='ze-hero-quote';
      quote.textContent='Dija është dritë në çdo kohë.';
      cover.appendChild(quote);
    }
  });
}
function applyAll(){forceEditorialCss();enhanceHeader();enhanceCategories();enhanceHero()}
function run(){
  applyAll();
  setTimeout(applyAll,350);
  setTimeout(applyAll,900);
  setTimeout(applyAll,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('load',()=>setTimeout(applyAll,120));
window.addEventListener('zemzem:catalog-ready',()=>setTimeout(applyAll,250));
})();