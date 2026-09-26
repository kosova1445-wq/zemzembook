(()=>{
'use strict';
if(window.__zzAdminLazyLoader)return;window.__zzAdminLazyLoader=1;
const placeholders=[...document.querySelectorAll('script[type="application/x-zemzem-lazy"][data-src]')];
let started=false;
const PRELOAD_AHEAD=5;

function warm(index){
  for(let i=index;i<Math.min(placeholders.length,index+PRELOAD_AHEAD);i++){
    const ph=placeholders[i];
    if(!ph?.dataset?.src||ph.dataset.warmed==='1')continue;
    ph.dataset.warmed='1';
    const l=document.createElement('link');
    l.rel='preload';
    l.as='script';
    l.href=ph.dataset.src;
    l.dataset.zzAdminWarm='1';
    document.head.appendChild(l);
  }
}

async function loadAll(){
  if(started)return;started=true;
  warm(0);
  for(let i=0;i<placeholders.length;i++){
    const ph=placeholders[i];
    warm(i+1);
    await new Promise(resolve=>{
      const s=document.createElement('script');
      s.src=ph.dataset.src;
      for(const a of ph.attributes){
        if(a.name==='type'||a.name==='data-src'||a.name==='data-warmed')continue;
        s.setAttribute(a.name,a.value);
      }
      s.onload=resolve;
      s.onerror=()=>{console.warn('Admin lazy module failed:',s.src);resolve()};
      ph.replaceWith(s);
    });
    if(i>0&&i%8===0){
      await new Promise(resolve=>{
        if('requestIdleCallback' in window)requestIdleCallback(()=>resolve(),{timeout:120});
        else setTimeout(resolve,0);
      });
    }
  }
  document.querySelectorAll('link[data-zz-admin-warm]').forEach(x=>x.remove());
  window.dispatchEvent(new CustomEvent('zemzem:admin-lazy-ready'));
}

function scheduleAuthenticatedLoad(){
  if('requestIdleCallback' in window)requestIdleCallback(loadAll,{timeout:1200});
  else setTimeout(loadAll,250);
}
window.addEventListener('zemzem:admin-authenticated',scheduleAuthenticatedLoad,{once:true});
})();