(function(){
  'use strict';

  if(!document.querySelector('script[src*="site-content.js"]')){
    const siteContent=document.createElement('script');
    siteContent.src='assets/js/site-content.js?v=1';
    siteContent.async=true;
    document.head.appendChild(siteContent);
  }

  const MEASUREMENT_ID='G-9TPM62WY0G';
  const CONSENT_KEY='zemzem_analytics_consent';
  const PURCHASE_KEY='zemzem_ga4_purchases';
  const PENDING_PREFIX='zemzem_ga4_checkout_';
  const BEGIN_PREFIX='zemzem_ga4_begin_';

  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};

  const savedConsent=localStorage.getItem(CONSENT_KEY);
  window.gtag('consent','default',{
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    analytics_storage:savedConsent==='granted'?'granted':'denied',
    functionality_storage:'granted',
    security_storage:'granted',
    wait_for_update:500
  });

  const cleanLocation=()=>{
    try{
      const u=new URL(location.href);
      ['token','PayerID','paymentId','payment_id','paypal_order_id'].forEach(k=>u.searchParams.delete(k));
      return u.toString();
    }catch{return location.origin+location.pathname}
  };

  const loader=document.createElement('script');
  loader.async=true;
  loader.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(loader);
  window.gtag('js',new Date());
  window.gtag('config',MEASUREMENT_ID,{
    page_location:cleanLocation(),
    allow_google_signals:false,
    allow_ad_personalization_signals:false
  });

  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const text=v=>String(v??'').trim();
  const currency=v=>text(v)||'EUR';

  function event(name,params={}){
    try{window.gtag('event',name,params)}catch(e){console.warn('GA4 event skipped',name,e)}
  }

  function physicalItem(book,qty=1){
    if(!book)return null;
    return{
      item_id:text(book.id||book.sku),
      item_name:text(book.title)||'Libër',
      item_brand:text(book.author)||'ZemZem',
      item_category:text(book.cat)||'Libra fizikë',
      item_variant:'physical',
      price:num(book.price),
      quantity:Math.max(1,num(qty)||1)
    };
  }

  function ebookItem(book,qty=1){
    if(!book)return null;
    return{
      item_id:text(book.id),
      item_name:text(book.title)||'eBook',
      item_brand:text(book.author_name)||'ZemZem',
      item_category:text(book.category_name)||'eBook',
      item_variant:'ebook',
      price:num(book.price),
      quantity:Math.max(1,num(qty)||1)
    };
  }

  function physicalCartSnapshot(){
    try{
      const z=window.ZemZemStore;
      if(!z?.cartDetails)return null;
      const rows=z.cartDetails();
      const items=rows.map(x=>physicalItem(x.book,x.qty)).filter(Boolean);
      if(!items.length)return null;
      return{currency:'EUR',value:items.reduce((s,x)=>s+num(x.price)*num(x.quantity),0),items};
    }catch{return null}
  }

  function ebookDomSnapshot(){
    try{
      const rows=[...document.querySelectorAll('.ebook-cart-row')];
      if(!rows.length)return null;
      const items=rows.map(row=>{
        const id=row.querySelector('[data-remove-ebook]')?.getAttribute('data-remove-ebook')||'';
        const name=row.querySelector('.ebook-cart-title')?.textContent||'eBook';
        const author=(row.querySelector('.ebook-cart-meta')?.textContent||'').split('·')[0].trim()||'ZemZem';
        const priceText=row.querySelector('.ebook-cart-price')?.textContent||'0';
        const price=num(String(priceText).replace(',','.').replace(/[^0-9.]/g,''));
        return{item_id:text(id),item_name:text(name),item_brand:text(author),item_category:'eBook',item_variant:'ebook',price,quantity:1};
      }).filter(x=>x.item_id||x.item_name);
      if(!items.length)return null;
      return{currency:'EUR',value:items.reduce((s,x)=>s+num(x.price),0),items};
    }catch{return null}
  }

  function ebookCatalogSnapshot(){
    try{
      const api=window.ZemZemEbooks;
      if(!api?.books)return null;
      const ids=JSON.parse(localStorage.getItem('zemzem_ebook_cart')||'[]');
      const map=new Map(api.books.map(b=>[String(b.id),b]));
      const items=(Array.isArray(ids)?ids:[]).map(id=>ebookItem(map.get(String(id)),1)).filter(Boolean);
      if(!items.length)return null;
      return{currency:'EUR',value:items.reduce((s,x)=>s+num(x.price),0),items};
    }catch{return null}
  }

  function currentSnapshot(kind){
    return kind==='ebook'?(ebookCatalogSnapshot()||ebookDomSnapshot()):physicalCartSnapshot();
  }

  function rememberCheckout(kind,snapshot){
    if(!snapshot?.items?.length)return;
    try{localStorage.setItem(PENDING_PREFIX+kind,JSON.stringify(snapshot))}catch{}
  }

  function readCheckout(kind){
    try{return JSON.parse(localStorage.getItem(PENDING_PREFIX+kind)||'null')}catch{return null}
  }

  function beginCheckout(kind,snapshot=currentSnapshot(kind)){
    if(!snapshot?.items?.length)return;
    const signature=snapshot.items.map(x=>`${x.item_id}:${x.quantity}`).join('|');
    const key=BEGIN_PREFIX+kind+':'+signature;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch{}
    rememberCheckout(kind,snapshot);
    event('begin_checkout',snapshot);
  }

  function purchase(kind,order={}){
    const transactionId=text(order.order_number||order.transaction_id||order.id);
    if(!transactionId)return;
    let done=[];
    try{done=JSON.parse(localStorage.getItem(PURCHASE_KEY)||'[]');if(!Array.isArray(done))done=[]}catch{done=[]}
    if(done.includes(transactionId))return;
    const snap=readCheckout(kind)||currentSnapshot(kind)||{currency:'EUR',value:0,items:[]};
    const payload={
      transaction_id:transactionId,
      currency:currency(order.currency||snap.currency),
      value:num(order.total??snap.value),
      items:Array.isArray(snap.items)?snap.items:[]
    };
    const shipping=num(order.shipping_amount??snap.shipping);
    const discount=num(order.coupon_discount??order.payment_discount??snap.discount);
    const coupon=text(order.coupon_code||snap.coupon);
    if(shipping)payload.shipping=shipping;
    if(discount)payload.discount=discount;
    if(coupon)payload.coupon=coupon;
    event('purchase',payload);
    try{
      done.push(transactionId);
      localStorage.setItem(PURCHASE_KEY,JSON.stringify(done.slice(-50)));
      localStorage.removeItem(PENDING_PREFIX+kind);
    }catch{}
  }

  function trackPhysicalView(){
    if(!/\/product\.html$/i.test(location.pathname))return;
    const id=new URLSearchParams(location.search).get('id');
    const book=window.getBook?.(id)||window.ZemZemStore?.getBook?.(id);
    const item=physicalItem(book,1);
    if(item)event('view_item',{currency:'EUR',value:num(item.price),items:[item]});
  }

  function trackEbookView(){
    if(!/\/ebook\.html$/i.test(location.pathname))return;
    const id=new URLSearchParams(location.search).get('id');
    const book=window.ZemZemEbooks?.books?.find?.(b=>String(b.id)===String(id));
    const item=ebookItem(book,1);
    if(item)event('view_item',{currency:'EUR',value:num(item.price),items:[item]});
  }

  function wrapPhysical(){
    if(typeof window.addToCart==='function'&&!window.addToCart.__zzAnalytics){
      const original=window.addToCart;
      const wrapped=function(id,qty=1){
        const book=window.getBook?.(id)||window.ZemZemStore?.getBook?.(id);
        const result=original.apply(this,arguments);
        const item=physicalItem(book,qty);
        if(item)event('add_to_cart',{currency:'EUR',value:num(item.price)*num(item.quantity),items:[item]});
        return result;
      };
      wrapped.__zzAnalytics=true;
      window.addToCart=wrapped;
    }
    if(typeof window.removeItem==='function'&&!window.removeItem.__zzAnalytics){
      const original=window.removeItem;
      const wrapped=function(id){
        let row=null;
        try{row=window.ZemZemStore?.cartDetails?.().find(x=>String(x.book?.id)===String(id))}catch{}
        const result=original.apply(this,arguments);
        const item=physicalItem(row?.book,row?.qty||1);
        if(item)event('remove_from_cart',{currency:'EUR',value:num(item.price)*num(item.quantity),items:[item]});
        return result;
      };
      wrapped.__zzAnalytics=true;
      window.removeItem=wrapped;
    }
    trackPhysicalView();
    if(/\/checkout\.html$/i.test(location.pathname))setTimeout(()=>beginCheckout('physical'),250);
  }

  function wrapEbooks(){
    if(typeof window.addEbookToCart==='function'&&!window.addEbookToCart.__zzAnalytics){
      const original=window.addEbookToCart;
      const wrapped=function(id){
        const book=window.ZemZemEbooks?.books?.find?.(b=>String(b.id)===String(id));
        const owned=window.ZemZemEbooks?.owned?.has?.(String(id));
        const result=original.apply(this,arguments);
        if(!owned){const item=ebookItem(book,1);if(item)event('add_to_cart',{currency:'EUR',value:num(item.price),items:[item]})}
        return result;
      };
      wrapped.__zzAnalytics=true;
      window.addEbookToCart=wrapped;
    }
    if(typeof window.removeEbookFromCart==='function'&&!window.removeEbookFromCart.__zzAnalytics){
      const original=window.removeEbookFromCart;
      const wrapped=function(id){
        const book=window.ZemZemEbooks?.books?.find?.(b=>String(b.id)===String(id));
        const result=original.apply(this,arguments);
        const item=ebookItem(book,1);
        if(item)event('remove_from_cart',{currency:'EUR',value:num(item.price),items:[item]});
        return result;
      };
      wrapped.__zzAnalytics=true;
      window.removeEbookFromCart=wrapped;
    }
    trackEbookView();
  }

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const response=await nativeFetch(input,init);
    try{
      const url=typeof input==='string'?input:(input?.url||'');
      if(response.ok&&/\/functions\/v1\/(paypal-create|ebook-paypal-create)$/.test(url)){
        const kind=url.includes('ebook-paypal-create')?'ebook':'physical';
        rememberCheckout(kind,currentSnapshot(kind));
      }
      if(response.ok&&/\/functions\/v1\/(create-order|paypal-capture|ebook-paypal-capture)$/.test(url)){
        response.clone().json().then(data=>{
          if(data?.ok===false)return;
          const kind=url.includes('ebook-paypal-capture')?'ebook':'physical';
          if(url.includes('create-order')||url.includes('paypal-capture'))purchase(kind,data?.order||{});
        }).catch(()=>{});
      }
    }catch{}
    return response;
  };

  function showConsent(){
    if(savedConsent)return;
    const wrap=document.createElement('div');
    wrap.id='zemzemAnalyticsConsent';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-live','polite');
    wrap.style.cssText='position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;max-width:760px;margin:auto;background:#fff;color:#233a4a;border:1px solid #d9e0e5;border-radius:16px;box-shadow:0 16px 48px rgba(20,35,45,.18);padding:16px;font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    wrap.innerHTML='<div style="display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap"><div style="flex:1 1 420px"><strong style="font-size:15px">Privatësia dhe statistikat</strong><div style="margin-top:5px">Përdorim Google Analytics për të kuptuar përdorimin e ZemZem.al dhe për ta përmirësuar dyqanin. Nuk dërgojmë emër, email apo të dhëna pagese te Google. <a href="privacy.html" style="color:#1f5f7a">Privatësia</a></div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-consent="denied" style="border:1px solid #b9c5cc;background:#fff;color:#233a4a;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer">Vetëm të nevojshmet</button><button type="button" data-consent="granted" style="border:0;background:#233a4a;color:#fff;border-radius:10px;padding:9px 12px;font-weight:800;cursor:pointer">Prano analitikën</button></div></div>';
    wrap.addEventListener('click',e=>{
      const choice=e.target?.getAttribute?.('data-consent');
      if(!choice)return;
      localStorage.setItem(CONSENT_KEY,choice);
      window.gtag('consent','update',{analytics_storage:choice==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      wrap.remove();
    });
    document.body.appendChild(wrap);
  }

  window.addEventListener('zemzem:catalog-ready',wrapPhysical);
  window.addEventListener('zemzem:ebooks-ready',wrapEbooks);
  document.addEventListener('DOMContentLoaded',()=>{
    showConsent();
    setTimeout(()=>{
      wrapPhysical();
      wrapEbooks();
      if(/\/ebook-checkout\.html$/i.test(location.pathname)){
        let tries=0;
        const t=setInterval(()=>{
          tries++;
          const snap=ebookDomSnapshot();
          if(snap||tries>=12){clearInterval(t);if(snap)beginCheckout('ebook',snap)}
        },250);
      }
    },0);
  });

  window.ZemZemAnalytics={
    measurementId:MEASUREMENT_ID,
    event,
    beginCheckout,
    rememberCheckout,
    purchase,
    physicalItem,
    ebookItem
  };
})();
