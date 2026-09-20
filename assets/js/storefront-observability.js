(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const sid=()=>{let x=sessionStorage.getItem('zemzem_obs_session');if(!x){x=crypto.randomUUID();sessionStorage.setItem('zemzem_obs_session',x)}return x};
function post(name,body){fetch(SB+'/functions/v1/'+name,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{})}
function logError(message,context={}){post('client-error',{source:'storefront',severity:'error',message:String(message||'Gabim i panjohur').slice(0,1000),context,session_id:sid(),url:location.href})}
window.addEventListener('error',e=>{if(!e?.message)return;logError(e.message,{file:e.filename||'',line:e.lineno||0,col:e.colno||0})});
window.addEventListener('unhandledrejection',e=>{const r=e.reason;logError(r?.message||String(r||'Unhandled promise rejection'),{type:'unhandledrejection'})});
function sendSearch(term,results){const consent=localStorage.getItem('zemzem_analytics_consent')==='granted';if(!consent)return;post('storefront-event',{event_name:'search',session_id:sid(),page_path:location.pathname,channel:'site',value:0,item_count:0,term:String(term||'').trim().slice(0,120),results:Number(results||0),consent:true})}
let timer;
document.addEventListener('input',e=>{const el=e.target;if(!(el instanceof HTMLInputElement))return;if(!['homeSearch','shopSearch','searchInput','adminGlobalSearch'].includes(el.id)&&!el.matches('[data-search]'))return;clearTimeout(timer);timer=setTimeout(()=>{const term=el.value.trim();if(term.length<2)return;let results=0;try{results=document.querySelectorAll('.book-card:not([hidden]),.product-card:not([hidden]),[data-search-result]').length}catch{}sendSearch(term,results)},900)});
window.ZemZemObservability={logError,sendSearch};
})();