(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co';
const KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const q=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cover=p=>p?SB+'/storage/v1/object/public/free-library-covers/'+String(p).split('/').map(encodeURIComponent).join('/'):'';

async function loadFreeLibrary(){
  const host=q('#homeFreeLibraryGrid');
  if(!host)return;
  try{
    const r=await fetch(SB+'/rest/v1/free_library_books?status=eq.approved&select=id,title,author_name,category,language,cover_path,downloads,created_at,featured,sort_order&order=featured.desc,sort_order.asc,approved_at.desc.nullslast,created_at.desc&limit=4',{headers:{apikey:KEY},cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const rows=await r.json();
    if(!Array.isArray(rows)||!rows.length){
      host.innerHTML='<div class="zz-home-free-empty">Biblioteka falas është gati. Librat e aprovuar do të shfaqen këtu automatikisht.</div>';
      return;
    }
    host.innerHTML=rows.map(b=>'<a class="zz-home-free-card" href="free-library.html"><div class="zz-home-free-cover">'+
      (b.cover_path?'<img loading="lazy" decoding="async" src="'+esc(cover(b.cover_path))+'" alt="'+esc(b.title)+'">':'<div class="zz-home-free-placeholder">PDF<br>'+esc(b.title)+'</div>')+
      '</div><div class="zz-home-free-body"><span class="zz-home-free-cat">'+esc(b.category||'Biblioteka Falas')+'</span><h3>'+esc(b.title)+'</h3><span class="zz-home-free-author">'+esc(b.author_name||'Autor i pacaktuar')+'</span><span class="zz-home-free-meta">⬇ '+Number(b.downloads||0)+' · '+esc(String(b.language||'sq').toUpperCase())+'</span></div></a>').join('');
  }catch(e){
    host.innerHTML='<div class="zz-home-free-empty">Biblioteka Falas është përkohësisht duke u ngarkuar. <a href="free-library.html">Hape bibliotekën →</a></div>';
  }
}

function bindNewsletterStatus(){
  const form=q('#homeNewsletterForm'),status=q('#homeNewsletterStatus');
  if(!form||!status)return;
  const observer=new MutationObserver(()=>{if(status.textContent.trim())status.setAttribute('role','status')});
  observer.observe(status,{childList:true,subtree:true,characterData:true});
}

function run(){loadFreeLibrary();bindNewsletterStatus()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();