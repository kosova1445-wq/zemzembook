(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const state={page:1,perPage:12,view:'grid',ready:false};
  const escHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const books=()=>{try{return Array.isArray(BOOKS)?BOOKS:[]}catch{return[]}};
  const moneyLocal=n=>{try{return typeof money==='function'?money(n):Number(n||0).toFixed(2)+' €'}catch{return Number(n||0).toFixed(2)+' €'}};
  const unique=(arr)=>[...new Set(arr.filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'sq'));
  const param=(k)=>new URLSearchParams(location.search).get(k)||'';

  function waitForCatalog(){
    let tries=0,lastSignature='';
    const tick=()=>{
      const list=books(), source=(()=>{try{return CATALOG_SOURCE}catch{return''}})();
      if(!list.length && tries<20){tries++;return setTimeout(tick,250)}
      const signature=`${source}|${list.length}|${list.map(b=>b.id).join(',')}`;
      if(!state.ready && (source==='supabase'||tries>=8)){init();lastSignature=signature}
      else if(state.ready && signature!==lastSignature && tries<14){lastSignature=signature;rebuildOptions();render(true)}
      if(tries++<14)setTimeout(tick,350);
    };
    tick();
  }

  function countsFor(key){const out={};books().forEach(b=>{const v=String(b[key]||'').trim();if(v)out[v]=(out[v]||0)+1});return out}
  function categoryLabels(){return unique(books().map(b=>b.cat||'Të tjera'))}
  function authors(){return unique(books().map(b=>b.author))}
  function languages(){return unique(books().map(b=>b.language||'sq'))}

  function filterMarkup(){
    const cc=countsFor('cat'), selectedCats=(param('category')||'').split(',').map(decodeURIComponent).filter(Boolean), selectedAuthor=param('author'), selectedLang=param('lang');
    return `<div class="shop-pro-filter-head"><h3>Filtro librat</h3><button class="shop-pro-filter-close" type="button" aria-label="Mbyll filtrat">×</button></div>
      <div class="filter-group"><strong>Kategoria</strong><div id="shopProCategories">${categoryLabels().map(c=>`<label><input type="checkbox" data-pro-category="${escHtml(c)}" ${selectedCats.includes(c)?'checked':''}> <span>${escHtml(c)}</span><span class="count">${cc[c]||0}</span></label>`).join('')}</div></div>
      <div class="filter-group"><strong>Autori</strong><select id="shopProAuthor" class="shop-pro-select" style="width:100%"><option value="">Të gjithë autorët</option>${authors().map(a=>`<option value="${escHtml(a)}" ${a===selectedAuthor?'selected':''}>${escHtml(a)}</option>`).join('')}</select></div>
      <div class="filter-group"><strong>Gjuha</strong><select id="shopProLanguage" class="shop-pro-select" style="width:100%"><option value="">Të gjitha gjuhët</option>${languages().map(l=>`<option value="${escHtml(l)}" ${l===selectedLang?'selected':''}>${escHtml(l).toUpperCase()}</option>`).join('')}</select></div>
      <div class="filter-group"><strong>Çmimi</strong><div class="shop-pro-price-row"><input id="shopProMin" class="shop-pro-price" type="number" min="0" step="0.5" placeholder="Min €" value="${escHtml(param('min'))}"><span>–</span><input id="shopProMax" class="shop-pro-price" type="number" min="0" step="0.5" placeholder="Max €" value="${escHtml(param('max'))}"></div></div>
      <div class="filter-group"><strong>Disponueshmëria</strong><label><input id="shopProStock" type="checkbox" ${param('stock')==='1'?'checked':''}> <span>Vetëm libra në stok</span></label><label><input id="shopProOffer" type="checkbox" ${param('offer')==='1'?'checked':''}> <span>Vetëm në ofertë</span></label></div>
      <div class="shop-pro-actions"><button id="clearFilters" class="btn btn-light" type="button">Pastro të gjithë filtrat</button><a class="btn btn-light" href="ebooks.html">📱 Shko te eBook</a></div>`;
  }

  function toolbarMarkup(){
    const sort=param('sort')||'new';
    const pp=Number(param('perPage')||12); if([12,24,48].includes(pp))state.perPage=pp;
    return `<div class="shop-pro-toolbar" id="shopProToolbar"><div class="shop-pro-toolbar-left"><button class="shop-pro-filter-toggle" type="button">☰ Filtrat</button><div class="shop-pro-summary" id="shopProSummary">Po përgatitet katalogu…</div></div><div class="shop-pro-toolbar-right"><label><span class="sr-only">Renditja</span><select id="sortBooks" class="shop-pro-select"><option value="new" ${sort==='new'?'selected':''}>Më të rinjtë</option><option value="bestseller" ${sort==='bestseller'?'selected':''}>Më të shiturit</option><option value="title" ${sort==='title'?'selected':''}>Titulli A–Z</option><option value="asc" ${sort==='asc'?'selected':''}>Çmimi: ulët → lartë</option><option value="desc" ${sort==='desc'?'selected':''}>Çmimi: lartë → ulët</option></select></label><select id="shopProPerPage" class="shop-pro-select" aria-label="Libra për faqe"><option value="12" ${state.perPage===12?'selected':''}>12 / faqe</option><option value="24" ${state.perPage===24?'selected':''}>24 / faqe</option><option value="48" ${state.perPage===48?'selected':''}>48 / faqe</option></select><div class="shop-pro-view" aria-label="Pamja"><button type="button" data-view="grid" class="active" title="Pamje rrjetë">▦</button><button type="button" data-view="list" title="Pamje listë">☷</button></div></div></div><div class="shop-pro-chips" id="shopProChips" hidden></div>`;
  }

  function init(){
    if(state.ready||!$('#shopBooks'))return;state.ready=true;
    state.page=Math.max(1,Number(param('page')||1)); state.view=localStorage.getItem('zemzem_shop_view')==='list'?'list':'grid';
    const aside=$('.shop-layout .filter'); if(aside){aside.classList.add('shop-pro-filter');aside.innerHTML=filterMarkup()}
    const content=$('#shopBooks')?.parentElement; const head=content?.querySelector('.section-head'); if(head)head.remove();
    if(content)content.insertAdjacentHTML('afterbegin',toolbarMarkup());
    $('#shopBooks')?.insertAdjacentHTML('afterend','<nav class="shop-pro-pagination" id="shopProPagination" aria-label="Faqet e katalogut"></nav>');
    document.body.insertAdjacentHTML('beforeend','<div class="shop-pro-filter-backdrop" id="shopProBackdrop"></div>');
    bind(); applyView(); render(false);
  }

  function rebuildOptions(){
    const box=$('#shopProCategories'),cc=countsFor('cat'); if(box){const selected=new Set($$('[data-pro-category]:checked').map(x=>x.value||x.dataset.proCategory));box.innerHTML=categoryLabels().map(c=>`<label><input type="checkbox" data-pro-category="${escHtml(c)}" ${selected.has(c)?'checked':''}> <span>${escHtml(c)}</span><span class="count">${cc[c]||0}</span></label>`).join('');$$('[data-pro-category]',box).forEach(x=>x.addEventListener('change',()=>{state.page=1;render()}))}
    const a=$('#shopProAuthor'); if(a){const v=a.value;a.innerHTML='<option value="">Të gjithë autorët</option>'+authors().map(x=>`<option value="${escHtml(x)}">${escHtml(x)}</option>`).join('');a.value=authors().includes(v)?v:''}
    const l=$('#shopProLanguage'); if(l){const v=l.value;l.innerHTML='<option value="">Të gjitha gjuhët</option>'+languages().map(x=>`<option value="${escHtml(x)}">${escHtml(x).toUpperCase()}</option>`).join('');l.value=languages().includes(v)?v:''}
  }

  function getFilters(){
    return {q:($('#shopSearch')?.value||param('q')).trim().toLowerCase(),cats:$$('[data-pro-category]:checked').map(x=>x.dataset.proCategory),author:$('#shopProAuthor')?.value||'',lang:$('#shopProLanguage')?.value||'',min:Number($('#shopProMin')?.value||0),max:Number($('#shopProMax')?.value||0),stock:!!$('#shopProStock')?.checked,offer:!!$('#shopProOffer')?.checked,sort:$('#sortBooks')?.value||'new'};
  }

  function filtered(){
    const f=getFilters();let items=books().filter(b=>{
      const hay=`${b.title||''} ${b.author||''} ${b.cat||''} ${b.sku||''} ${b.isbn||''}`.toLowerCase();
      return (!f.q||hay.includes(f.q))&&(!f.cats.length||f.cats.includes(b.cat||'Të tjera'))&&(!f.author||b.author===f.author)&&(!f.lang||(b.language||'sq')===f.lang)&&(!f.min||Number(b.price)>=f.min)&&(!f.max||Number(b.price)<=f.max)&&(!f.stock||!b.trackStock||Number(b.stock)>0)&&(!f.offer||Number(b.old)>Number(b.price));
    });
    if(f.sort==='asc')items.sort((a,b)=>a.price-b.price);else if(f.sort==='desc')items.sort((a,b)=>b.price-a.price);else if(f.sort==='title')items.sort((a,b)=>String(a.title).localeCompare(String(b.title),'sq'));else if(f.sort==='bestseller')items.sort((a,b)=>Number(!!b.bestseller)-Number(!!a.bestseller)||String(b.createdAt).localeCompare(String(a.createdAt)));else items.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    return items;
  }

  function renderCard(b){try{return typeof bookCard==='function'?bookCard(b):`<article class="book-card"><a href="product.html?id=${encodeURIComponent(b.id)}"><h3>${escHtml(b.title)}</h3></a><div>${moneyLocal(b.price)}</div></article>`}catch{return''}}
  function render(skipUrl=false){
    const all=filtered(),total=all.length,pages=Math.max(1,Math.ceil(total/state.perPage));if(state.page>pages)state.page=pages;const start=(state.page-1)*state.perPage,visible=all.slice(start,start+state.perPage),grid=$('#shopBooks');
    if(grid)grid.innerHTML=visible.length?visible.map(renderCard).join(''):`<div class="shop-pro-empty"><strong>Nuk u gjet asnjë libër.</strong>Ndrysho filtrat ose pastro kërkimin dhe provo përsëri.</div>`;
    const summary=$('#shopProSummary');if(summary)summary.innerHTML=`${total} tituj të gjetur<small>${total?`Po shfaqen ${start+1}–${Math.min(start+state.perPage,total)} nga ${total}`:'Provo një kërkim tjetër'}</small>`;
    renderChips();renderPagination(pages);applyView();if(!skipUrl)syncUrl();
  }

  function renderPagination(pages){const p=$('#shopProPagination');if(!p)return;if(pages<=1){p.innerHTML='';return}const nums=[];for(let i=1;i<=pages;i++)if(i===1||i===pages||Math.abs(i-state.page)<=2)nums.push(i);let html=`<button type="button" data-page="${state.page-1}" ${state.page<=1?'disabled':''}>‹</button>`,last=0;nums.forEach(n=>{if(last&&n-last>1)html+='<span>…</span>';html+=`<button type="button" data-page="${n}" class="${n===state.page?'active':''}">${n}</button>`;last=n});html+=`<button type="button" data-page="${state.page+1}" ${state.page>=pages?'disabled':''}>›</button>`;p.innerHTML=html;$$('[data-page]',p).forEach(b=>b.onclick=()=>{const n=Number(b.dataset.page);if(n>=1&&n<=pages&&n!==state.page){state.page=n;render();$('#shopProToolbar')?.scrollIntoView({behavior:'smooth',block:'start'})}})}

  function renderChips(){const f=getFilters(),c=$('#shopProChips');if(!c)return;const chips=[];if(f.q)chips.push(['q',`Kërkim: ${$('#shopSearch')?.value||f.q}`]);f.cats.forEach(x=>chips.push(['cat:'+x,x]));if(f.author)chips.push(['author',f.author]);if(f.lang)chips.push(['lang',`Gjuha: ${f.lang.toUpperCase()}`]);if(f.min)chips.push(['min',`Nga ${moneyLocal(f.min)}`]);if(f.max)chips.push(['max',`Deri ${moneyLocal(f.max)}`]);if(f.stock)chips.push(['stock','Në stok']);if(f.offer)chips.push(['offer','Në ofertë']);c.hidden=!chips.length;c.innerHTML=chips.map(([k,t])=>`<button type="button" class="shop-pro-chip" data-chip="${escHtml(k)}">${escHtml(t)} ×</button>`).join('')+(chips.length?'<button type="button" class="shop-pro-chip shop-pro-chip-clear" data-chip="all">Pastro të gjitha</button>':'');$$('[data-chip]',c).forEach(b=>b.onclick=()=>clearChip(b.dataset.chip))}
  function clearChip(k){if(k==='all')return clearAll();if(k==='q'&&$('#shopSearch'))$('#shopSearch').value='';else if(k.startsWith('cat:')){const v=k.slice(4);const cb=$$('[data-pro-category]').find(x=>x.dataset.proCategory===v);if(cb)cb.checked=false}else if(k==='author'&&$('#shopProAuthor'))$('#shopProAuthor').value='';else if(k==='lang'&&$('#shopProLanguage'))$('#shopProLanguage').value='';else if(k==='min'&&$('#shopProMin'))$('#shopProMin').value='';else if(k==='max'&&$('#shopProMax'))$('#shopProMax').value='';else if(k==='stock'&&$('#shopProStock'))$('#shopProStock').checked=false;else if(k==='offer'&&$('#shopProOffer'))$('#shopProOffer').checked=false;state.page=1;render()}
  function clearAll(){if($('#shopSearch'))$('#shopSearch').value='';$$('[data-pro-category]').forEach(x=>x.checked=false);if($('#shopProAuthor'))$('#shopProAuthor').value='';if($('#shopProLanguage'))$('#shopProLanguage').value='';if($('#shopProMin'))$('#shopProMin').value='';if($('#shopProMax'))$('#shopProMax').value='';if($('#shopProStock'))$('#shopProStock').checked=false;if($('#shopProOffer'))$('#shopProOffer').checked=false;if($('#sortBooks'))$('#sortBooks').value='new';state.page=1;render()}

  function syncUrl(){const f=getFilters(),p=new URLSearchParams();const rawQ=($('#shopSearch')?.value||'').trim();if(rawQ)p.set('q',rawQ);if(f.cats.length)p.set('category',f.cats.join(','));if(f.author)p.set('author',f.author);if(f.lang)p.set('lang',f.lang);if(f.min)p.set('min',String(f.min));if(f.max)p.set('max',String(f.max));if(f.stock)p.set('stock','1');if(f.offer)p.set('offer','1');if(f.sort!=='new')p.set('sort',f.sort);if(state.perPage!==12)p.set('perPage',String(state.perPage));if(state.page>1)p.set('page',String(state.page));history.replaceState(null,'',location.pathname+(p.toString()?`?${p.toString()}`:''))}
  function applyView(){const grid=$('#shopBooks');if(!grid)return;grid.classList.toggle('shop-pro-list',state.view==='list');grid.classList.toggle('shop-pro-grid',state.view==='grid');$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view))}
  function closeFilters(){$('.shop-pro-filter')?.classList.remove('open');$('#shopProBackdrop')?.classList.remove('open');document.documentElement.style.overflow=''}
  function openFilters(){$('.shop-pro-filter')?.classList.add('open');$('#shopProBackdrop')?.classList.add('open');document.documentElement.style.overflow='hidden'}

  function bind(){
    let timer;$('#shopSearch')?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.page=1;render()},120)});
    $$('[data-pro-category]').forEach(x=>x.addEventListener('change',()=>{state.page=1;render()}));
    ['#shopProAuthor','#shopProLanguage','#shopProStock','#shopProOffer','#sortBooks'].forEach(s=>$(s)?.addEventListener('change',()=>{state.page=1;render()}));
    ['#shopProMin','#shopProMax'].forEach(s=>$(s)?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.page=1;render()},220)}));
    $('#shopProPerPage')?.addEventListener('change',e=>{state.perPage=Number(e.target.value)||12;state.page=1;render()});
    $('#clearFilters')?.addEventListener('click',clearAll);
    $$('.shop-pro-view [data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;localStorage.setItem('zemzem_shop_view',state.view);applyView()}));
    $('.shop-pro-filter-toggle')?.addEventListener('click',openFilters);$('.shop-pro-filter-close')?.addEventListener('click',closeFilters);$('#shopProBackdrop')?.addEventListener('click',closeFilters);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFilters()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForCatalog);else waitForCatalog();
})();
