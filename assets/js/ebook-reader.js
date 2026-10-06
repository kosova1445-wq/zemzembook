import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';

const SB_URL='https://ysvtrhizgcioyycwlkrk.supabase.co';
const SB_KEY='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
const SESSION_KEY='zemzem_customer_session';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

let session=null,user=null,entitlementId='',ebook=null,pdf=null,currentPage=1,totalPages=0,zoom=1,theme='light';
let bookmarks=[],notes=[],highlights=[],pageTextCache=new Map(),renderSeq=0,progressTimer=null,watermark={enabled:false},license={};
const DEVICE_KEY='zemzem_ebook_device_id';
function deviceId(){let v=localStorage.getItem(DEVICE_KEY)||'';if(!/^[a-z0-9-]{16,160}$/i.test(v)){v=(crypto.randomUUID?crypto.randomUUID():'zz-'+Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(DEVICE_KEY,v)}return v}
function deviceLabel(){const p=navigator.platform||'Pajisje',ua=navigator.userAgent||'';return /mobile|android|iphone|ipad/i.test(ua)?'Telefon / tablet · '+p:'Kompjuter · '+p}

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
async function refreshSession(s){
  if(!s?.refresh_token)return null;
  const r=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token}),cache:'no-store'});
  if(!r.ok)return null;
  const d=await r.json(),next={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+(Number(d.expires_in)||3600),user:d.user||null};
  localStorage.setItem(SESSION_KEY,JSON.stringify(next));return next;
}
async function ensureSession(){
  session=readSession();
  if(!session?.access_token)return false;
  if((session.expires_at||0)-Math.floor(Date.now()/1000)<90)session=await refreshSession(session);
  if(!session?.access_token)return false;
  const r=await fetch(SB_URL+'/auth/v1/user',{headers:{apikey:SB_KEY,Authorization:'Bearer '+session.access_token},cache:'no-store'});
  if(!r.ok)return false;user=await r.json();return !!user?.id;
}
async function edge(name,body){
  const r=await fetch(SB_URL+'/functions/v1/'+name,{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}
  if(!r.ok)throw new Error(d?.message||d?.error||'Kërkesa dështoi.');
  return d;
}
async function api(path,{method='GET',body,prefer}={}){
  const h={apikey:SB_KEY,Authorization:'Bearer '+session.access_token};
  if(body!==undefined)h['Content-Type']='application/json';
  if(prefer)h.Prefer=prefer;
  const r=await fetch(SB_URL+'/rest/v1/'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok)throw new Error(d?.message||d?.error||'Gabim gjatë ruajtjes.');
  return d;
}
function toast(msg){const e=$('#readerToast');e.textContent=msg;e.hidden=false;clearTimeout(window.__rt);window.__rt=setTimeout(()=>e.hidden=true,2200)}
function fail(msg){$('#readerLoading').hidden=true;$('#readerError').hidden=false;$('#readerError').innerHTML='<strong>Reader-i nuk u hap.</strong><br>'+esc(msg)+'<br><br><a href="account.html?view=ebooks">Kthehu te biblioteka</a>'}
function setTheme(v){theme=v==='dark'?'dark':'light';document.body.classList.toggle('dark',theme==='dark');scheduleProgressSave()}
function setZoom(v){zoom=Math.max(.65,Math.min(2.4,Number(v)||1));$('#readerZoomLabel').textContent=Math.round(zoom*100)+'%';renderPage(currentPage);scheduleProgressSave()}
function switchTab(name){
  document.querySelectorAll('[data-reader-tab]').forEach(b=>b.classList.toggle('active',b.dataset.readerTab===name));
  document.querySelectorAll('[data-reader-panel]').forEach(p=>p.classList.toggle('active',p.dataset.readerPanel===name));
}
async function loadReaderState(){
  const eid=encodeURIComponent(ebook.id),uid=encodeURIComponent(user.id);
  const [pr,bm,nt,hi]=await Promise.all([
    api('ebook_reader_progress?user_id=eq.'+uid+'&ebook_id=eq.'+eid+'&select=*&limit=1'),
    api('ebook_bookmarks?user_id=eq.'+uid+'&ebook_id=eq.'+eid+'&select=*&order=page_number.asc'),
    api('ebook_notes?user_id=eq.'+uid+'&ebook_id=eq.'+eid+'&select=*&order=page_number.asc,created_at.desc'),
    api('ebook_highlights?user_id=eq.'+uid+'&ebook_id=eq.'+eid+'&select=*&order=page_number.asc,created_at.desc')
  ]);
  const p=pr?.[0];if(p){currentPage=Math.max(1,Number(p.page_number)||1);zoom=Number(p.zoom)||1;theme=p.theme||'light'}
  bookmarks=bm||[];notes=nt||[];highlights=hi||[];
  setTheme(theme);$('#readerZoomLabel').textContent=Math.round(zoom*100)+'%';renderSideLists();
}
function scheduleProgressSave(){clearTimeout(progressTimer);progressTimer=setTimeout(saveProgress,500)}
async function saveProgress(){
  if(!ebook?.id||!user?.id)return;
  try{await api('ebook_reader_progress?on_conflict=user_id,ebook_id',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{user_id:user.id,ebook_id:ebook.id,page_number:currentPage,total_pages:totalPages||null,zoom,theme,updated_at:new Date().toISOString()}})}catch{}
}
function renderSideLists(){
  $('#readerBookmarks').innerHTML=bookmarks.length?bookmarks.map(x=>'<div class="reader-item" data-page="'+x.page_number+'"><button class="reader-delete" data-del-bookmark="'+x.id+'">×</button><b>Faqja '+x.page_number+'</b><small>'+esc(x.label||'Shenjë leximi')+'</small></div>').join(''):'<div class="muted">Nuk ka bookmark.</div>';
  $('#readerNotes').innerHTML=notes.length?notes.map(x=>'<div class="reader-item" data-page="'+x.page_number+'"><button class="reader-delete" data-del-note="'+x.id+'">×</button><b>Faqja '+x.page_number+'</b><small>'+esc(x.note)+'</small></div>').join(''):'<div class="muted">Nuk ka shënime.</div>';
  $('#readerHighlights').innerHTML=highlights.length?highlights.map(x=>'<div class="reader-item" data-page="'+x.page_number+'"><button class="reader-delete" data-del-highlight="'+x.id+'">×</button><b>Faqja '+x.page_number+'</b><small>“'+esc(x.quote)+'”</small></div>').join(''):'<div class="muted">Nuk ka highlights.</div>';
  document.querySelectorAll('.reader-item[data-page]').forEach(el=>el.onclick=e=>{if(e.target.closest('.reader-delete'))return;goPage(Number(el.dataset.page))});
  document.querySelectorAll('[data-del-bookmark]').forEach(b=>b.onclick=async()=>{await api('ebook_bookmarks?id=eq.'+encodeURIComponent(b.dataset.delBookmark),{method:'DELETE'});bookmarks=bookmarks.filter(x=>String(x.id)!==String(b.dataset.delBookmark));renderSideLists()});
  document.querySelectorAll('[data-del-note]').forEach(b=>b.onclick=async()=>{await api('ebook_notes?id=eq.'+encodeURIComponent(b.dataset.delNote),{method:'DELETE'});notes=notes.filter(x=>String(x.id)!==String(b.dataset.delNote));renderSideLists()});
  document.querySelectorAll('[data-del-highlight]').forEach(b=>b.onclick=async()=>{await api('ebook_highlights?id=eq.'+encodeURIComponent(b.dataset.delHighlight),{method:'DELETE'});highlights=highlights.filter(x=>String(x.id)!==String(b.dataset.delHighlight));renderSideLists()});
}
async function addBookmark(){
  if(bookmarks.some(x=>Number(x.page_number)===currentPage)){toast('Kjo faqe është ruajtur tashmë.');return}
  const rows=await api('ebook_bookmarks',{method:'POST',prefer:'return=representation',body:{user_id:user.id,ebook_id:ebook.id,page_number:currentPage,label:'Faqja '+currentPage}});
  bookmarks.push(rows?.[0]||{page_number:currentPage,label:'Faqja '+currentPage});renderSideLists();toast('Bookmark u ruajt.');
}
async function addNote(){
  const text=$('#readerNoteText').value.trim();if(!text)return toast('Shkruaj një shënim.');
  const rows=await api('ebook_notes',{method:'POST',prefer:'return=representation',body:{user_id:user.id,ebook_id:ebook.id,page_number:currentPage,note:text}});
  notes.push(rows?.[0]||{page_number:currentPage,note:text});$('#readerNoteText').value='';renderSideLists();toast('Shënimi u ruajt.');
}
async function addHighlight(){
  const sel=window.getSelection(),quote=String(sel||'').trim().replace(/\s+/g,' ');
  if(!quote)return toast('Përzgjidh tekst në faqen e librit.');
  if(quote.length>1200)return toast('Highlight është shumë i gjatë.');
  const rows=await api('ebook_highlights',{method:'POST',prefer:'return=representation',body:{user_id:user.id,ebook_id:ebook.id,page_number:currentPage,quote}});
  highlights.push(rows?.[0]||{page_number:currentPage,quote});sel.removeAllRanges();renderSideLists();toast('Highlight u ruajt.');
}
function buildTextLayer(text,viewport){
  const layer=$('#readerTextLayer');layer.innerHTML='';layer.style.width=viewport.width+'px';layer.style.height=viewport.height+'px';
  for(const item of text.items||[]){
    const span=document.createElement('span');span.textContent=item.str;
    const tx=pdfjsLib.Util.transform(viewport.transform,item.transform);
    const angle=Math.atan2(tx[1],tx[0]),fontHeight=Math.hypot(tx[2],tx[3]);
    span.style.left=tx[4]+'px';span.style.top=(tx[5]-fontHeight)+'px';span.style.fontSize=fontHeight+'px';span.style.fontFamily='sans-serif';span.style.transform='rotate('+angle+'rad)';
    layer.appendChild(span);
  }
}
async function renderPage(n){
  if(!pdf)return;const seq=++renderSeq;
  currentPage=Math.max(1,Math.min(totalPages,Number(n)||1));
  const page=await pdf.getPage(currentPage);if(seq!==renderSeq)return;
  const viewport=page.getViewport({scale:zoom}),canvas=$('#readerCanvas'),ctx=canvas.getContext('2d');
  const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
  const layer=$('#readerTextLayer');layer.style.width=viewport.width+'px';layer.style.height=viewport.height+'px';
  await page.render({canvasContext:ctx,viewport,transform:ratio===1?null:[ratio,0,0,ratio,0,0]}).promise;
  const text=await page.getTextContent();pageTextCache.set(currentPage,text.items.map(x=>x.str).join(' '));buildTextLayer(text,viewport);
  $('#readerPageInput').value=currentPage;$('#readerTotalPages').textContent=totalPages;
  const pct=totalPages?Math.round(currentPage/totalPages*100):0;$('#readerProgressLabel').textContent=pct+'%';renderWatermark();
  $('#readerPrev').disabled=currentPage<=1;$('#readerNext').disabled=currentPage>=totalPages;scheduleProgressSave();
}
function renderWatermark(){let w=$('#readerWatermark');if(!w){w=document.createElement('div');w.id='readerWatermark';w.className='reader-watermark';$('#readerPageWrap')?.appendChild(w)}const every=Math.max(1,Number(watermark?.every_pages||1)),show=watermark?.enabled&&((currentPage-1)%every===0);w.hidden=!show;if(show){w.textContent=watermark.text||'ZemZem.al';w.style.opacity=String(Math.max(.04,Math.min(.35,Number(watermark.opacity||.12))))}}
function goPage(n){renderPage(n);$('.reader-stage').scrollIntoView({behavior:'smooth',block:'start'})}
async function searchBook(){
  const q=$('#readerSearch').value.trim().toLowerCase();if(q.length<2){$('#readerSearchResults').innerHTML='Shkruaj të paktën 2 shkronja.';return}
  const root=$('#readerSearchResults');root.innerHTML='Duke kërkuar në '+totalPages+' faqe…';
  const hits=[];
  for(let n=1;n<=totalPages;n++){
    let text=pageTextCache.get(n);
    if(text==null){const p=await pdf.getPage(n),tc=await p.getTextContent();text=tc.items.map(x=>x.str).join(' ');pageTextCache.set(n,text)}
    const low=text.toLowerCase(),idx=low.indexOf(q);
    if(idx>=0){const a=Math.max(0,idx-55),b=Math.min(text.length,idx+q.length+80);hits.push({page:n,snippet:text.slice(a,b)});if(hits.length>=60)break}
  }
  root.innerHTML=hits.length?hits.map(x=>'<div class="reader-item" data-search-page="'+x.page+'"><b>Faqja '+x.page+'</b><small>'+esc(x.snippet)+'</small></div>').join(''):'Nuk u gjet rezultat.';
  document.querySelectorAll('[data-search-page]').forEach(el=>el.onclick=()=>goPage(Number(el.dataset.searchPage)));
}
function bind(){
  document.querySelectorAll('[data-reader-tab]').forEach(b=>b.onclick=()=>switchTab(b.dataset.readerTab));
  $('#readerPrev').onclick=()=>goPage(currentPage-1);$('#readerNext').onclick=()=>goPage(currentPage+1);
  $('#readerPageInput').onchange=()=>goPage($('#readerPageInput').value);
  $('#readerZoomOut').onclick=()=>setZoom(zoom-.1);$('#readerZoomIn').onclick=()=>setZoom(zoom+.1);
  $('#readerTheme').onclick=()=>setTheme(theme==='dark'?'light':'dark');
  $('#readerAddBookmark').onclick=addBookmark;$('#readerSaveNote').onclick=addNote;$('#readerSaveHighlight').onclick=addHighlight;
  $('#readerSearchBtn').onclick=searchBook;$('#readerSearch').onkeydown=e=>{if(e.key==='Enter')searchBook()};
  window.addEventListener('beforeunload',()=>{saveProgress()});
}
async function boot(){
  entitlementId=new URLSearchParams(location.search).get('entitlement')||'';
  if(!/^[0-9a-f-]{36}$/i.test(entitlementId))return fail('Mungon licenca e eBook-ut.');
  if(!await ensureSession())return fail('Duhet të kyçesh në llogarinë tënde.');
  try{
    const d=await edge('ebook-reader-session',{entitlement_id:entitlementId,device_id:deviceId(),device_label:deviceLabel()});
    if(!d?.url||!d?.ebook?.id)throw new Error('PDF-i nuk është i disponueshëm për lexim.');
    ebook=d.ebook;watermark=d.watermark||{enabled:false};license=d.license||{};$('#readerBookTitle').textContent=ebook.title||'eBook';$('#readerBookAuthor').textContent=(ebook.author_name||'ZemZem')+(license.device_limit?' · '+license.device_limit+' pajisje':'');
    await loadReaderState();
    pdf=await pdfjsLib.getDocument({url:d.url,withCredentials:false}).promise;totalPages=pdf.numPages;currentPage=Math.min(currentPage,totalPages);
    $('#readerLoading').hidden=true;$('#readerApp').hidden=false;bind();await renderPage(currentPage);
    edge('ebook-experience',{action:'track',event_type:'reader_open',ebook_id:ebook.id,session_id:'reader-'+Date.now()}).catch(()=>{});
  }catch(e){fail(e.message||'Reader-i nuk mund të hapet.')}
}
boot();
