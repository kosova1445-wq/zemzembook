(()=>{
  const q=s=>document.querySelector(s);
  const oldReset=window.resetBookForm;
  const normIsbn=v=>String(v||'').toUpperCase().replace(/[^0-9X]/g,'');
  const makeSlug=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  async function bookKeys(){
    try{return await window.api('books?select=id,sku,slug,isbn,title&order=created_at.asc&limit=2000')||[]}catch{return[]}
  }
  function nextSku(rows=[]){
    let max=0;
    rows.forEach(r=>{const m=/^ZZ-(\d+)$/i.exec(String(r.sku||'').trim());if(m)max=Math.max(max,Number(m[1])||0)});
    let n=max+1,sku='';
    const used=new Set(rows.map(r=>String(r.sku||'').trim().toUpperCase()));
    do{sku=`ZZ-${String(n++).padStart(4,'0')}`}while(used.has(sku));
    return sku;
  }
  function uniqueSlug(base,rows=[],currentId=''){
    const root=makeSlug(base)||'liber';
    const used=new Set(rows.filter(r=>String(r.id)!==String(currentId||'')).map(r=>String(r.slug||'').trim()));
    if(!used.has(root))return root;
    let n=2;while(used.has(`${root}-${n}`))n++;
    return `${root}-${n}`;
  }
  function friendlyUniqueError(message=''){
    const m=String(message||'');
    if(m.includes('books_sku_key'))return 'Ky SKU ekziston te një libër tjetër. Përdor një SKU tjetër ose kliko “Gjenero SKU”.';
    if(m.includes('books_slug_key'))return 'Ky Slug ekziston te një libër tjetër. Ndrysho titullin ose Slug-un.';
    if(m.includes('books_isbn_key'))return 'Ky ISBN ekziston te një libër tjetër. Kontrollo ISBN-në para ruajtjes.';
    return m||'Libri nuk u ruajt.';
  }
  function installHelpers(){
    const sku=q('#bookSku');if(!sku||q('#bookSkuHelp'))return;
    sku.setAttribute('autocomplete','off');
    sku.insertAdjacentHTML('afterend','<div id="bookSkuHelp" class="muted-small" style="margin-top:5px">SKU gjenerohet automatikisht. Mund ta ndryshosh manualisht. <button type="button" class="table-action small-btn" id="regenBookSku" style="margin-left:6px">Gjenero SKU</button></div>');
    sku.addEventListener('blur',()=>sku.value=sku.value.trim().toUpperCase());
    q('#regenBookSku').onclick=async()=>{const rows=await bookKeys();sku.value=nextSku(rows)};
    const isbn=q('#bookIsbn');if(isbn&&!q('#bookIsbnHelp'))isbn.insertAdjacentHTML('afterend','<div id="bookIsbnHelp" class="muted-small" style="margin-top:5px">ISBN duhet të jetë unik. Nëse libri nuk ka ISBN, lëre bosh.</div>');
  }
  async function fillNewSku(){
    const sku=q('#bookSku');if(!sku||q('#bookId')?.value)return;
    const rows=await bookKeys();
    if(!q('#bookId')?.value&&!sku.value.trim())sku.value=nextSku(rows);
  }
  function loadReviewManager(){
    if(document.querySelector('script[data-admin-reviews]'))return;
    const s=document.createElement('script');s.src='assets/js/admin-reviews.js?v=1';s.defer=true;s.dataset.adminReviews='1';document.head.appendChild(s);
  }
  function loadHomeBooksManager(){
    if(document.querySelector('script[data-admin-home-books]'))return;
    const s=document.createElement('script');s.src='assets/js/admin-home-books.js?v=1';s.defer=true;s.dataset.adminHomeBooks='1';document.head.appendChild(s);
  }

  if(typeof oldReset==='function')window.resetBookForm=function(){
    oldReset();
    if(q('#bookStatus'))q('#bookStatus').value='published';
    installHelpers();
    fillNewSku();
  };

  window.saveBook=async function(e){
    e?.preventDefault?.();
    const id=q('#bookId')?.value||null;
    const rows=await bookKeys();
    const title=q('#bookTitle')?.value.trim()||'';
    let sku=(q('#bookSku')?.value||'').trim().toUpperCase();
    let slug=(q('#bookSlug')?.value||'').trim();
    const isbn=(q('#bookIsbn')?.value||'').trim();
    const currentRows=rows.filter(r=>String(r.id)!==String(id||''));

    if(!title){window.toast?.('Shkruaje titullin e librit.','error');return}
    if(!sku)sku=nextSku(rows);
    const skuDup=currentRows.find(r=>String(r.sku||'').trim().toUpperCase()===sku);
    if(skuDup){
      if(!id){sku=nextSku(rows);q('#bookSku').value=sku}
      else{window.toast?.(`Ky SKU përdoret nga “${skuDup.title||'një libër tjetër'}”.`,'error');q('#bookSku')?.focus();return}
    }
    slug=uniqueSlug(slug||title,rows,id);
    q('#bookSku').value=sku;
    q('#bookSlug').value=slug;

    if(isbn){
      const normalized=normIsbn(isbn);
      const isbnDup=currentRows.find(r=>r.isbn&&normIsbn(r.isbn)===normalized);
      if(isbnDup){window.toast?.(`Ky ISBN përdoret tashmë nga “${isbnDup.title||'një libër tjetër'}”.`,'error');q('#bookIsbn')?.focus();return}
    }

    const price=Number(q('#bookPrice')?.value);
    if(!Number.isFinite(price)||price<0){window.toast?.('Vendos një çmim të vlefshëm.','error');q('#bookPrice')?.focus();return}
    const provisionalId=id||crypto.randomUUID();
    const saveBtn=q('#saveBookBtn');if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Duke ruajtur…'}
    try{
      const [cover,galleryUrls]=await Promise.all([
        window.uploadCover(q('#bookCover')?.files?.[0],provisionalId),
        window.uploadGalleryImages(provisionalId)
      ]);
      const body={id:provisionalId,sku,isbn:isbn||null,title,slug,short_description:q('#bookShort').value.trim()||null,description:q('#bookDescription').value.trim()||null,author_id:q('#bookAuthor').value||null,category_id:q('#bookCategory').value||null,publisher_id:q('#bookPublisher').value||null,price,compare_at_price:q('#bookOldPrice').value?Number(q('#bookOldPrice').value):null,badge_text:q('#bookBadgeText')?.value.trim()||null,badge_style:q('#bookBadgeStyle')?.value||'default',offer_ends_at:q('#bookOfferEnds')?.value?new Date(q('#bookOfferEnds').value).toISOString():null,format:q('#bookFormat').value,language:q('#bookLanguage').value.trim()||'sq',pages:q('#bookPages').value?Number(q('#bookPages').value):null,release_date:q('#bookReleaseDate')?.value||null,country:q('#bookCountry')?.value.trim()||null,dimensions:q('#bookDimensions')?.value.trim()||null,weight_grams:q('#bookWeight')?.value?Number(q('#bookWeight').value):null,cover_url:cover,gallery_urls:galleryUrls,status:q('#bookStatus').value,is_featured:q('#bookFeatured').checked,is_bestseller:q('#bookBestseller').checked,is_preorder:q('#bookPreorder').checked,track_stock:q('#bookTrackStock').checked,stock_quantity:Number(q('#bookStock').value||0),low_stock_threshold:Number(q('#bookLowStock').value||5),updated_at:new Date().toISOString()};
      if(id)delete body.id;
      if(id)await window.api(`books?id=eq.${id}`,{method:'PATCH',body,prefer:'return=minimal'});
      else await window.api('books',{method:'POST',body,prefer:'return=minimal'});
      await window.logAudit(id?'update_book':'create_book','book',id||provisionalId,{title:body.title,sku:body.sku,status:body.status,stock_quantity:body.stock_quantity,gallery_images:galleryUrls.length});
      q('#bookModal').hidden=true;
      await Promise.all([window.loadBooks(),window.loadAudit()]);
      window.renderBooks();window.renderDashboard();window.renderAudit();window.toast(id?'Libri u përditësua':'Libri i ri u shtua');
    }catch(err){window.toast?.(friendlyUniqueError(err?.message),'error')}
    finally{if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='Ruaj librin'}}
  };

  document.addEventListener('DOMContentLoaded',()=>{
    installHelpers();loadReviewManager();loadHomeBooksManager();
    const title=q('#bookTitle');
    if(title)title.addEventListener('blur',async()=>{
      if(q('#bookId')?.value||q('#bookSlug')?.dataset.manual)return;
      const rows=await bookKeys();q('#bookSlug').value=uniqueSlug(title.value,rows,'');
    });
  });
})();
