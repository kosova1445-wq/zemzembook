(()=>{
'use strict';
const URL='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',SESSION_KEY='zemzem_customer_session';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=v=>Number(v||0).toFixed(2)+' €';
let session=null,user=null,wishlist=new Set(),detailId='';
const MODE_KEY='zemzem_ebook_cart_modes';
function modes(){try{return JSON.parse(localStorage.getItem(MODE_KEY)||'{}')||{}}catch{return{}}}
function setMode(id,data){const m=modes();m[String(id)]=data;localStorage.setItem(MODE_KEY,JSON.stringify(m))}
function addModeToCart(id,type,recipientEmail){const books=window.ZemZemEbooks?.books||[];const b=books.find(x=>String(x.id)===String(id));if(!b)return;setMode(id,{purchase_type:type,recipient_email:recipientEmail||null});const ids=window.ZemZemEbooks?.getEbookCart?.()||[];if(!ids.includes(String(id)))ids.push(String(id));window.ZemZemEbooks?.setEbookCart?.(ids);toast(type==='rental'?'Rental u shtua në shportë.':type==='preorder'?'Pre-order u shtua në shportë.':type==='gift'?'Dhurata u shtua në shportë.':'eBook u shtua në shportë.');setTimeout(()=>location.href='ebook-checkout.html',180)}
function read(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
async function ensure(){session=read();if(!session?.access_token)return false;try{const r=await fetch(URL+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+session.access_token},cache:'no-store'});if(!r.ok)return false;user=await r.json();return !!user?.id}catch{return false}}
async function api(path,{method='GET',body,prefer,auth=true}={}){const h={apikey:KEY};if(auth&&session?.access_token)h.Authorization='Bearer '+session.access_token;if(body!==undefined)h['Content-Type']='application/json';if(prefer)h.Prefer=prefer;const r=await fetch(URL+'/rest/v1/'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.message||d?.error||'Gabim');return d}
async function edge(body){const h={apikey:KEY,'Content-Type':'application/json'};if(session?.access_token)h.Authorization='Bearer '+session.access_token;const r=await fetch(URL+'/functions/v1/ebook-experience',{method:'POST',headers:h,body:JSON.stringify(body),cache:'no-store'});const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(d?.message||d?.error||'Gabim');return d}
function toast(msg){if(typeof ebookToast==='function')ebookToast(msg);else alert(msg)}
async function loadWishlist(){if(!user?.id)return;const rows=await api('ebook_wishlist?user_id=eq.'+encodeURIComponent(user.id)+'&select=ebook_id');wishlist=new Set((rows||[]).map(x=>String(x.ebook_id)))}
function wishBtn(id){const active=wishlist.has(String(id));return '<button type="button" class="ebook-wish-btn '+(active?'active':'')+'" data-ebook-wish="'+esc(id)+'" aria-label="Wishlist">'+(active?'♥':'♡')+'</button>'}
function decorateCards(){
  $$('.ebook-card').forEach(card=>{if(card.querySelector('[data-ebook-wish]'))return;const a=card.querySelector('a[href*="ebook.html?id="]');if(!a)return;const id=new URL(a.href,location.href).searchParams.get('id');if(!id)return;const host=card.querySelector('.ebook-cover-wrap')||card;host.insertAdjacentHTML('beforeend',wishBtn(id))});
  $$('[data-ebook-wish]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();toggleWishlist(b.dataset.ebookWish,b)});
}
async function toggleWishlist(id,btn){
  if(!user?.id){toast('Kyçu për ta ruajtur në wishlist.');setTimeout(()=>location.href='account.html',600);return}
  const active=wishlist.has(String(id));
  if(active){await api('ebook_wishlist?user_id=eq.'+encodeURIComponent(user.id)+'&ebook_id=eq.'+encodeURIComponent(id),{method:'DELETE'});wishlist.delete(String(id))}
  else{await api('ebook_wishlist',{method:'POST',body:{user_id:user.id,ebook_id:id},prefer:'return=minimal'});wishlist.add(String(id));edge({action:'track',event_type:'wishlist',ebook_id:id,session_id:'web-'+Date.now()}).catch(()=>{})}
  if(btn){btn.classList.toggle('active',!active);btn.textContent=!active?'♥':'♡'}decorateDetailWishlist();
}
function decorateDetailWishlist(){
  const root=$('#ebookDetail');if(!root||!detailId)return;let b=root.querySelector('.ebook-detail-wishlist');if(!b){const target=root.querySelector('.ebook-detail-actions,.ebook-price-row')||root.firstElementChild;if(target)target.insertAdjacentHTML('beforeend','<button class="ebook-detail-wishlist" data-detail-wish type="button"></button>');b=root.querySelector('[data-detail-wish]')}
  if(b){const on=wishlist.has(String(detailId));b.textContent=(on?'♥':'♡')+' Wishlist';b.classList.toggle('active',on);b.onclick=()=>toggleWishlist(detailId,b)}
}
async function renderReviews(){
  const host=$('#ebookCommunity');if(!host||!detailId)return;
  const reviews=await api('ebook_reviews?ebook_id=eq.'+encodeURIComponent(detailId)+'&is_approved=eq.true&select=id,rating,title,body,verified_purchase,created_at&order=created_at.desc&limit=50',{auth:false}).catch(()=>[]);
  const avg=reviews.length?(reviews.reduce((a,x)=>a+Number(x.rating||0),0)/reviews.length):0;
  let own=null;if(user?.id){const x=await api('ebook_reviews?ebook_id=eq.'+encodeURIComponent(detailId)+'&user_id=eq.'+encodeURIComponent(user.id)+'&select=id,rating,title,body,is_approved,verified_purchase&limit=1').catch(()=>[]);own=x?.[0]||null}
  host.innerHTML='<div class="ebook-extra-head"><div><span>VLERËSIMET</span><h2>Çfarë thonë lexuesit</h2></div><div class="ebook-rating-big"><strong>'+avg.toFixed(1)+'</strong><span>★ · '+reviews.length+' vlerësime</span></div></div>'+
  '<div class="ebook-review-grid">'+
  '<div class="ebook-review-list">'+(reviews.length?reviews.map(r=>'<article class="ebook-review"><div><b>'+'★'.repeat(Math.max(1,Math.min(5,Number(r.rating||0))))+'</b>'+(r.verified_purchase?'<span class="verified">✓ Blerje e verifikuar</span>':'')+'</div>'+(r.title?'<h3>'+esc(r.title)+'</h3>':'')+(r.body?'<p>'+esc(r.body)+'</p>':'')+'<small>'+new Date(r.created_at).toLocaleDateString('sq-AL')+'</small></article>').join(''):'<p class="ebook-extra-muted">Ende nuk ka review të publikuar.</p>')+'</div>'+
  '<div class="ebook-review-form">'+(user?.id?(own?'<h3>Review yt</h3><p>'+('★'.repeat(Number(own.rating||0)))+'</p><p>'+esc(own.body||own.title||'')+'</p><small>'+(own.is_approved?'Publikuar':'Në pritje për aprovim')+'</small>':'<h3>Shkruaj review</h3><label>Vlerësimi<select id="ebookReviewRating"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select></label><label>Titulli<input id="ebookReviewTitle" maxlength="120"></label><label>Komenti<textarea id="ebookReviewBody" rows="4" maxlength="2000"></textarea></label><button id="ebookReviewSubmit" class="btn btn-primary">Dërgo review</button>'):'<p>Kyçu për të lënë një review.</p><a class="btn btn-light" href="account.html">Kyçu</a>')+'</div></div>';
  $('#ebookReviewSubmit')?.addEventListener('click',submitReview);
}
async function submitReview(){
  const rating=Number($('#ebookReviewRating')?.value||5),title=$('#ebookReviewTitle')?.value.trim()||null,body=$('#ebookReviewBody')?.value.trim()||null;
  if(!body&&!title)return toast('Shkruaj një koment.');
  await api('ebook_reviews',{method:'POST',body:{user_id:user.id,ebook_id:detailId,rating,title,body,verified_purchase:false,is_approved:false},prefer:'return=minimal'});
  toast('Review u dërgua për aprovim.');renderReviews();
}
function bookCard(b){return '<a class="ebook-rec-card" href="ebook.html?id='+encodeURIComponent(b.id)+'">'+(b.cover_url?'<img src="'+esc(b.cover_url)+'" alt="">':'<div class="ebook-rec-placeholder">eBook</div>')+'<div><b>'+esc(b.title)+'</b><span>'+esc(b.author_name||'ZemZem')+'</span><strong>'+money(b.price)+'</strong></div></a>'}
async function renderRecommendationsAndExtras(){
  const host=$('#ebookRecommendations');if(!host||!detailId)return;
  const [rec,extra]=await Promise.all([edge({action:'recommendations',ebook_id:detailId}).catch(()=>({rows:[]})),edge({action:'catalog_extras'}).catch(()=>({}))]);
  const seriesIds=(extra.series_items||[]).filter(x=>String(x.ebook_id)===String(detailId)).map(x=>String(x.series_id));
  const series=(extra.series||[]).filter(x=>seriesIds.includes(String(x.id)));
  const bundleIds=(extra.bundle_items||[]).filter(x=>String(x.ebook_id)===String(detailId)).map(x=>String(x.bundle_id));
  const bundles=(extra.bundles||[]).filter(x=>bundleIds.includes(String(x.id)));
  let html='';
  if(series.length)html+='<section class="ebook-extra-block"><h2>Seria</h2>'+series.map(s=>'<div class="ebook-series-chip">📚 '+esc(s.name)+'</div>').join('')+'</section>';
  if(bundles.length)html+='<section class="ebook-extra-block"><h2>Bundles ku përfshihet</h2><div class="ebook-bundle-grid">'+bundles.map(b=>'<article class="ebook-bundle-card"><b>'+esc(b.title)+'</b><p>'+esc(b.description||'Paketë eBook')+'</p><strong>'+money(b.bundle_price)+'</strong></article>').join('')+'</div></section>';
  if(rec.rows?.length)html+='<section class="ebook-extra-block"><h2>eBook të ngjashëm</h2><div class="ebook-rec-grid">'+rec.rows.map(bookCard).join('')+'</div></section>';
  host.innerHTML=html;
}
function decorateCommerceOptions(){
  if(!detailId)return;const books=window.ZemZemEbooks?.books||[],b=books.find(x=>String(x.id)===String(detailId));if(!b)return;
  const panel=$('#ebookDetail .ebook-buy-panel');if(!panel||panel.querySelector('[data-ebook-commerce-options]')||wishlist.has('__owned__'+detailId))return;
  const owned=window.ZemZemEbooks?.owned?.has?.(String(detailId));if(owned)return;
  const rows=[];
  rows.push('<button class="btn btn-primary" type="button" data-mode-buy>Bli tani</button>');
  if(b.rental_enabled&&Number(b.rental_price||0)>0)rows.push('<button class="btn btn-light" type="button" data-mode-rental>Qira '+money(b.rental_price)+' · '+Number(b.rental_days||0)+' ditë</button>');
  if(b.allow_preorder&&b.release_at&&new Date(b.release_at)>new Date())rows.push('<button class="btn btn-light" type="button" data-mode-preorder>Pre-order · '+new Date(b.release_at).toLocaleDateString('sq-AL')+'</button>');
  rows.push('<button class="btn btn-light" type="button" data-mode-gift>🎁 Dhuro eBook</button>');
  panel.insertAdjacentHTML('beforeend','<div data-ebook-commerce-options class="ebook-commerce-options">'+rows.join('')+'</div>');
  panel.querySelector('[data-mode-buy]')?.addEventListener('click',()=>addModeToCart(detailId,'purchase'));
  panel.querySelector('[data-mode-rental]')?.addEventListener('click',()=>addModeToCart(detailId,'rental'));
  panel.querySelector('[data-mode-preorder]')?.addEventListener('click',()=>addModeToCart(detailId,'preorder'));
  panel.querySelector('[data-mode-gift]')?.addEventListener('click',()=>{const email=prompt('Emaili i personit që do ta marrë eBook-un:','')?.trim().toLowerCase();if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))addModeToCart(detailId,'gift',email);else if(email)toast('Emaili nuk është valid.')});
}

function ensureDetailSections(){
  if(!$('#ebookDetail')||$('#ebookCommunity'))return;
  const section=$('#ebookDetail').closest('.section')||$('#ebookDetail').parentElement;
  section.insertAdjacentHTML('afterend','<section class="section soft ebook-extra-section"><div class="container"><div id="ebookRecommendations"></div><div id="ebookCommunity" class="ebook-community"></div></div></section>');
}
async function init(){
  await ensure();await loadWishlist().catch(()=>{});
  detailId=new URLSearchParams(location.search).get('id')||'';
  const run=()=>{decorateCards();if(detailId){ensureDetailSections();decorateDetailWishlist();decorateCommerceOptions();renderReviews().catch(()=>{});renderRecommendationsAndExtras().catch(()=>{});edge({action:'track',event_type:'view',ebook_id:detailId,session_id:'web-'+Date.now()}).catch(()=>{})}};
  window.addEventListener('zemzem:ebooks-ready',run);setTimeout(run,250);setTimeout(run,1000);
}
init();
})();