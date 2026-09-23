(()=>{'use strict';
if(window.__zzUnifiedPriceTicketV1)return;window.__zzUnifiedPriceTicketV1=1;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>Number(n||0).toFixed(2);
function idFromCard(card){
  if(card?.dataset?.bookId)return String(card.dataset.bookId);
  const a=card?.querySelector?.('a[href*="product.html?id="]');
  if(!a)return'';
  try{return new URL(a.href,location.href).searchParams.get('id')||''}catch{return''}
}
function ticket(b){
  const old=b?.old??b?.compare_at_price??null,price=Number(b?.price||0),discount=old!=null&&Number(old)>price;
  return '<div class="zz-ticket-wrap" data-unified-price-ticket="1"><div class="zz-ticket-price '+(discount?'has-discount':'regular')+'"><div class="zz-ticket-top">'+(discount?'<span class="zz-ticket-old">'+money(old)+' €</span>':'<span class="zz-ticket-old-label">ÇMIMI</span>')+'<span class="zz-ticket-bars" aria-hidden="true"></span></div><div class="zz-ticket-main"><span class="zz-ticket-current">'+money(price)+'</span><span class="zz-ticket-currency">€</span></div><div class="zz-ticket-ribbon">'+(discount?'OFERTË':'ÇMIM I MIRË')+'</div></div></div>';
}
function apply(){
  const store=window.ZemZemStore,books=store?.getBooks?.()||[];
  const byId=new Map(books.map(b=>[String(b.id),b]));
  document.querySelectorAll('.book-card,.shop-book-card').forEach(card=>{
    const id=idFromCard(card),b=byId.get(String(id));if(!b)return;
    card.dataset.bookId=id;
    const meta=card.querySelector('.book-meta,.shop-card-meta');if(!meta)return;
    let wrap=meta.querySelector('.zz-ticket-wrap');
    if(!wrap){
      const action=meta.querySelector('.price-row,.shop-card-actions,.add-btn');
      if(action)action.insertAdjacentHTML('beforebegin',ticket(b));else meta.insertAdjacentHTML('beforeend',ticket(b));
    }else if(!wrap.dataset.unifiedPriceTicket){
      wrap.outerHTML=ticket(b);
    }
    meta.querySelectorAll('.price:not(.zz-ticket-current),.book-price:not(.zz-ticket-current),.old:not(.zz-ticket-old)').forEach(x=>x.remove());
  });
}
const run=()=>{apply();setTimeout(apply,250);setTimeout(apply,900);setTimeout(apply,1800)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('zemzem:catalog-ready',run);
})();