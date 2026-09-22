(()=>{
'use strict';
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co',KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const q=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let rows=[];
function money(v){return Number(v||0).toFixed(2)+' €'}
function render(){
 const host=q('#categoryBooks'),sort=q('#categorySort')?.value||'newest';let arr=[...rows];
 if(sort==='price_asc')arr.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
 else if(sort==='price_desc')arr.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
 else if(sort==='title')arr.sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'sq'));
 else arr.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
 q('#categoryCount').textContent=arr.length+' libra';
 if(!arr.length){host.innerHTML='<div class="category-empty">Nuk ka ende libra të publikuar në këtë kategori.</div>';return}
 host.innerHTML=arr.map(b=>'<article class="category-book"><a href="product.html?id='+encodeURIComponent(b.id)+'"><div class="category-book-cover">'+(b.cover_url?'<img loading="lazy" decoding="async" src="'+esc(b.cover_url)+'" alt="'+esc(b.title)+'">':'<div>'+esc(b.title)+'</div>')+'</div><div class="category-book-body"><h3>'+esc(b.title)+'</h3><div class="category-book-author">'+esc(b.author_name||'ZemZem')+'</div><div class="category-book-bottom"><span class="category-book-price">'+money(b.price)+'</span><span class="category-book-stock">'+(Number(b.stock_quantity||0)>0?'Ka në stok':'Kontrollo disponueshmërinë')+'</span></div></div></a></article>').join('');
}
async function load(){
 const body=document.body,cat=body.dataset.category||'',slug=body.dataset.categorySlug||'';
 let filter=slug?'category_slug=eq.'+encodeURIComponent(slug):'category_name=eq.'+encodeURIComponent(cat);
 const r=await fetch(SB+'/rest/v1/storefront_books?'+filter+'&select=id,title,author_name,price,cover_url,stock_quantity,created_at&order=created_at.desc',{headers:{apikey:KEY},cache:'no-store'});
 if(!r.ok)throw new Error('Katalogu nuk u ngarkua');
 rows=await r.json()||[];render();
}
document.addEventListener('DOMContentLoaded',()=>{q('#categorySort')?.addEventListener('change',render);load().catch(()=>{q('#categoryBooks').innerHTML='<div class="category-empty">Kategoria nuk u ngarkua. Provo përsëri.</div>'})});
})();