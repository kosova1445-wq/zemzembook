(()=>{
const nav=document.querySelector('.account-nav');if(!nav)return;
const groupFor=v=>['orders','ebooks','ebook-center','wallet'].includes(v)?'main':['profile','addresses','wishlist'].includes(v)?'profile':'extras';
const titles={main:'KRYESORE',profile:'PROFILI & PREFERENCAT',extras:'SHËRBIME TË TJERA'};
function arrange(){
 const buttons=[...nav.querySelectorAll('button[data-account-view]')];
 nav.querySelectorAll('.account-side-label').forEach(x=>x.remove());
 const groups={};
 ['main','profile','extras'].forEach(k=>{
   let g=nav.querySelector('.account-nav-group[data-group="'+k+'"]');
   if(!g){g=document.createElement('div');g.className='account-nav-group';g.dataset.group=k;const h=document.createElement('div');h.className='account-nav-group-title';h.textContent=titles[k];g.appendChild(h);nav.appendChild(g)}
   groups[k]=g;
 });
 buttons.forEach(b=>{const g=groups[groupFor(b.dataset.accountView||'')];if(b.parentElement!==g)g.appendChild(b)});
 groups.extras.hidden=!groups.extras.querySelector('button[data-account-view]');
}
function sync(){
 const a=document.querySelector('#customerAvatar'),t=document.querySelector('#welcomeTitle'),e=document.querySelector('#customerEmail');
 const ma=document.querySelector('#customerAvatarMini'),mt=document.querySelector('#customerNameMini'),me=document.querySelector('#customerEmailMini');
 if(a&&ma)ma.textContent=(a.textContent||'ZZ').trim();
 if(t&&mt)mt.textContent=(t.textContent||'').replace(/^Përshëndetje,\s*/i,'').trim()||'Llogaria ime';
 if(e&&me)me.textContent=(e.textContent||'').trim();
}
const run=()=>{arrange();sync()};
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,80));
window.addEventListener('load',()=>setTimeout(run,180));
setTimeout(run,320);
})();