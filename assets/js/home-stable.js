(()=>{'use strict';
if(window.__zzHomeStableSingleV1)return;window.__zzHomeStableSingleV1=1;
const q=(s,r=document)=>r.querySelector(s);
function addFreeLibrary(){
  const nav=q('[data-home-nav]');
  if(nav&&!nav.querySelector('a[href="free-library.html"]')){
    const a=document.createElement('a');a.href='free-library.html';a.textContent='Biblioteka Falas';
    const ebook=[...nav.querySelectorAll('a')].find(x=>/ebook/i.test(x.textContent||''));
    if(ebook)ebook.insertAdjacentElement('afterend',a);else nav.appendChild(a);
  }
  const cats=q('[data-home-categories]');
  if(cats&&!cats.querySelector('a[href="free-library.html"]')){
    const a=document.createElement('a');a.className='category-item category-item-ebook';a.href='free-library.html';
    a.innerHTML='<span class="category-icon">📚</span><span class="category-copy"><strong>Biblioteka Falas</strong><small>PDF falas të aprovuar</small></span><span class="category-arrow">›</span>';
    const ebook=[...cats.querySelectorAll('a')].find(x=>/ebook/i.test(x.textContent||''));
    if(ebook)ebook.insertAdjacentElement('afterend',a);else cats.appendChild(a);
  }
}
function addFreeLibraryCard(){
  const cards=q('[data-home-category-cards]');
  if(!cards)return;
  if(!cards.querySelector('a[href="free-library.html"]')){
    const a=document.createElement('a');
    a.className='cat-card home-category-card category-card-free-library';
    a.href='free-library.html';
    a.innerHTML='<div class="cat-icon">📚</div><strong>Biblioteka Falas</strong>';
    cards.appendChild(a);
  }
}
function bindBookCards(){
  document.addEventListener('click',e=>{
    const card=e.target.closest?.('.book-card[data-book-id]');if(!card)return;
    if(e.target.closest('button,input,select,textarea,[data-wishlist-id],.add-btn'))return;
    const id=String(card.dataset.bookId||'');if(!id)return;
    const link=e.target.closest('a');
    if(link&&/product\.html\?id=/.test(link.getAttribute('href')||'')){link.href='product.html?id='+encodeURIComponent(id);return}
    if(e.target.closest('.book-card-cover-link,.book-meta,h3'))location.href='product.html?id='+encodeURIComponent(id);
  },true);
}
function boot(){
  const keep=()=>{addFreeLibrary();addFreeLibraryCard()};
  keep();bindBookCards();document.documentElement.dataset.zzHomeStable='1';
  if(!window.zzFreeLibraryGlobalObserver){
    let queued=false;
    window.zzFreeLibraryGlobalObserver=new MutationObserver(()=>{
      if(queued)return;queued=true;
      requestAnimationFrame(()=>{queued=false;keep()});
    });
    window.zzFreeLibraryGlobalObserver.observe(document.body||document.documentElement,{childList:true,subtree:true});
  }
  [150,300,600,1000,1500,2500,4000,7000].forEach(ms=>setTimeout(keep,ms));
  window.addEventListener('pageshow',keep);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)keep()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();