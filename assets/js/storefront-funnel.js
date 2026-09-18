/* ZemZem consent-aware storefront funnel v1 */
(()=>{
  'use strict';
  const URL='https://ysvtrhizgcioyycwlkrk.supabase.co/functions/v1/storefront-event';
  const KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',CONSENT='zemzem_analytics_consent',SID='zemzem_funnel_session';
  const consent=()=>localStorage.getItem(CONSENT)==='granted';
  const sessionId=()=>{let id=localStorage.getItem(SID)||'';if(!/^[0-9a-f-]{36}$/i.test(id)){id=crypto.randomUUID();localStorage.setItem(SID,id)}return id};
  const channel=()=>/ebook/i.test(location.pathname)?'ebook':/shop|product|checkout|paypal-return/i.test(location.pathname)?'physical':'site';
  function send(event_name,{value=0,item_count=0}={}){if(!consent())return;const dedupe=`zz_funnel_${event_name}_${location.pathname}_${channel()}`;if(['page_view','view_item','begin_checkout'].includes(event_name)&&sessionStorage.getItem(dedupe))return;try{sessionStorage.setItem(dedupe,'1')}catch{}fetch(URL,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({event_name,session_id:sessionId(),page_path:location.pathname,channel:channel(),value:Number(value)||0,item_count:Number(item_count)||0,consent:true}),keepalive:true}).catch(()=>{})}
  function cartSnapshot(){try{const rows=window.ZemZemStore?.cartDetails?.()||[];return{value:rows.reduce((n,x)=>n+Number(x.book?.price||0)*Number(x.qty||0),0),item_count:rows.reduce((n,x)=>n+Number(x.qty||0),0)}}catch{return{}}}
  function bind(){send('page_view');if(/\/product\.html$/i.test(location.pathname))send('view_item');if(/\/(checkout|ebook-checkout)\.html$/i.test(location.pathname)){let tries=0;const t=setInterval(()=>{const s=cartSnapshot();if(s.item_count||++tries>12){clearInterval(t);send('begin_checkout',s)}},250)}if(typeof window.addToCart==='function'&&!window.addToCart.__zzFunnel){const original=window.addToCart;const wrapped=function(){const result=original.apply(this,arguments);setTimeout(()=>send('add_to_cart',cartSnapshot()),0);return result};wrapped.__zzFunnel=true;window.addToCart=wrapped}}
  document.addEventListener('click',e=>{if(e.target?.getAttribute?.('data-consent')==='granted')setTimeout(bind,50)});
  window.addEventListener('zemzem:catalog-ready',bind);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,0));else setTimeout(bind,0);
})();
