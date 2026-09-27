(()=>{
  'use strict';
  let deferredPrompt=null,btn=null;
  const ensureBtn=()=>{
    if(btn||!deferredPrompt)return;
    btn=document.createElement('button');
    btn.type='button';
    btn.className='zz-pwa-install';
    btn.setAttribute('aria-label','Instalo ZemZem');
    btn.textContent='⬇ Instalo ZemZem';
    btn.style.cssText='position:fixed;right:14px;bottom:86px;z-index:9988;border:0;border-radius:999px;padding:10px 14px;background:#233a4a;color:#fff;font:800 11px/1.2 system-ui,sans-serif;box-shadow:0 10px 28px rgba(35,58,74,.22);cursor:pointer';
    btn.onclick=async()=>{if(!deferredPrompt)return;btn.disabled=true;deferredPrompt.prompt();try{await deferredPrompt.userChoice}catch{}deferredPrompt=null;btn.remove();btn=null};
    document.body.appendChild(btn);
  };
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(()=>{}),{once:true});
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;ensureBtn()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;if(btn){btn.remove();btn=null}});
})();