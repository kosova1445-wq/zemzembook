(()=>{
'use strict';
if(window.__zzSiteManagerAdvancedRuntime)return;window.__zzSiteManagerAdvancedRuntime=1;
let CFG=null,applied=false;
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function sectionNode(x){
 if(!x)return null;
 if(x.selector==='__categories__')return q('[data-home-category-cards]')?.closest('.section')||null;
 try{return q(x.selector)}catch{return null}
}
function applySections(){
 const arr=Array.isArray(CFG?.home_sections)?CFG.home_sections:[];
 arr.forEach(x=>{
   const el=sectionNode(x);if(!el)return;
   const visible=x.visible!==false&&!x.deleted;
   el.style.display=visible?'':'none';
   el.dataset.zzsmManaged='1';
   const head=el.querySelector('.section-head h2,h2');
   if(head&&x.icon){
     let icon=head.querySelector(':scope > .zzsm-managed-icon');
     if(!icon){icon=document.createElement('span');icon.className='zzsm-managed-icon';icon.style.marginRight='8px';icon.setAttribute('aria-hidden','true');head.prepend(icon)}
     icon.textContent=x.icon;
   }else if(head){
     head.querySelector(':scope > .zzsm-managed-icon')?.remove();
   }
 });
 if(CFG?.advanced?.section_order_enabled===true){
   const footer=q('.footer');if(!footer?.parentNode)return;
   const parent=footer.parentNode;
   const desired=arr.map(sectionNode).filter(el=>el&&el.parentNode===parent&&el.style.display!=='none');
   const current=[...parent.children].filter(el=>desired.includes(el));
   const same=current.length===desired.length&&current.every((el,i)=>el===desired[i]);
   if(!same)desired.forEach(el=>parent.insertBefore(el,footer));
 }
}
function normHref(v){try{return new URL(v,location.href).pathname.replace(/^\\//,'')+new URL(v,location.href).hash}catch{return String(v||'')}}
function applyFooter(){
 const arr=Array.isArray(CFG?.footer_links)?CFG.footer_links:[];
 if(!arr.length)return;
 const groups=qa('.footer-links');if(!groups.length)return;
 const all=qa('.footer-links a');
 all.forEach(a=>{a.dataset.zzsmMatched='0'});
 arr.forEach((x,i)=>{
   const deleted=x.deleted===true||x.visible===false;
   const match=all.find(a=>a.dataset.zzsmMatched!=='1'&&(normHref(a.getAttribute('href'))===normHref(x.href)||a.textContent.trim().replace(/^[^\p{L}\p{N}]+/u,'').trim()===String(x.label||'').trim()));
   if(match){
     match.dataset.zzsmMatched='1';
     match.style.display=deleted?'none':'';
     if(!deleted){
       const icon=CFG?.advanced?.footer_icons!==false&&x.icon?x.icon+' ':'';
       match.textContent=icon+(x.label||match.textContent.trim());
       if(x.href)match.setAttribute('href',x.href);
     }
   }else if(!deleted&&x.href&&x.label){
     const a=document.createElement('a');a.href=x.href;a.dataset.zzsmManagedLink='1';a.dataset.zzsmIndex=String(i);
     a.textContent=(CFG?.advanced?.footer_icons!==false&&x.icon?x.icon+' ':'')+x.label;
     groups[0].appendChild(a);
   }
 });
 qa('[data-zzsm-managed-link]').forEach(a=>{
   const i=Number(a.dataset.zzsmIndex),x=arr[i];
   if(!x||x.deleted||x.visible===false)a.remove();
 });
}
function apply(){
 if(!CFG)return;
 applySections();applyFooter();applied=true;
}
function setCfg(c){CFG=c||{};apply();setTimeout(apply,300);setTimeout(apply,1200)}
window.addEventListener('zemzem:site-manager-ready',e=>setCfg(e.detail));
if(window.ZemZemSiteManager)setCfg(window.ZemZemSiteManager);
else{
 let n=0;const t=setInterval(()=>{n++;if(window.ZemZemSiteManager){clearInterval(t);setCfg(window.ZemZemSiteManager)}else if(n>40)clearInterval(t)},250);
}
const obs=new MutationObserver(()=>{if(CFG&&applied)requestAnimationFrame(apply)});obs.observe(document.documentElement,{childList:true,subtree:true});
})();