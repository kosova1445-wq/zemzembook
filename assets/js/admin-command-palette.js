(()=>{'use strict';
if(window.__zzAdminCommandPaletteV1)return;window.__zzAdminCommandPaletteV1=1;
const q=(s,r=document)=>r.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let timer=0,last='',open=false;
const api=(fn,body)=>window.api('rpc/'+fn,{method:'POST',body});
function ensure(){
 const actions=q('.top-actions');if(actions&&!q('#zzGlobalSearchBtn')){
  const b=document.createElement('button');b.id='zzGlobalSearchBtn';b.className='icon-action zz-global-search-btn';b.type='button';b.title='Kërkim global (Ctrl+K)';b.innerHTML='⌕ <span>Kërko</span><kbd>Ctrl K</kbd>';b.onclick=show;actions.insertBefore(b,actions.firstChild);
 }
 if(!q('#zzCommandPalette')){
  const d=document.createElement('div');d.id='zzCommandPalette';d.className='zz-command-palette';d.hidden=true;
  d.innerHTML='<div class="zz-command-backdrop" data-cmd-close></div><section class="zz-command-box" role="dialog" aria-modal="true" aria-label="Kërkim global"><div class="zz-command-search"><span>⌕</span><input id="zzCommandInput" autocomplete="off" placeholder="Kërko libër, ISBN, SKU, porosi, klient, partner…"><button type="button" data-cmd-close>Esc</button></div><div class="zz-command-quick" id="zzCommandQuick"></div><div class="zz-command-results" id="zzCommandResults"></div></section>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target.closest('[data-cmd-close]'))hide()});
  q('#zzCommandInput',d).addEventListener('input',onInput);
  q('#zzCommandInput',d).addEventListener('keydown',e=>{if(e.key==='Enter'){const x=q('[data-cmd-result]',d);if(x){e.preventDefault();x.click()}}});
  renderQuick();
 }
}
function renderQuick(){
 const h=q('#zzCommandQuick');if(!h)return;
 h.innerHTML='<div class="zz-command-label">Veprime të shpejta</div><div class="zz-command-actions">'+
 [['add-book','＋','Shto libër'],['orders','▤','Porositë'],['partners','🤝','Partnerët'],['team-center','✓','Aprovimet'],['team-center','🔔','Njoftimet']].map((x,i)=>'<button data-cmd-go="'+x[0]+'" data-cmd-special="'+(i===3?'approvals':i===4?'notifications':'')+'"><span>'+x[1]+'</span><strong>'+x[2]+'</strong></button>').join('')+
 '</div>';
 h.querySelectorAll('[data-cmd-go]').forEach(b=>b.onclick=()=>{goView(b.dataset.cmdGo,b.dataset.cmdSpecial);hide()});
}
function show(){ensure();const d=q('#zzCommandPalette');if(!d)return;d.hidden=false;open=true;document.body.classList.add('zz-command-open');const i=q('#zzCommandInput');i.value='';last='';renderQuick();q('#zzCommandResults').innerHTML='<div class="zz-command-empty">Shkruaj së paku 2 karaktere.</div>';setTimeout(()=>i.focus(),20)}
function hide(){const d=q('#zzCommandPalette');if(!d)return;d.hidden=true;open=false;document.body.classList.remove('zz-command-open')}
function goView(view,special=''){
 try{window.setView?.(view)}catch{}
 if(view==='team-center'&&special)setTimeout(()=>q('[data-team-tab="'+special+'"]')?.click(),250);
}
function openResult(kind,id,title){
 hide();
 if(kind==='book'){goView('books');setTimeout(()=>{const i=q('#bookSearch');if(i){i.value=title;i.dispatchEvent(new Event('input',{bubbles:true}))}},180);return}
 if(kind==='order'){goView('orders');setTimeout(()=>{const i=q('#orderSearch');if(i){i.value=title;i.dispatchEvent(new Event('input',{bubbles:true}))}},180);return}
 if(kind==='partner'){goView('partners');setTimeout(()=>{const i=q('#zzPartnerSearch');if(i){i.value=title;i.dispatchEvent(new Event('input',{bubbles:true}))}},500)}
}
function icon(k){return k==='book'?'▥':k==='order'?'▤':'🤝'}
function label(k){return k==='book'?'Libër':k==='order'?'Porosi':'Partner'}
async function search(v){
 const host=q('#zzCommandResults');if(!host)return;
 if(v.length<2){host.innerHTML='<div class="zz-command-empty">Shkruaj së paku 2 karaktere.</div>';return}
 host.innerHTML='<div class="zz-command-loading">Duke kërkuar…</div>';
 try{
   const rows=await api('admin_global_search',{p_query:v,p_limit:30});
   if(v!==last)return;
   host.innerHTML=(rows||[]).length?(rows||[]).map(r=>'<button class="zz-command-result" data-cmd-result data-kind="'+esc(r.kind)+'" data-id="'+esc(r.id)+'" data-title="'+esc(r.title)+'"><span class="zz-command-result-icon">'+icon(r.kind)+'</span><span class="zz-command-result-copy"><strong>'+esc(r.title)+'</strong><small>'+esc(r.subtitle||'')+'</small></span><span class="zz-command-result-meta">'+label(r.kind)+(r.status?' · '+esc(r.status):'')+'</span></button>').join(''):'<div class="zz-command-empty">Nuk u gjet asgjë.</div>';
   host.querySelectorAll('[data-cmd-result]').forEach(b=>b.onclick=()=>openResult(b.dataset.kind,b.dataset.id,b.dataset.title));
 }catch(e){host.innerHTML='<div class="zz-command-empty error">'+esc(e.message||'Kërkimi dështoi')+'</div>'}
}
function onInput(e){clearTimeout(timer);last=e.target.value.trim();const v=last;timer=setTimeout(()=>search(v),180)}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open?hide():show()}else if(e.key==='Escape'&&open){e.preventDefault();hide()}});
function boot(){ensure();setTimeout(ensure,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();