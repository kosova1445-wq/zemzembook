(()=>{
'use strict';
if(window.__zzAdminLazyLoader)return;window.__zzAdminLazyLoader=1;
const placeholders=[...document.querySelectorAll('script[type="application/x-zemzem-lazy"][data-src]')];
let started=false;
async function loadAll(){
  if(started)return; started=true;
  for(const ph of placeholders){
    await new Promise(resolve=>{
      const s=document.createElement('script');
      s.src=ph.dataset.src;
      for(const a of ph.attributes){
        if(a.name==='type'||a.name==='data-src')continue;
        s.setAttribute(a.name,a.value);
      }
      s.onload=resolve;
      s.onerror=()=>{console.warn('Admin lazy module failed:',s.src);resolve()};
      ph.replaceWith(s);
    });
  }
  window.dispatchEvent(new CustomEvent('zemzem:admin-lazy-ready'));
}
function schedule(){
  if('requestIdleCallback' in window) requestIdleCallback(loadAll,{timeout:2200});
  else setTimeout(loadAll,900);
}
if(document.readyState==='complete') schedule();
else window.addEventListener('load',schedule,{once:true});
for(const ev of ['pointerdown','keydown','touchstart']) {
  window.addEventListener(ev,loadAll,{once:true,passive:true});
}
})();