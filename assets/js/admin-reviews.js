(()=>{
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let rows=[],books=[],editingId=null;

  function injectStyle(){
    if($('#adminReviewsStyle'))return;
    document.head.insertAdjacentHTML('beforeend',`<style id="adminReviewsStyle">
      .review-manager{display:grid;gap:16px}.review-editor{background:#fff;border:1px solid #e5e9ed;border-radius:14px;padding:18px}.review-editor h2{margin:0 0 4px;font-size:18px;color:#2d4050}.review-editor p{margin:0 0 16px;color:#7c8995;font-size:12px}.review-form-grid{display:grid;grid-template-columns:1.4fr 1fr .7fr .8fr;gap:12px}.review-field{display:grid;gap:6px}.review-field.span-2{grid-column:span 2}.review-field.span-4{grid-column:1/-1}.review-field label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#667887}.review-field input,.review-field select,.review-field textarea{width:100%;border:1px solid #dfe6ea;border-radius:8px;padding:10px 11px;background:#fff;color:#2e4050;outline:0}.review-field textarea{resize:vertical;min-height:110px}.review-field input:focus,.review-field select:focus,.review-field textarea:focus{border-color:#db725f;box-shadow:0 0 0 3px rgba(219,114,95,.10)}.review-actions{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:12px}.admin-review-card{background:#fff;border:1px solid #e7ecef;border-radius:12px;padding:15px 16px;margin-bottom:10px}.admin-review-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.admin-review-meta{font-size:11px;color:#7f8d99;margin-top:5px}.admin-review-stars{color:#f1a640;letter-spacing:1px}.admin-review-card h3{margin:7px 0 5px;color:#2d4050;font-size:15px}.admin-review-card p{margin:0;color:#53616c;line-height:1.55;font-size:13px}.admin-review-buttons{display:flex;gap:6px;flex-wrap:wrap}.review-empty{padding:28px;text-align:center;color:#82909b;background:#fff;border:1px dashed #dbe2e7;border-radius:12px}@media(max-width:900px){.review-form-grid{grid-template-columns:1fr 1fr}.review-field.span-4{grid-column:1/-1}}@media(max-width:620px){.review-form-grid{grid-template-columns:1fr}.review-field.span-2,.review-field.span-4{grid-column:auto}.admin-review-top{flex-direction:column}}
    </style>`);
  }

  function buildUi(){
    const view=$('#view-reviews');if(!view||$('#adminReviewManager'))return;
    view.innerHTML=`<div id="adminReviewManager" class="review-manager">
      <section class="review-editor">
        <h2 id="reviewEditorTitle">Shto recension</h2>
        <p>Zgjidh librin, shkruaj recensionin dhe publikoje direkt në faqen e produktit.</p>
        <form id="manualReviewForm">
          <div class="review-form-grid">
            <div class="review-field span-2"><label>Libri *</label><select id="manualReviewBook" required><option value="">Zgjidh librin…</option></select></div>
            <div class="review-field"><label>Emri i recensuesit *</label><input id="manualReviewerName" required placeholder="p.sh. Behar B."></div>
            <div class="review-field"><label>Vlerësimi *</label><select id="manualReviewRating"><option value="5">5 ★★★★★</option><option value="4">4 ★★★★☆</option><option value="3">3 ★★★☆☆</option><option value="2">2 ★★☆☆☆</option><option value="1">1 ★☆☆☆☆</option></select></div>
            <div class="review-field span-2"><label>Titulli</label><input id="manualReviewTitle" placeholder="p.sh. Libër shumë i mirë"></div>
            <div class="review-field"><label>Statusi</label><select id="manualReviewStatus"><option value="approved">Publikuar</option><option value="pending">Në pritje</option><option value="rejected">Refuzuar</option></select></div>
            <div class="review-field"><label>Data</label><input id="manualReviewDate" type="date"></div>
            <div class="review-field span-4"><label>Recensioni *</label><textarea id="manualReviewBody" required placeholder="Shkruaj recensionin që do të shfaqet te libri..."></textarea></div>
          </div>
          <div class="review-actions"><button type="button" class="secondary-btn" id="manualReviewReset">Pastro</button><button type="submit" class="primary-btn" id="manualReviewSave">Publiko recensionin</button></div>
        </form>
      </section>
      <section><div id="reviewsList"></div></section>
    </div>`;
    $('#manualReviewForm').addEventListener('submit',saveReview);
    $('#manualReviewReset').onclick=resetForm;
    $('#manualReviewDate').value=new Date().toISOString().slice(0,10);
  }

  async function loadData(){
    if(typeof window.api!=='function')return;
    try{
      [books,rows]=await Promise.all([
        window.api('books?select=id,title,sku,status&order=title.asc&limit=2000'),
        window.api('reviews?select=id,book_id,reviewer_name,rating,title,body,status,created_at,is_admin_created&order=created_at.desc&limit=500')
      ]);
      renderBookOptions();renderList();
    }catch(e){window.toast?.(e.message,'error')}
  }
  function renderBookOptions(){
    const s=$('#manualReviewBook');if(!s)return;const current=s.value;
    s.innerHTML='<option value="">Zgjidh librin…</option>'+books.map(b=>`<option value="${esc(b.id)}">${esc(b.title)}${b.sku?` · ${esc(b.sku)}`:''}</option>`).join('');
    if(current)s.value=current;
  }
  function labelStatus(s){return s==='approved'?'Publikuar':s==='pending'?'Në pritje':s==='rejected'?'Refuzuar':s}
  function renderList(){
    const box=$('#reviewsList');if(!box)return;
    if(!rows.length){box.innerHTML='<div class="review-empty">Ende nuk ka recensione.</div>';return}
    box.innerHTML=rows.map(r=>{
      const b=books.find(x=>String(x.id)===String(r.book_id));
      return `<article class="admin-review-card"><div class="admin-review-top"><div><div class="admin-review-stars">${'★'.repeat(Number(r.rating||0))}${'☆'.repeat(Math.max(0,5-Number(r.rating||0)))}</div><h3>${esc(r.title||'Recension')}</h3><div class="admin-review-meta"><strong>${esc(r.reviewer_name||'Klient')}</strong> · ${esc(b?.title||'Libër')} · ${r.created_at?new Intl.DateTimeFormat('sq-AL',{dateStyle:'medium'}).format(new Date(r.created_at)):''} · ${esc(labelStatus(r.status))}</div></div><div class="admin-review-buttons"><button class="table-action" type="button" data-edit-review="${r.id}">Edito</button><button class="danger-btn small-btn" type="button" data-delete-review="${r.id}">Fshi</button></div></div><p>${esc(r.body||'')}</p></article>`
    }).join('');
    box.querySelectorAll('[data-edit-review]').forEach(b=>b.onclick=()=>editReview(b.dataset.editReview));
    box.querySelectorAll('[data-delete-review]').forEach(b=>b.onclick=()=>deleteReview(b.dataset.deleteReview));
  }
  function resetForm(){
    editingId=null;$('#manualReviewForm')?.reset();
    if($('#manualReviewRating'))$('#manualReviewRating').value='5';if($('#manualReviewStatus'))$('#manualReviewStatus').value='approved';if($('#manualReviewDate'))$('#manualReviewDate').value=new Date().toISOString().slice(0,10);
    if($('#reviewEditorTitle'))$('#reviewEditorTitle').textContent='Shto recension';if($('#manualReviewSave'))$('#manualReviewSave').textContent='Publiko recensionin';
  }
  function editReview(id){
    const r=rows.find(x=>x.id===id);if(!r)return;editingId=id;
    $('#manualReviewBook').value=r.book_id||'';$('#manualReviewerName').value=r.reviewer_name||'';$('#manualReviewRating').value=String(r.rating||5);$('#manualReviewTitle').value=r.title||'';$('#manualReviewStatus').value=r.status||'approved';$('#manualReviewBody').value=r.body||'';$('#manualReviewDate').value=r.created_at?new Date(r.created_at).toISOString().slice(0,10):new Date().toISOString().slice(0,10);
    $('#reviewEditorTitle').textContent='Edito recensionin';$('#manualReviewSave').textContent='Ruaj ndryshimet';$('#reviewEditorTitle').scrollIntoView({behavior:'smooth',block:'center'});
  }
  async function saveReview(e){
    e.preventDefault();const btn=$('#manualReviewSave');if(btn)btn.disabled=true;
    try{
      const day=$('#manualReviewDate').value||new Date().toISOString().slice(0,10);
      const body={book_id:$('#manualReviewBook').value,reviewer_name:$('#manualReviewerName').value.trim(),rating:Number($('#manualReviewRating').value),title:$('#manualReviewTitle').value.trim()||null,body:$('#manualReviewBody').value.trim(),status:$('#manualReviewStatus').value,created_at:new Date(day+'T12:00:00').toISOString(),updated_at:new Date().toISOString(),is_admin_created:true,user_id:null};
      if(!body.book_id||!body.reviewer_name||!body.body)throw new Error('Plotëso librin, emrin dhe recensionin.');
      if(editingId)await window.api(`reviews?id=eq.${editingId}`,{method:'PATCH',body,prefer:'return=minimal'});else await window.api('reviews',{method:'POST',body,prefer:'return=minimal'});
      window.toast?.(editingId?'Recensioni u përditësua':'Recensioni u publikua');resetForm();await loadData();
    }catch(err){window.toast?.(err.message,'error')}finally{if(btn)btn.disabled=false}
  }
  async function deleteReview(id){
    if(!confirm('Ta fshij këtë recension?'))return;
    try{await window.api(`reviews?id=eq.${id}`,{method:'DELETE'});window.toast?.('Recensioni u fshi');await loadData()}catch(e){window.toast?.(e.message,'error')}
  }

  function init(){
    injectStyle();buildUi();
    const nav=document.querySelector('[data-view="reviews"]');if(nav)nav.addEventListener('click',()=>setTimeout(loadData,40));
    const refresh=$('#refreshBtn');if(refresh)refresh.addEventListener('click',()=>setTimeout(()=>{if($('#view-reviews')?.classList.contains('active-view'))loadData()},150));
    const original=window.renderReviews;if(typeof original==='function')window.renderReviews=function(){try{original()}catch{}setTimeout(loadData,0)};
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,120));
})();
