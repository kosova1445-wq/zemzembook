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
function scheduleAuthenticatedLoad(){
  if('requestIdleCallback' in window) requestIdleCallback(loadAll,{timeout:1600});
  else setTimeout(loadAll,350);
}
window.addEventListener('zemzem:admin-authenticated',scheduleAuthenticatedLoad,{once:true});
})();