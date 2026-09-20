(()=>{
'use strict';
const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co',SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
let deferred=null;
function sid(){let s=localStorage.getItem('zemzem_runtime_session');if(!s){s=crypto.randomUUID();localStorage.setItem('zemzem_runtime_session',s)}return s}
function telemetry(event_type){try{fetch(SB_URL+'/functions/v1/storefront-telemetry',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({kind:'pwa',event_type,platform:navigator.userAgentData?.platform||navigator.platform||'',session_id:sid()}),keepalive:true})}catch{}}
function addInstallButton(){
 if(document.getElementById('zzPwaInstall'))return;
 const b=document.createElement('button');b.id='zzPwaInstall';b.type='button';b.textContent='⬇ Instalo ZemZem';
 Object.assign(b.style,{position:'fixed',right:'18px',bottom:'88px',zIndex:'90',border:'0',borderRadius:'999px',padding:'12px 16px',fontWeight:'800',boxShadow:'0 10px 28px rgba(0,0,0,.18)',background:'#233a4a',color:'#fff',cursor:'pointer',display:'none'});
 b.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;b.style.display='none'};
 document.body.appendChild(b);window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;b.style.display='block';telemetry('install_prompt')});window.addEventListener('appinstalled',()=>telemetry('installed'));
}
async function boot(){
 try{
  const r=await fetch(SB_URL+'/rest/v1/site_content?key=eq.pwa&select=content&limit=1',{headers:{apikey:SB_KEY},cache:'no-store'});
  const rows=r.ok?await r.json():[],c=rows?.[0]?.content||{};
  if(c.enabled===false)return;
  const icons=(c.icon_192&&c.icon_512)?[{src:c.icon_192,sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:c.icon_512,sizes:'512x512',type:'image/png',purpose:'any maskable'}]:[{src:'/assets/brand/zemzem-logo.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}];
  const manifest={name:c.app_name||'ZemZem',short_name:c.short_name||'ZemZem',description:c.description||'Libra fizikë dhe eBook nga ZemZem.',start_url:'/',scope:'/',display:'standalone',background_color:c.background_color||'#ffffff',theme_color:c.theme_color||'#233a4a',icons};
  const blob=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));let link=document.querySelector('link[rel="manifest"]');if(!link){link=document.createElement('link');link.rel='manifest';document.head.appendChild(link)}link.href=blob;
  let theme=document.querySelector('meta[name="theme-color"]');if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.appendChild(theme)}theme.content=manifest.theme_color;
  if('serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js').catch(()=>{});
  if(window.matchMedia?.('(display-mode: standalone)').matches)telemetry('opened_standalone');
  if(c.install_prompt_enabled!==false)addInstallButton();
 }catch{}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();