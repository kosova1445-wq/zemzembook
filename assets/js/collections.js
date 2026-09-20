(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD',q=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>Number(n||0).toFixed(2)+' €';
async function api(path){const r=await fetch(SB+'/rest/v1/'+path,{headers:{apikey:KEY},cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
async function init(){
 const slug=new URLSearchParams(location.search).get('slug');const root=q('#collectionsRoot');
 try{
  if(!slug){const cs=await api('book_collections?is_active=eq.true&select=*&order=sort_order.asc,name.asc');root.innerHTML=cs.map(c=>`<a class="collection-card" href="collections.html?slug=${encodeURIComponent(c.slug)}"><div class="collection-cover">${c.cover_url?`<img src="${esc(c.cover_url)}" alt="">`:'📚'}</div><div><h3>${esc(c.name)}</h3><p>${esc(c.description||'')}</p></div></a>`).join('')||'<div class="empty">Nuk ka koleksione aktive.</div>';return}
  const cs=await api('book_collections?slug=eq.'+encodeURIComponent(slug)+'&is_active=eq.true&select=*&limit=1'),c=cs?.[0];if(!c)throw new Error('Collection nuk u gjet');
  q('#collectionsTitle').textContent=c.name;q('#collectionsIntro').textContent=c.description||'';
  const items=await api('book_collection_items?collection_id=eq.'+c.id+'&select=book_id,sort_order&order=sort_order.asc');const ids=items.map(x=>x.book_id);
  if(!ids.length){root.innerHTML='<div class="empty">Ky collection nuk ka libra ende.</div>';return}
  const bs=await api('storefront_books?id=in.('+ids.join(',')+')&select=id,title,slug,price,cover_url,author_name,status');
  const map=new Map(bs.map(x=>[x.id,x]));const ordered=items.map(i=>map.get(i.book_id)).filter(Boolean);
  root.className='book-grid';root.innerHTML=ordered.map(b=>`<article class="book-card"><a href="product.html?slug=${encodeURIComponent(b.slug)}"><div class="book-cover">${b.cover_url?`<img class="book-cover-img" src="${esc(b.cover_url)}" alt="${esc(b.title)}">`:esc(b.title)}</div></a><div class="book-meta"><h3>${esc(b.title)}</h3><div class="author">${esc(b.author_name||'')}</div><div class="price-row"><span class="price">${money(b.price)}</span><a class="add-btn" href="product.html?slug=${encodeURIComponent(b.slug)}">→</a></div></div></article>`).join('');
 }catch(e){root.innerHTML='<div class="empty">'+esc(e.message)+'</div>'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();