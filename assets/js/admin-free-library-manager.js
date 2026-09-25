(()=>{
'use strict';
if(window.__zzFreeLibraryManager)return;window.__zzFreeLibraryManager=1;
const SB='https://ysvtrhizgcioyycwlkrk.supabase.co';
const KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let books=[];
function session(){try{return JSON.parse(sessionStorage.getItem('zemzem_admin_session')||'null')}catch{return null}}
function safeName(name){const ext=(String(name).split('.').pop()||'').toLowerCase();const base=String(name).replace(/\.[^.]+$/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'file';return base+'.'+ext}
async function api(path,opt={}){return window.api(path,opt)}
async function loadBooks(){books=await api('free_library_books?select=*&order=featured.desc,sort_order.asc,created_at.desc&limit=1000')||[];return books}
async function storageUpload(bucket,path,file){const s=session();if(!s?.access_token)throw new Error('Sesioni i Adminit ka skaduar.');const r=await fetch(SB+'/storage/v1/object/'+bucket+'/'+path.split('/').map(encodeURIComponent).join('/'),{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+s.access_token,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.error||'Upload dështoi')}}
async function storageDelete(bucket,path){if(!path)return;const s=session();if(!s?.access_token)return;await fetch(SB+'/storage/v1/object/'+bucket+'/'+path.split('/').map(encodeURIComponent).join('/'),{method:'DELETE',headers:{apikey:KEY,Authorization:'Bearer '+s.access_token}}).catch(()=>{})}
function ensureUI(){
 const view=q('#view-free-library');if(!view)return;
 const refresh=q('#freeLibraryRefresh');
 if(refresh&&!q('#freeLibraryAddBtn')){const b=document.createElement('button');b.type='button';b.className='primary-btn';b.id='freeLibraryAddBtn';b.textContent='＋ Shto PDF';refresh.insertAdjacentElement('beforebegin',b)}
 if(refresh&&!q('#freeLibraryPublicToggle')){
   const wrap=document.createElement('div');wrap.id='freeLibraryPublicToggle';wrap.className='zzfl-public-toggle';
   wrap.innerHTML='<span class="zzfl-public-label">Publikimi</span><button type="button" class="secondary-btn" id="freeLibraryToggleBtn">Duke kontrolluar…</button><small id="freeLibraryToggleNote">Biblioteka publike</small>';
   refresh.insertAdjacentElement('beforebegin',wrap);
 }
 if(!q('#freeLibraryManagerModal')){
  const html=
  '<div class="zzflm-modal" id="freeLibraryManagerModal" hidden>'+
    '<div class="zzflm-backdrop" data-flm-close></div>'+
    '<div class="zzflm-dialog">'+
      '<div class="zzflm-head"><div><span>BIBLIOTEKA FALAS</span><h2 id="flmTitle">Shto PDF</h2></div><button type="button" data-flm-close>×</button></div>'+
      '<form id="freeLibraryManagerForm">'+
        '<input type="hidden" name="id">'+
        '<div class="zzflm-grid">'+
          '<label class="span-2">Titulli *<input name="title" required maxlength="240"></label>'+
          '<label>Autori<input name="author_name" maxlength="180"></label>'+
          '<label>Kategoria<input name="category" maxlength="120" placeholder="p.sh. Fe & Edukim"></label>'+
          '<label>Gjuha<select name="language"><option value="sq">Shqip</option><option value="ar">Arabisht</option><option value="en">Anglisht</option><option value="fr">Frëngjisht</option><option value="de">Gjermanisht</option></select></label>'+
          '<label>Statusi<select name="status"><option value="approved">Aprovuar</option><option value="pending">Në pritje</option><option value="rejected">Refuzuar</option></select></label>'+
          '<label>Renditja<input name="sort_order" type="number" min="0" step="1" value="100"></label>'+
          '<label class="zzflm-check"><input name="featured" type="checkbox"> Featured në Ballinë</label>'+
          '<label class="span-2">Përshkrimi<textarea name="description" rows="4" maxlength="3000"></textarea></label>'+
          '<label class="span-2">PDF <small id="flmPdfNote">i detyrueshëm për material të ri</small><input name="pdf" type="file" accept="application/pdf,.pdf"></label>'+
          '<label class="span-2">Kopertina <small>JPG, PNG ose WebP</small><input name="cover" type="file" accept="image/jpeg,image/png,image/webp"></label>'+
          '<label class="zzflm-check span-2" id="flmRemoveCoverWrap" hidden><input name="remove_cover" type="checkbox"> Hiqe kopertinën ekzistuese</label>'+
        '</div>'+
        '<div class="zzflm-current" id="flmCurrentFiles"></div>'+
        '<div class="zzflm-status" id="flmStatus"></div>'+
        '<div class="zzflm-actions"><button type="button" class="secondary-btn" data-flm-close>Anulo</button><button class="primary-btn" id="flmSaveBtn">Ruaj</button></div>'+
      '</form>'+
    '</div>'+
  '</div>';
  document.body.insertAdjacentHTML('beforeend',html);
 }
}
async function loadPublicStatus(){
  const btn=q('#freeLibraryToggleBtn'),note=q('#freeLibraryToggleNote');if(!btn)return;
  try{
    const r=await api('rpc/get_free_library_public_status',{method:'POST',body:{}});
    const v=Array.isArray(r)?r[0]:r,enabled=!!v?.enabled;
    btn.dataset.enabled=enabled?'1':'0';
    btn.textContent=enabled?'Aktive':'Jo aktive';
    btn.classList.toggle('primary-btn',enabled);btn.classList.toggle('secondary-btn',!enabled);
    if(note)note.textContent=enabled?'Shfaqet publikisht':'E fshehur nga vizitorët';
  }catch(e){btn.textContent='Statusi s’u ngarkua';}
}
async function togglePublicStatus(){
  const btn=q('#freeLibraryToggleBtn');if(!btn)return;
  const next=btn.dataset.enabled!=='1';
  btn.disabled=true;btn.textContent='Duke ruajtur…';
  try{
    const r=await api('rpc/admin_set_free_library_public_status',{method:'POST',body:{p_enabled:next}});
    const v=Array.isArray(r)?r[0]:r,enabled=!!v?.enabled;
    btn.dataset.enabled=enabled?'1':'0';btn.textContent=enabled?'Aktive':'Jo aktive';
    btn.classList.toggle('primary-btn',enabled);btn.classList.toggle('secondary-btn',!enabled);
    const note=q('#freeLibraryToggleNote');if(note)note.textContent=enabled?'Shfaqet publikisht':'E fshehur nga vizitorët';
    window.toast?.(enabled?'Biblioteka Falas u aktivizua publikisht.':'Biblioteka Falas u çaktivizua publikisht.');
  }catch(e){window.toast?.(e.message||'Ndryshimi dështoi.','error');await loadPublicStatus()}
  finally{btn.disabled=false}
}
function closeModal(){const m=q('#freeLibraryManagerModal');if(m)m.hidden=true}
async function openModal(id=null){
 ensureUI();await loadBooks();
 const m=q('#freeLibraryManagerModal'),f=q('#freeLibraryManagerForm');if(!m||!f)return;
 f.reset();q('#flmStatus').textContent='';q('#flmCurrentFiles').innerHTML='';q('#flmRemoveCoverWrap').hidden=true;
 const r=id?books.find(x=>String(x.id)===String(id)):null;
 q('#flmTitle').textContent=r?'Edito materialin':'Shto PDF';
 q('#flmPdfNote').textContent=r?'lëre bosh për ta mbajtur PDF-në aktuale':'i detyrueshëm për material të ri';
 f.elements.id.value=r?.id||'';f.elements.title.value=r?.title||'';f.elements.author_name.value=r?.author_name||'';f.elements.category.value=r?.category||'';f.elements.language.value=r?.language||'sq';f.elements.status.value=r?.status||'approved';f.elements.sort_order.value=Number(r?.sort_order??100);f.elements.featured.checked=!!r?.featured;f.elements.description.value=r?.description||'';
 if(r){q('#flmCurrentFiles').innerHTML='<strong>Skedarët aktualë</strong><span>PDF: '+esc(r.original_filename||r.pdf_path||'—')+'</span><span>Kopertina: '+esc(r.cover_path||'Pa kopertinë')+'</span>';q('#flmRemoveCoverWrap').hidden=!r.cover_path}
 m.hidden=false;
}
async function save(ev){
 ev.preventDefault();const f=ev.currentTarget,st=q('#flmStatus'),btn=q('#flmSaveBtn');
 const id=f.elements.id.value||null,current=id?books.find(x=>String(x.id)===String(id)):null,pdf=f.elements.pdf.files[0]||null,cover=f.elements.cover.files[0]||null;
 if(!id&&!pdf){st.textContent='Zgjidh PDF-në.';st.className='zzflm-status error';return}
 if(pdf&&pdf.size>100*1024*1024){st.textContent='PDF-ja është mbi 100 MB.';st.className='zzflm-status error';return}
 if(cover&&cover.size>5*1024*1024){st.textContent='Kopertina është mbi 5 MB.';st.className='zzflm-status error';return}
 btn.disabled=true;st.className='zzflm-status';st.textContent='Po ruhet…';
 let newPdfPath=current?.pdf_path||null,newCoverPath=current?.cover_path||null,uploadedPdf=null,uploadedCover=null;
 try{
   const s=session();if(!s?.access_token)throw new Error('Sesioni i Adminit ka skaduar.');
   const uid=s.user?.id||'admin',stamp=Date.now();
   if(pdf){newPdfPath=uid+'/admin-'+stamp+'-'+safeName(pdf.name);uploadedPdf=newPdfPath;st.textContent='Po ngarkohet PDF-ja…';await storageUpload('free-library-pdfs',newPdfPath,pdf)}
   if(cover){newCoverPath=uid+'/admin-'+stamp+'-'+safeName(cover.name);uploadedCover=newCoverPath;st.textContent='Po ngarkohet kopertina…';await storageUpload('free-library-covers',newCoverPath,cover)}
   else if(f.elements.remove_cover.checked)newCoverPath='';
   const body={p_title:f.elements.title.value.trim(),p_author_name:f.elements.author_name.value.trim()||null,p_category:f.elements.category.value.trim()||null,p_description:f.elements.description.value.trim()||null,p_language:f.elements.language.value||'sq',p_pdf_path:newPdfPath,p_cover_path:newCoverPath,p_original_filename:pdf?pdf.name:(current?.original_filename||null),p_file_size_bytes:pdf?pdf.size:(current?.file_size_bytes||null),p_status:f.elements.status.value,p_featured:!!f.elements.featured.checked,p_sort_order:Number(f.elements.sort_order.value||100)};
   if(id){body.p_id=id;await api('rpc/admin_free_library_update',{method:'POST',body})}else await api('rpc/admin_free_library_create',{method:'POST',body});
   if(current&&uploadedPdf&&current.pdf_path&&current.pdf_path!==newPdfPath)await storageDelete('free-library-pdfs',current.pdf_path);
   if(current&&((uploadedCover&&current.cover_path&&current.cover_path!==newCoverPath)||f.elements.remove_cover.checked))await storageDelete('free-library-covers',current.cover_path);
   st.className='zzflm-status ok';st.textContent='U ruajt me sukses.';await loadBooks();q('#freeLibraryRefresh')?.click();setTimeout(closeModal,550);
 }catch(e){if(uploadedPdf)await storageDelete('free-library-pdfs',uploadedPdf);if(uploadedCover)await storageDelete('free-library-covers',uploadedCover);st.className='zzflm-status error';st.textContent=e.message||'Ruajtja dështoi.'}finally{btn.disabled=false}
}
async function removeBook(id){
 await loadBooks();const r=books.find(x=>String(x.id)===String(id));if(!r)return;
 if(!confirm('A je i sigurt që dëshiron ta fshish "'+(r.title||'këtë material')+'"?\\n\\nDo të fshihet edhe PDF-ja dhe kopertina nga Storage.'))return;
 try{const res=await api('rpc/admin_free_library_delete',{method:'POST',body:{p_id:id}});const info=Array.isArray(res)?res[0]:res;await storageDelete('free-library-pdfs',info?.pdf_path||r.pdf_path);await storageDelete('free-library-covers',info?.cover_path||r.cover_path);window.toast?.('Materiali u fshi');await loadBooks();q('#freeLibraryRefresh')?.click()}catch(e){window.toast?.(e.message,'error')}
}
function decorateRows(){
 qa('#freeLibraryAdminBody tr').forEach(tr=>{const p=q('[data-fl-preview]',tr);if(!p)return;const id=p.dataset.flPreview,actions=p.closest('.table-actions');if(!actions)return;
   if(!q('[data-fl-edit]',actions)){const b=document.createElement('button');b.type='button';b.className='table-action';b.dataset.flEdit=id;b.textContent='Edito';actions.appendChild(b)}
   if(!q('[data-fl-delete]',actions)){const b=document.createElement('button');b.type='button';b.className='table-action danger';b.dataset.flDelete=id;b.textContent='Fshi';actions.appendChild(b)}
 });
}
function bind(){
 ensureUI();
 q('#freeLibraryAddBtn')?.addEventListener('click',()=>openModal());
 q('#freeLibraryToggleBtn')?.addEventListener('click',togglePublicStatus);
 q('#freeLibraryManagerForm')?.addEventListener('submit',save);
 qa('[data-flm-close]').forEach(x=>x.addEventListener('click',closeModal));
 loadPublicStatus();
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-view="free-library"]')){
     setTimeout(()=>{ensureUI();loadPublicStatus();loadBooks().catch(()=>{})},80);
   }
   const edit=e.target.closest('[data-fl-edit]');if(edit){e.preventDefault();openModal(edit.dataset.flEdit)}
   const del=e.target.closest('[data-fl-delete]');if(del){e.preventDefault();removeBook(del.dataset.flDelete)}
 });
 const body=q('#freeLibraryAdminBody');if(body)new MutationObserver(decorateRows).observe(body,{childList:true,subtree:true});decorateRows();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();