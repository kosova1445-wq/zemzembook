(()=>{
'use strict';
const KEY='zemzem_affiliate_ref',SESSION='zemzem_affiliate_session',DAYS=30;
const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co',SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
function sess(){let s=localStorage.getItem(SESSION);if(!s){s=crypto.randomUUID();localStorage.setItem(SESSION,s)}return s}
function get(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(!x||!x.code||Date.now()>x.expires){localStorage.removeItem(KEY);return null}return x}catch{return null}}
function set(code){const x={code:String(code||'').trim().toUpperCase(),expires:Date.now()+DAYS*864e5};localStorage.setItem(KEY,JSON.stringify(x));window.ZemZemAffiliate=x;return x}
async function track(code){try{await fetch(SB_URL+'/functions/v1/affiliate-track',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({code,event_type:'click',session_token:sess()}),cache:'no-store'})}catch{}}
const p=new URLSearchParams(location.search),ref=p.get('ref');
if(ref&&/^[A-Z0-9_-]{2,40}$/i.test(ref)){const x=set(ref);track(x.code)}
else window.ZemZemAffiliate=get();
window.ZemZemGetAffiliateCode=()=>get()?.code||'';
})();