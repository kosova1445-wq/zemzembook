const SUPABASE_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';

const FALLBACK_BOOKS=[
{id:1,legacyId:1,sku:'ZZ-0001',title:'Kurani Fisnik – Përkthim Shqip',author:'ZemZem',price:12.90,old:15.90,cover:'c1',cat:'Fe & Edukim',stock:50,trackStock:true,isbn:'',description:'Botim shembull në gjuhën shqipe.',featured:true,bestseller:true},
{id:2,legacyId:2,sku:'ZZ-0002',title:'Rijadus Salihin',author:'Imam en-Nevevi',price:18.50,old:null,cover:'c2',cat:'Fe & Edukim',stock:40,trackStock:true,isbn:'',description:'Përmbledhje e njohur e haditheve.',featured:true,bestseller:true},
{id:3,legacyId:3,sku:'ZZ-0003',title:'Dyzet Hadithe',author:'Imam en-Nevevi',price:7.90,old:9.90,cover:'c3',cat:'Fe & Edukim',stock:60,trackStock:true,isbn:'',description:'Dyzet hadithet e Imam en-Neveviut.',featured:true,bestseller:false},
{id:4,legacyId:4,sku:'ZZ-0004',title:'Jeta e Profetit Muhamed ﷺ',author:'ZemZem',price:14.90,old:null,cover:'c4',cat:'Histori',stock:35,trackStock:true,isbn:'',description:'Biografi e shkurtër për jetën e Profetit Muhamed ﷺ.',featured:true,bestseller:true},
{id:5,legacyId:5,sku:'ZZ-0005',title:'Tefsiri i Shkurtër',author:'ZemZem',price:16.90,old:19.90,cover:'c5',cat:'Fe & Edukim',stock:45,trackStock:true,isbn:'',description:'Koment i përmbledhur për lexim të lehtë.',featured:true,bestseller:true},
{id:6,legacyId:6,sku:'ZZ-0006',title:'Edukimi i Fëmijëve',author:'ZemZem',price:9.90,old:null,cover:'c6',cat:'Fëmijë',stock:30,trackStock:true,isbn:'',description:'Udhëzime praktike për edukimin e fëmijëve.',featured:false,bestseller:true},
{id:7,legacyId:7,sku:'ZZ-0007',title:'Udhëzuesi i Namazit',author:'ZemZem',price:6.90,old:8.50,cover:'c7',cat:'Fe & Edukim',stock:70,trackStock:true,isbn:'',description:'Udhëzues praktik për namazin.',featured:false,bestseller:true},
{id:8,legacyId:8,sku:'ZZ-0008',title:'Etika Islame',author:'ZemZem',price:11.90,old:null,cover:'c8',cat:'Fe & Edukim',stock:25,trackStock:true,isbn:'',description:'Parime të etikës dhe sjelljes islame.',featured:false,bestseller:false},
{id:9,legacyId:9,sku:'ZZ-0009',title:'Histori nga Profetët',author:'ZemZem',price:13.50,old:15.00,cover:'c9',cat:'Fëmijë',stock:32,trackStock:true,isbn:'',description:'Tregime edukative nga historia e profetëve.',featured:false,bestseller:false},
{id:10,legacyId:10,sku:'ZZ-0010',title:'Fjalori Arabisht–Shqip',author:'ZemZem',price:21.90,old:null,cover:'c10',cat:'Gjuhë të huaja',stock:20,trackStock:true,isbn:'',description:'Fjalor praktik arabisht–shqip.',featured:false,bestseller:false}
];

let BOOKS=[...FALLBACK_BOOKS];
let CATALOG_SOURCE='fallback';
const SHIPPING={KS:3,AL:6,MK:6};
const PAYPAL_DISCOUNT=.10;
const COD_FEE=2;

