(()=>{
'use strict';
const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co',SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
function sid(){let s=localStorage.getItem('zemzem_runtime_session');if(!s){s=crypto.randomUUID();localStorage.setItem('zemzem_runtime_session',s)}return s}
async function api(path){const r=await fetch(SB_URL+'/rest/v1/'+path,{headers:{apikey:SB_KEY},cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function postError(message,context={},severity='error',source='storefront'){try{fetch(SB_URL+'/functions/v1/storefront-telemetry',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({kind:'error',message:String(message||'').slice(0,1000),context,severity,source,url:location.href,session_id:sid()}),keepalive:true})}catch{}}
function maintenanceOverlay(c){if(!c?.enabled||new URLSearchParams(location.search).get('preview')==='1'||location.pathname.includes('admin'))return;const d=document.createElement('div');d.id='zzMaintenance';d.innerHTML='<div><div class="zz-maint-logo">ZemZem</div><h1>Mirëmbajtje e shkurtër</h1><p>'+String(c.message||'Dyqani është përkohësisht në mirëmbajtje. Ju lutemi provoni përsëri së shpejti.').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))+'</p></div>';Object.assign(d.style,{position:'fixed',inset:'0',zIndex:'99999',background:'linear-gradient(145deg,#173d2b,#244f3a)',color:'#fff',display:'grid',placeItems:'center',padding:'24px',textAlign:'center'});d.querySelector('div').style.maxWidth='560px';d.querySelector('h1').style.fontSize='36px';d.querySelector('p').style.opacity='.82';d.querySelector('.zz-maint-logo').style.fontWeight='900';d.querySelector('.zz-maint-logo').style.fontSize='22px';document.body.appendChild(d)}
async function boot(){
 try{
  const [m,f]=await Promise.all([api('site_content?key=eq.maintenance&select=content&limit=1'),api('feature_flags?select=key,enabled')]);
  maintenanceOverlay(m?.[0]?.content||{});
  window.ZemZemFeatureFlags=Object.fromEntries((f||[]).map(x=>[x.key,!!x.enabled]));
  document.documentElement.dataset.zzFeatures='ready';
 }catch(e){postError(e.message,{phase:'runtime_boot'},'warn','runtime')}
}
window.addEventListener('error',e=>postError(e.message,{filename:e.filename,line:e.lineno,col:e.colno},'error','window'));
window.addEventListener('unhandledrejection',e=>postError(e.reason?.message||String(e.reason||'Unhandled rejection'),{},'error','promise'));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();