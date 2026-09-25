(()=>{
'use strict';
if(window.__zzFreeLibraryVisibility)return;window.__zzFreeLibraryVisibility=1;
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co';
const KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
window.__zzFreeLibraryPublicEnabled=false;
const style=document.createElement('style');
style.id='zzFreeLibraryVisibilityStyle';
style.textContent=`
html:not(.zz-free-library-enabled) #homeFreeLibrary,
html:not(.zz-free-library-enabled) a[href="free-library.html"],
html:not(.zz-free-library-enabled) .category-item-free-library,
html:not(.zz-free-library-enabled) .category-card-free-library{display:none!important}
.zz-free-library-closed{max-width:760px;margin:80px auto;padding:38px 28px;border:1px solid #dfe7e2;border-radius:20px;background:#fff;text-align:center;box-shadow:0 18px 50px rgba(23,61,43,.08)}
.zz-free-library-closed h1{margin:0 0 10px;color:#173d2b}.zz-free-library-closed p{color:#6f7e76;line-height:1.6}.zz-free-library-closed a{display:inline-block;margin-top:12px;padding:10px 16px;border-radius:10px;background:#173d2b;color:#fff;text-decoration:none;font-weight:800}
`;
document.head.appendChild(style);

function cleanup(){
  document.querySelectorAll('[data-home-nav] a[href="free-library.html"],[data-home-categories] a[href="free-library.html"],[data-home-category-cards] a[href="free-library.html"]').forEach(x=>x.remove());
  document.querySelector('#homeFreeLibrary')?.setAttribute('hidden','');
}
function openPublic(){
  document.documentElement.classList.add('zz-free-library-enabled');
  document.documentElement.classList.remove('zz-free-library-disabled');
  document.querySelector('#homeFreeLibrary')?.removeAttribute('hidden');
  window.__zzFreeLibraryPublicEnabled=true;
  window.dispatchEvent(new CustomEvent('zemzem:free-library-visibility',{detail:{enabled:true}}));
}
function closePublic(){
  document.documentElement.classList.remove('zz-free-library-enabled');
  document.documentElement.classList.add('zz-free-library-disabled');
  window.__zzFreeLibraryPublicEnabled=false;
  cleanup();
  if(/\/free-library\.html$/i.test(location.pathname)){
    const main=document.querySelector('main');
    if(main)main.innerHTML='<section class="zz-free-library-closed"><h1>Biblioteka Falas është përkohësisht jo aktive</h1><p>Kjo pjesë e ZemZem nuk është hapur ende për publikun. Mund të rikthehesh te dyqani dhe të vazhdosh me librat e tjerë.</p><a href="index.html">Kthehu në Ballinë</a></section>';
  }
  window.dispatchEvent(new CustomEvent('zemzem:free-library-visibility',{detail:{enabled:false}}));
}
async function load(){
  try{
    const r=await fetch(SB+'/rest/v1/rpc/get_free_library_public_status',{
      method:'POST',
      headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
      body:'{}',cache:'no-store'
    });
    if(!r.ok)throw new Error('STATUS');
    const d=await r.json();
    if(d?.enabled===true)openPublic();else closePublic();
  }catch(e){closePublic()}
}
closePublic();
load();
})();