function esc(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function money(n){return Number(n||0).toFixed(2)+' €'}
function legacyIdFromSku(sku=''){const m=String(sku).match(/(\d+)$/);return m?Number(m[1]):null}
function mapDbBook(r){return {id:String(r.id),legacyId:legacyIdFromSku(r.sku),sku:r.sku||'',title:r.title||'',author:r.author_name||'ZemZem',price:Number(r.price||0),old:r.compare_at_price===null?null:Number(r.compare_at_price),cover:r.cover_theme||'c1',cat:r.category_name||'Të tjera',stock:Number(r.stock_quantity||0),trackStock:r.track_stock!==false,isbn:r.isbn||'',description:r.description||r.short_description||'',featured:!!r.is_featured,bestseller:!!r.is_bestseller,preorder:!!r.is_preorder,slug:r.slug||'',createdAt:r.created_at||''}}

async function fetchCatalog(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/storefront_books?select=*&order=created_at.asc`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY},signal:controller.signal,cache:'no-store'});
    if(!res.ok)throw new Error(`Catalog HTTP ${res.status}`);
    const rows=await res.json();
    if(!Array.isArray(rows)||!rows.length)throw new Error('Catalog empty');
    BOOKS=rows.map(mapDbBook);
    CATALOG_SOURCE='supabase';
  }catch(err){
    console.warn('ZemZem catalog fallback:',err?.message||err);
    BOOKS=[...FALLBACK_BOOKS];
    CATALOG_SOURCE='fallback';
  }finally{clearTimeout(timer)}
}

function getBook(id){const raw=String(id??'');let b=BOOKS.find(x=>String(x.id)===raw);if(!b&&/^\d+$/.test(raw))b=BOOKS.find(x=>x.legacyId===Number(raw));return b}
function getCart(){try{const c=JSON.parse(localStorage.getItem('zemzem_cart')||'[]');return Array.isArray(c)?c:[]}catch{return[]}}
function setCart(c){localStorage.setItem('zemzem_cart',JSON.stringify(c));updateCartBadge()}
function normalizeCart(){const out=[];for(const item of getCart()){const b=getBook(item.id);if(!b)continue;const max=b.trackStock?Math.max(0,b.stock):9999;const qty=Math.min(max,Math.max(1,Number(item.qty)||1));if(qty>0)out.push({id:b.id,qty})}setCart(out)}
function updateCartBadge(){const n=getCart().reduce((s,x)=>s+(Number(x.qty)||0),0);document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=n)}

function addToCart(id,qty=1){const b=getBook(id);if(!b)return;const max=b.trackStock?Math.max(0,b.stock):9999;if(max<=0){toast('Ky libër nuk është në stok');return}const cart=getCart();const found=cart.find(x=>String(x.id)===String(b.id));const add=Math.max(1,Number(qty)||1);if(found)found.qty=Math.min(max,Number(found.qty||0)+add);else cart.push({id:b.id,qty:Math.min(max,add)});setCart(cart);renderCart();renderCheckoutSummary();toast(`${b.title} u shtua në shportë`)}
function buyNow(id){addToCart(id,Number(document.getElementById('productQty')?.value||1));location.href='checkout.html'}
function toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';Object.assign(t.style,{position:'fixed',right:'18px',bottom:'18px',background:'#233a4a',color:'#fff',padding:'12px 16px',borderRadius:'12px',zIndex:9999,boxShadow:'0 15px 40px rgba(0,0,0,.2)',fontWeight:'700',fontSize:'13px'});document.body.appendChild(t)}t.textContent=msg;t.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.style.display='none',1800)}

function bookCard(b){const unavailable=b.trackStock&&b.stock<=0;const tag=b.old?'OFERTË':unavailable?'S’KA STOK':'NË STOK';return `<article class="book-card"><span class="sale-tag">${tag}</span><a href="product.html?id=${encodeURIComponent(b.id)}" aria-label="${esc(b.title)}"><div class="book-cover ${esc(b.cover)}"><span>${esc(b.title)}</span></div></a><div class="book-meta"><div class="rating">★★★★★</div><h3><a href="product.html?id=${encodeURIComponent(b.id)}">${esc(b.title)}</a></h3><div class="author">${esc(b.author)}</div><div class="price-row"><div><span class="price">${money(b.price)}</span>${b.old?`<span class="old">${money(b.old)}</span>`:''}</div><button class="add-btn" ${unavailable?'disabled':''} onclick="addToCart('${b.id}')" aria-label="Shto në shportë">＋</button></div></div></article>`}
function renderBooks(selector,items=BOOKS){const el=document.querySelector(selector);if(el)el.innerHTML=items.map(bookCard).join('')}
function renderHomeBooks(){const featured=BOOKS.filter(b=>b.featured);const best=BOOKS.filter(b=>b.bestseller);renderBooks('#trendingBooksStatic',(featured.length?featured:BOOKS).slice(0,5));renderBooks('#bestBooksStatic',(best.length?best:BOOKS.slice(5)).slice(0,5))}

function cartDetails(){return getCart().map(i=>({...i,book:getBook(i.id)})).filter(x=>x.book)}
function cartSubtotal(){return cartDetails().reduce((s,x)=>s+x.book.price*Number(x.qty||0),0)}
function renderCart(){const box=document.getElementById('cartItems');if(!box)return;const items=cartDetails();if(!items.length){box.innerHTML='<div class="empty">Shporta është bosh. <a href="shop.html"><strong>Shfleto librat →</strong></a></div>';updateCartSummary();return}box.innerHTML=items.map(x=>`<div class="cart-item"><a href="product.html?id=${encodeURIComponent(x.book.id)}"><div class="cart-thumb ${esc(x.book.cover)}"></div></a><div><h4><a href="product.html?id=${encodeURIComponent(x.book.id)}">${esc(x.book.title)}</a></h4><div class="author">${esc(x.book.author)}</div><div class="qty"><button type="button" onclick="changeQty('${x.book.id}',-1)">−</button><strong>${x.qty}</strong><button type="button" onclick="changeQty('${x.book.id}',1)">+</button><button type="button" class="remove" onclick="removeItem('${x.book.id}')">Hiq</button></div></div><strong>${money(x.book.price*x.qty)}</strong></div>`).join('');updateCartSummary()}
function changeQty(id,d){const c=getCart();const b=getBook(id);if(!b)return;const x=c.find(i=>String(i.id)===String(b.id));if(!x)return;const max=b.trackStock?Math.max(0,b.stock):9999;x.qty=Math.min(max,Number(x.qty||0)+d);if(x.qty<=0)return removeItem(b.id);setCart(c);renderCart();renderCheckoutSummary()}
function removeItem(id){const b=getBook(id);const key=b?String(b.id):String(id);setCart(getCart().filter(i=>String(i.id)!==key));renderCart();renderCheckoutSummary()}
function updateCartSummary(){const s=cartSubtotal();const el=document.getElementById('cartSubtotal');if(el)el.textContent=money(s);const tot=document.getElementById('cartTotal');if(tot)tot.textContent=money(s)}

function calcCheckout(){const subtotal=cartSubtotal();const country=document.getElementById('country')?.value||'KS';const method=document.querySelector('input[name="payment_method"]:checked')?.value||'paypal';const shipping=subtotal>0?(SHIPPING[country]??0):0;const discount=method==='paypal'?Number((subtotal*PAYPAL_DISCOUNT).toFixed(2)):0;const cod=method==='cod'&&subtotal>0?COD_FEE:0;return{subtotal,shipping,discount,cod,total:Math.max(0,Number((subtotal-discount+shipping+cod).toFixed(2))),country,method}}
function renderCheckoutSummary(){if(!document.getElementById('coSubtotal'))return;const c=calcCheckout();document.getElementById('coSubtotal').textContent=money(c.subtotal);document.getElementById('coDiscount').textContent='− '+money(c.discount);document.getElementById('coShipping').textContent=money(c.shipping);document.getElementById('coCod').textContent=money(c.cod);document.getElementById('coTotal').textContent=money(c.total);document.querySelectorAll('.pay-option').forEach(x=>x.classList.toggle('active',x.querySelector('input')?.checked));const btn=document.getElementById('placeOrderBtn');if(btn){btn.disabled=c.subtotal<=0;btn.textContent=c.subtotal<=0?'Shporta është bosh':c.method==='paypal'?'Vazhdo me PayPal':'Porosit me Cash on Delivery'}}

async function createCodOrder(form){
  if(CATALOG_SOURCE!=='supabase')throw new Error('Katalogu nuk është lidhur me serverin. Rifresko faqen dhe provo përsëri.');
  const fd=new FormData(form);
  const items=cartDetails().map(x=>({book_id:String(x.book.id),quantity:Number(x.qty)}));
  const payload={
    payment_method:'cod',
    first_name:String(fd.get('first_name')||'').trim(),
    last_name:String(fd.get('last_name')||'').trim(),
    email:String(fd.get('email')||'').trim(),
    phone:String(fd.get('phone')||'').trim(),
    address:String(fd.get('address')||'').trim(),
    city:String(fd.get('city')||'').trim(),
    country_code:document.getElementById('country')?.value||'KS',
    items
  };
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const res=await fetch(`${SUPABASE_URL}/functions/v1/create-order`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},
      body:JSON.stringify(payload),
      signal:controller.signal
    });
    let data={};
    try{data=await res.json()}catch{}
    if(!res.ok||!data?.ok)throw new Error(data?.message||'Porosia nuk u krijua. Provo përsëri.');
    return data.order;
  }catch(err){
    if(err?.name==='AbortError')throw new Error('Serveri nuk u përgjigj me kohë. Provo përsëri.');
    throw err;
  }finally{clearTimeout(timer)}
}

function bindCheckout(){
  document.getElementById('country')?.addEventListener('change',renderCheckoutSummary);
  document.querySelectorAll('input[name="payment_method"]').forEach(r=>r.addEventListener('change',renderCheckoutSummary));
  document.getElementById('checkoutForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    if(cartSubtotal()<=0){toast('Shto së pari një libër në shportë');return}
    if(!form.reportValidity())return;
    const c=calcCheckout(),s=document.getElementById('successBox'),btn=document.getElementById('placeOrderBtn');
    if(c.method==='paypal'){
      s.innerHTML=`<strong>PayPal po përgatitet për aktivizim.</strong><br>Totali aktual: ${money(c.total)} me 10% zbritje mbi librat.`;
      s.style.display='block';s.scrollIntoView({behavior:'smooth',block:'center'});return;
    }
    const previous=btn?.textContent||'';
    if(btn){btn.disabled=true;btn.textContent='Duke dërguar porosinë...'}
    try{
      const order=await createCodOrder(form);
      setCart([]);renderCart();renderCheckoutSummary();
      s.innerHTML=`<strong>Porosia u pranua ✅</strong><br>Numri i porosisë: <strong>${esc(order.order_number)}</strong><br>Totali për pagesë në pranim: <strong>${money(order.total)}</strong>`;
      s.style.display='block';s.scrollIntoView({behavior:'smooth',block:'center'});
      form.querySelectorAll('input,select').forEach(el=>el.disabled=true);
      if(btn){btn.disabled=true;btn.textContent='Porosia u pranua'}
      await fetchCatalog();
    }catch(err){
      s.innerHTML=`<strong>Porosia nuk u dërgua.</strong><br>${esc(err?.message||'Provo përsëri.')}`;
      s.style.display='block';s.scrollIntoView({behavior:'smooth',block:'center'});
      if(btn){btn.disabled=false;btn.textContent=previous||'Porosit me Cash on Delivery'}
    }
  });
  renderCheckoutSummary();
}

function applyShopFilters(){const grid=document.getElementById('shopBooks');if(!grid)return;const q=(document.getElementById('shopSearch')?.value||'').trim().toLowerCase();const cats=[...document.querySelectorAll('[data-category]:checked')].map(x=>x.dataset.category);const p=document.querySelector('input[name="price_filter"]:checked')?.value||'all';let items=BOOKS.filter(b=>(!q||(`${b.title} ${b.author} ${b.cat} ${b.isbn} ${b.sku}`).toLowerCase().includes(q)))&&(!cats.length||cats.includes(b.cat))&&(p==='all'||p==='10'&&b.price<=10||p==='20'&&b.price>10&&b.price<=20||p==='20plus'&&b.price>20));const sort=document.getElementById('sortBooks')?.value||'new';if(sort==='asc')items=[...items].sort((a,b)=>a.price-b.price);if(sort==='desc')items=[...items].sort((a,b)=>b.price-a.price);if(sort==='new')items=[...items].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));renderBooks('#shopBooks',items);const c=document.getElementById('shopCount');if(c)c.textContent=items.length?`${items.length} tituj të gjetur.`:'Nuk u gjet asnjë libër me këto filtra.'}
function initShopFromUrl(){if(!document.getElementById('shopBooks'))return;const p=new URLSearchParams(location.search);const q=p.get('q')||'';const cat=p.get('category')||'';const input=document.getElementById('shopSearch');if(input)input.value=q;if(cat){const cb=[...document.querySelectorAll('[data-category]')].find(x=>x.dataset.category===cat);if(cb)cb.checked=true}}
function clearShopFilters(){const s=document.getElementById('shopSearch');if(s)s.value='';document.querySelectorAll('[data-category]').forEach(x=>x.checked=false);const all=document.querySelector('input[name="price_filter"][value="all"]');if(all)all.checked=true;const sort=document.getElementById('sortBooks');if(sort)sort.value='new';history.replaceState({},'',location.pathname);applyShopFilters()}
function bindShop(){initShopFromUrl();document.getElementById('shopSearch')?.addEventListener('input',applyShopFilters);document.querySelectorAll('[data-category],input[name="price_filter"]').forEach(x=>x.addEventListener('change',applyShopFilters));document.getElementById('sortBooks')?.addEventListener('change',applyShopFilters);document.getElementById('clearFilters')?.addEventListener('click',clearShopFilters)}
function bindHomeSearch(){const form=document.getElementById('homeSearchForm');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();const q=document.getElementById('homeSearch')?.value.trim()||'';const category=document.getElementById('homeCategory')?.value||'';const p=new URLSearchParams();if(q)p.set('q',q);if(category)p.set('category',category);location.href='shop.html'+(p.toString()?`?${p}`:'')})}

function renderProduct(){const root=document.getElementById('productDetail');if(!root)return;const raw=new URLSearchParams(location.search).get('id');const b=getBook(raw);if(!b){root.innerHTML='<div class="empty"><h2>Libri nuk u gjet.</h2><a class="btn btn-primary" href="shop.html">Kthehu te librat</a></div>';return}document.title=`${b.title} — ZemZem`;const unavailable=b.trackStock&&b.stock<=0;const max=b.trackStock?Math.max(1,b.stock):9999;root.innerHTML=`<div class="product-layout"><div class="product-cover-wrap"><div class="book-cover product-cover ${esc(b.cover)}"><span>${esc(b.title)}</span></div></div><div class="product-info"><div class="eyebrow">${esc(b.cat)}</div><h1>${esc(b.title)}</h1><p class="product-author">${esc(b.author)}</p><div class="product-price"><span class="price">${money(b.price)}</span>${b.old?`<span class="old">${money(b.old)}</span>`:''}</div><p class="product-desc">${esc(b.description)}</p><div class="product-facts"><span>${unavailable?'✕ Nuk ka stok':`✓ Në stok: ${b.stock}`}</span><span>SKU: ${esc(b.sku)}</span>${b.isbn?`<span>ISBN: ${esc(b.isbn)}</span>`:''}</div><div class="product-buy"><input id="productQty" type="number" min="1" max="${max}" value="1" ${unavailable?'disabled':''}><button class="btn btn-primary" type="button" ${unavailable?'disabled':''} onclick="addToCart('${b.id}',document.getElementById('productQty').value)">Shto në shportë</button><button class="btn btn-light" type="button" ${unavailable?'disabled':''} onclick="buyNow('${b.id}')">Bli tani</button></div><div class="notice">PayPal: −10% mbi librat · Cash on Delivery: +2 € · Transporti sipas shtetit.</div></div></div>`}

async function init(){updateCartBadge();bindHomeSearch();bindShop();await fetchCatalog();normalizeCart();renderHomeBooks();applyShopFilters();renderCart();bindCheckout();renderProduct();document.documentElement.dataset.catalogSource=CATALOG_SOURCE}
document.addEventListener('DOMContentLoaded',init);

window.addToCart=addToCart;
window.changeQty=changeQty;
window.removeItem=removeItem;
window.buyNow=buyNow;