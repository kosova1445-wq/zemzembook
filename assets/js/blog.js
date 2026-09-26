(()=>{
  const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
  const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeUrl=v=>{const s=String(v||'').trim();return /^(https?:\/\/|\/|\.\/|\.\.\/|[a-z0-9_-]+\.html)/i.test(s)?s:''};
  const fmtDate=v=>v?new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(v)):'—';
  const month=v=>v?new Intl.DateTimeFormat('sq-AL',{month:'short'}).format(new Date(v)).replace('.',''):'';
  let categories=[],posts=[],page=1,perPage=7,activeCategory='',searchTerm='',sortMode='latest';

  async function get(path){const r=await fetch(`${SB_URL}/rest/v1/${path}`,{headers:{apikey:SB_KEY,Accept:'application/json'},cache:'no-store'});if(!r.ok)throw new Error('Nuk u ngarkua Blogu.');return r.json()}
  async function loadData(){
    [categories,posts]=await Promise.all([
      get('blog_categories?select=id,name,slug,description,parent_id,sort_order,is_active&is_active=eq.true&order=sort_order.asc,name.asc'),
      get('blog_posts?select=id,title,slug,excerpt,content,cover_url,category_id,author_name,published_at,created_at,updated_at,is_featured,views_count,publish_at,unpublish_at,tags&status=eq.published&order=published_at.desc.nullslast,created_at.desc&limit=200')
    ]);
  }
  const catById=id=>categories.find(c=>c.id===id);
  const childrenOf=id=>categories.filter(c=>c.parent_id===id);
  const rootCats=()=>categories.filter(c=>!c.parent_id);
  const descendantIds=cat=>{const out=[cat.id];const walk=id=>childrenOf(id).forEach(c=>{out.push(c.id);walk(c.id)});walk(cat.id);return out};
  function categoryForSlug(slug){return categories.find(c=>c.slug===slug)}
  function filteredPosts(){
    let out=[...posts];
    if(activeCategory){const cat=categoryForSlug(activeCategory);if(cat){const ids=new Set(descendantIds(cat));out=out.filter(p=>ids.has(p.category_id))}}
    if(searchTerm){const s=searchTerm.toLowerCase();out=out.filter(p=>`${p.title||''} ${p.excerpt||''} ${p.content||''} ${p.author_name||''} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(s))}
    if(sortMode==='oldest')out.sort((a,b)=>new Date(a.published_at||a.created_at)-new Date(b.published_at||b.created_at));
    else if(sortMode==='title')out.sort((a,b)=>(a.title||'').localeCompare(b.title||'','sq'));
    else out.sort((a,b)=>Number(!!b.is_featured)-Number(!!a.is_featured)||new Date(b.published_at||b.created_at)-new Date(a.published_at||a.created_at));
    return out;
  }
  function postCard(p){
    const d=p.published_at||p.created_at,cat=catById(p.category_id);
    const media=p.cover_url?`<img src="${esc(safeUrl(p.cover_url))}" alt="${esc(p.title)}" loading="lazy">`:`<div class="blog-placeholder">Z</div>`;
    return `<article class="blog-card"><a class="blog-card-media" href="article.html?slug=${encodeURIComponent(p.slug)}">${media}<span class="blog-date-chip">${esc(new Date(d).getDate())}<br>${esc(month(d))}</span></a><div class="blog-card-body"><div class="blog-meta"><span>👤 ${esc(p.author_name||'ZemZem')}</span>${cat?`<span>▣ ${esc(cat.name)}</span>`:''}</div><h2><a href="article.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title||'Pa titull')}</a></h2><p>${esc(p.excerpt||'')}</p><div class="blog-card-actions"><a class="blog-read" href="article.html?slug=${encodeURIComponent(p.slug)}">Lexo më shumë →</a><button class="blog-share" type="button" data-share="${esc(p.slug)}" aria-label="Shpërndaje">↗</button></div></div></article>`
  }
  function featuredCard(p){
    const d=p.published_at||p.created_at,cat=catById(p.category_id);
    const media=p.cover_url?`<img src="${esc(safeUrl(p.cover_url))}" alt="${esc(p.title)}">`:`<div class="blog-placeholder">Z</div>`;
    return `<article class="blog-featured"><a class="blog-featured-media" href="article.html?slug=${encodeURIComponent(p.slug)}">${media}<span class="blog-date-chip">${esc(new Date(d).getDate())}<br>${esc(month(d))}</span></a><div class="blog-featured-body"><div class="blog-meta"><span>👤 ${esc(p.author_name||'ZemZem')}</span><span>◷ ${esc(fmtDate(d))}</span>${cat?`<span>▣ ${esc(cat.name)}</span>`:''}</div><h2 class="blog-featured-title"><a href="article.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title||'Pa titull')}</a></h2><p class="blog-featured-excerpt">${esc(p.excerpt||'')}</p><div class="blog-featured-actions"><a class="blog-read" href="article.html?slug=${encodeURIComponent(p.slug)}">Lexo më shumë →</a><button class="blog-share" type="button" data-share="${esc(p.slug)}" aria-label="Shpërndaje">↗</button></div></div></article>`
  }
  function renderList(){
    const host=$('#blogGrid'),featured=$('#blogFeatured'),count=$('#blogResultCount');if(!host)return;
    const list=filteredPosts(),totalPages=Math.max(1,Math.ceil(list.length/perPage));if(page>totalPages)page=totalPages;
    const start=(page-1)*perPage,rows=list.slice(start,start+perPage);
    if(count)count.textContent=list.length?`Duke shfaqur ${start+1}–${Math.min(start+rows.length,list.length)} nga ${list.length} artikuj`:'Nuk ka artikuj për këtë filtër';
    if(!rows.length){
      if(featured)featured.innerHTML='';
      host.innerHTML='<div class="blog-empty"><strong>Nuk ka ende artikuj këtu.</strong><br>Artikujt e publikuar nga Admini do të shfaqen automatikisht.</div>';
    }else{
      if(featured)featured.innerHTML=featuredCard(rows[0]);
      host.innerHTML=rows.slice(1).map(postCard).join('');
    }
    renderPagination(totalPages);bindShare();
  }
  function renderPagination(total){const host=$('#blogPagination');if(!host)return;if(total<=1){host.innerHTML='';return}let html=`<button data-p="${Math.max(1,page-1)}">←</button>`;for(let i=1;i<=total;i++){if(total>8&&i>3&&i<total-2&&Math.abs(i-page)>1){if(!html.includes('data-gap'))html+='<button data-gap disabled>…</button>';continue}html+=`<button data-p="${i}" class="${i===page?'active':''}">${i}</button>`}html+=`<button data-p="${Math.min(total,page+1)}">→</button>`;host.innerHTML=html;$$('#blogPagination [data-p]').forEach(b=>b.onclick=()=>{page=Number(b.dataset.p)||1;renderList();scrollTo({top:$('.blog-section')?.offsetTop-90||0,behavior:'smooth'})})}
  function renderCategories(){const host=$('#blogCategoryTree');if(!host)return;const countFor=id=>{const ids=new Set(descendantIds(categories.find(c=>c.id===id)));return posts.filter(p=>ids.has(p.category_id)).length};host.innerHTML=`<div class="blog-cat-parent"><div class="blog-cat-line"><a href="blog.html">Të gjitha</a><span>${posts.length}</span></div></div>`+rootCats().map(root=>{const kids=childrenOf(root.id);return `<div class="blog-cat-parent"><div class="blog-cat-line"><a href="blog.html?category=${encodeURIComponent(root.slug)}">${esc(root.name)}</a>${kids.length?'<button type="button" aria-label="Nënkategoritë">＋</button>':`<span>${countFor(root.id)}</span>`}</div>${kids.length?`<div class="blog-subcats">${kids.map(k=>`<a href="blog.html?category=${encodeURIComponent(k.slug)}"><span>${esc(k.name)}</span><span>${countFor(k.id)}</span></a>`).join('')}</div>`:''}</div>`}).join('');$$('.blog-cat-parent button').forEach(b=>b.onclick=()=>{const s=b.closest('.blog-cat-parent').querySelector('.blog-subcats');if(!s)return;s.hidden=!s.hidden;b.textContent=s.hidden?'＋':'−'})}
  function renderLatest(){const host=$('#blogLatest');if(!host)return;host.innerHTML=posts.slice(0,4).map(p=>`<div class="blog-latest-item"><div class="blog-latest-thumb">${p.cover_url?`<img src="${esc(safeUrl(p.cover_url))}" alt="" loading="lazy">`:''}</div><div><small>▣ ${esc(fmtDate(p.published_at||p.created_at))}</small><a href="article.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></div></div>`).join('')||'<div class="blog-result-count">Ende s’ka artikuj të publikuar.</div>'}
  function renderMostRead(){
    const host=$('#blogMostRead');if(!host)return;
    const top=[...posts].sort((a,b)=>Number(b.views_count||0)-Number(a.views_count||0)).slice(0,5);
    host.innerHTML=top.map((p,i)=>`<a class="blog-most-item" href="article.html?slug=${encodeURIComponent(p.slug)}"><span>${i+1}</span><div><strong>${esc(p.title)}</strong><small>👁 ${Number(p.views_count||0)} lexime</small></div></a>`).join('')||'<div class="blog-result-count">Ende s’ka të dhëna.</div>';
  }
  async function incrementArticleView(p){
    if(!p?.id)return;
    const key='zz_blog_view_'+p.id;
    try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch{}
    try{
      await fetch(`${SB_URL}/rest/v1/rpc/increment_blog_post_view`,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_post_id:p.id}),cache:'no-store'});
      p.views_count=Number(p.views_count||0)+1;
    }catch{}
  }
  function renderRelated(p){
    const host=$('#relatedPosts');if(!host)return;
    const pTags=new Set((p.tags||[]).map(x=>String(x).toLowerCase()));
    const words=new Set(String(p.title||'').toLowerCase().split(/\W+/).filter(x=>x.length>4));
    const scored=posts.filter(x=>x.id!==p.id).map(x=>{
      let score=x.category_id===p.category_id?4:0;
      for(const t of (x.tags||[]))if(pTags.has(String(t).toLowerCase()))score+=3;
      for(const w of String(x.title||'').toLowerCase().split(/\W+/))if(words.has(w))score++;
      return {x,score};
    }).sort((a,b)=>b.score-a.score||new Date(b.x.published_at||b.x.created_at)-new Date(a.x.published_at||a.x.created_at));
    const rel=scored.slice(0,3).map(r=>r.x);
    host.innerHTML=rel.map(postCard).join('')||'<div class="blog-empty">Nuk ka artikuj të tjerë për momentin.</div>';
  }
  function setMeta(selector,attr,value){
    let el=document.querySelector(selector);
    if(!el){el=document.createElement('meta');const m=selector.match(/meta\[(name|property)="([^"]+)"\]/);if(m)el.setAttribute(m[1],m[2]);document.head.appendChild(el)}
    el.setAttribute(attr,value);
  }
  function enhanceArticleSeo(p){
    const url=`https://www.zemzem.al/article.html?slug=${encodeURIComponent(p.slug)}`;
    const desc=(p.excerpt||p.content||'').replace(/\s+/g,' ').trim().slice(0,160);
    document.title=`${p.title} | ZemZem Blog`;
    setMeta('meta[name="description"]','content',desc);
    setMeta('meta[property="og:title"]','content',p.title);
    setMeta('meta[property="og:description"]','content',desc);
    setMeta('meta[property="og:url"]','content',url);
    setMeta('meta[property="og:type"]','content','article');
    setMeta('meta[property="og:image"]','content',p.cover_url?safeUrl(p.cover_url):'https://www.zemzem.al/favicon.svg');
    setMeta('meta[name="twitter:card"]','content','summary_large_image');
    setMeta('meta[name="twitter:title"]','content',p.title);
    setMeta('meta[name="twitter:description"]','content',desc);
    setMeta('meta[name="twitter:image"]','content',p.cover_url?safeUrl(p.cover_url):'https://www.zemzem.al/favicon.svg');
    let can=document.querySelector('link[rel="canonical"]');if(can)can.href=url;
    const old=document.querySelector('#articleStructuredData');if(old)old.remove();
    const s=document.createElement('script');s.type='application/ld+json';s.id='articleStructuredData';
    s.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:p.title,description:desc,image:p.cover_url?[safeUrl(p.cover_url)]:undefined,datePublished:p.published_at||p.created_at,dateModified:p.updated_at||p.published_at||p.created_at,author:{'@type':'Person',name:p.author_name||'ZemZem'},publisher:{'@type':'Organization',name:'ZemZem'},mainEntityOfPage:url});
    document.head.appendChild(s);
  }
  function bindSearch(){const form=$('#blogSearchForm'),input=$('#blogSearch'),sort=$('#blogSort');if(form)form.onsubmit=e=>{e.preventDefault();searchTerm=input.value.trim();page=1;renderList()};if(input){let t;input.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{searchTerm=input.value.trim();page=1;renderList()},180)}}if(sort)sort.onchange=()=>{sortMode=sort.value;page=1;renderList()}}
  async function trackArticleEvent(p){
    if(!p?.id)return;
    try{await fetch(`${SB_URL}/rest/v1/rpc/track_blog_event`,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_post_id:p.id,p_referrer:document.referrer||'',p_page_path:location.pathname+location.search}),cache:'no-store'})}catch{}
  }
  async function loadComments(p){
    const host=$('#blogCommentsList');if(!host||!p?.id)return;
    try{const r=await fetch(`${SB_URL}/rest/v1/rpc/get_approved_blog_comments`,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_post_id:p.id}),cache:'no-store'});const rows=r.ok?await r.json():[];host.innerHTML=rows.length?rows.map(x=>`<article class="blog-comment"><div><strong>${esc(x.name)}</strong><small>${esc(fmtDate(x.created_at))}</small></div><p>${esc(x.body)}</p></article>`).join(''):'<div class="blog-result-count">Ende nuk ka komente të aprovuara.</div>'}catch{host.innerHTML='<div class="blog-result-count">Komentet nuk u ngarkuan.</div>'}
  }
  function bindCommentForm(p){
    const form=$('#blogCommentForm'),msg=$('#blogCommentMessage');if(!form||!p?.id)return;
    form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),payload={p_post_id:p.id,p_name:String(fd.get('name')||''),p_email:String(fd.get('email')||''),p_body:String(fd.get('body')||'')};if(msg)msg.textContent='Duke dërguar…';try{const r=await fetch(`${SB_URL}/rest/v1/rpc/submit_blog_comment`,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error();form.reset();if(msg)msg.textContent='Komenti u dërgua dhe do të shfaqet pas aprovimit.'}catch{if(msg)msg.textContent='Komenti nuk u dërgua. Provo përsëri.'}}
  }
  function bindNewsletter(){
    const form=$('#blogNewsletterForm'),msg=$('#blogNewsletterMessage');if(!form)return;
    form.onsubmit=async e=>{e.preventDefault();const email=String(new FormData(form).get('email')||'').trim();if(msg)msg.textContent='Duke u regjistruar…';try{const r=await fetch(`${SB_URL}/rest/v1/rpc/subscribe_blog_newsletter`,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_email:email})});if(!r.ok)throw new Error();form.reset();if(msg)msg.textContent='U regjistruat me sukses.'}catch{if(msg)msg.textContent='Kontrollo emailin dhe provo përsëri.'}}
  }
  function bindSocialShare(p){
    const host=$('#articleShare');if(!host||!p)return;
    const url=encodeURIComponent(location.href),title=encodeURIComponent(p.title||'ZemZem Blog');
    host.innerHTML=`<span>Shpërndaje:</span><a target="_blank" rel="noopener" href="https://wa.me/?text=${title}%20${url}">WhatsApp</a><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${url}">Facebook</a><a target="_blank" rel="noopener" href="https://t.me/share/url?url=${url}&text=${title}">Telegram</a><button type="button" id="copyArticleLink">Kopjo linkun</button>`;
    const b=$('#copyArticleLink');if(b)b.onclick=async()=>{try{await navigator.clipboard.writeText(location.href);b.textContent='U kopjua ✓'}catch{}};
  }
  function bindShare(){$$('[data-share]').forEach(b=>b.onclick=async()=>{const slug=b.dataset.share,url=`${location.origin}${location.pathname.replace(/blog\.html$/,'article.html')}?slug=${encodeURIComponent(slug)}`;try{if(navigator.share)await navigator.share({title:'ZemZem Blog',url});else{await navigator.clipboard.writeText(url);b.textContent='✓';setTimeout(()=>b.textContent='↗',1200)}}catch{}})}
  function renderArticle(){const slug=new URLSearchParams(location.search).get('slug')||'';const p=posts.find(x=>x.slug===slug),host=$('#articleHost');if(!host)return;if(!p){host.innerHTML='<div class="blog-empty"><strong>Artikulli nuk u gjet.</strong><br><a href="blog.html">Kthehu te Blogu</a></div>';return}const d=p.published_at||p.created_at,cat=catById(p.category_id),cover=$('#articleCover');if(cover){cover.innerHTML=p.cover_url?`<img src="${esc(safeUrl(p.cover_url))}" alt="${esc(p.title)}">`:'';if(!p.cover_url)cover.style.display='none'}$('#articleTitle').textContent=p.title;$('#articleMeta').innerHTML=`<span>👤 ${esc(p.author_name||'ZemZem')}</span><span>◷ ${esc(fmtDate(d))}</span>${cat?`<span>▣ ${esc(cat.name)}</span>`:''}<span>👁 ${Number(p.views_count||0)} lexime</span>`;$('#articleExcerpt').textContent=p.excerpt||'';const oldTags=$('#articleTags');if(oldTags)oldTags.remove();if(Array.isArray(p.tags)&&p.tags.length){const box=document.createElement('div');box.id='articleTags';box.className='blog-tags';box.innerHTML=p.tags.map(t=>`<span class="blog-tag">#${esc(t)}</span>`).join('');$('#articleExcerpt').insertAdjacentElement('afterend',box)}const content=$('#articleContent');content.innerHTML=String(p.content||'').split(/\n{2,}/).map(block=>{const t=block.trim();if(!t)return'';if(t.startsWith('### '))return`<h3>${esc(t.slice(4))}</h3>`;if(t.startsWith('## '))return`<h2>${esc(t.slice(3))}</h2>`;return`<p>${esc(t).replace(/\n/g,'<br>')}</p>`}).join('');const bc=$('#articleBreadcrumb');if(bc)bc.innerHTML=`<a href="index.html">Ballina</a> / <a href="blog.html">Blog</a> / ${esc(p.title)}`;enhanceArticleSeo(p);renderRelated(p);bindSocialShare(p);loadComments(p);bindCommentForm(p);trackArticleEvent(p);incrementArticleView(p);bindShare();}
  async function init(){
    const qs=new URLSearchParams(location.search);activeCategory=qs.get('category')||'';
    try{await loadData();renderCategories();renderLatest();renderMostRead();bindNewsletter();if(document.body.dataset.blogPage==='article')renderArticle();else{renderList();bindSearch()}}
    catch(e){const h=$('#blogGrid')||$('#articleHost');if(h)h.innerHTML=`<div class="blog-empty">${esc(e.message)}</div>`}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
