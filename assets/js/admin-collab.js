(()=>{
'use strict';
if(window.__zzAdminCollab)return;window.__zzAdminCollab=1;
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=d=>{try{return new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d))}catch{return ''}};
async function rpc(fn,body={}){
  if(typeof window.api!=='function')throw new Error('Admin API nuk është gati.');
  return await window.api('rpc/'+fn,{method:'POST',body});
}
function currentBookId(){return q('#bookId')?.value||''}
function ensureNotes(){
  const form=q('#bookForm');const tabs=q('#zzBookEditorTabs');if(!form||!tabs||q('[data-book-tab="notes"]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.bookTab='notes';b.textContent='5. Shënime';tabs.appendChild(b);
  const p=document.createElement('section');p.className='zz-book-editor-panel';p.dataset.panel='notes';
  p.innerHTML='<div class="zz-book-panel-title"><strong>Shënime të brendshme</strong><span>Vetëm për administratorët</span></div><div class="zz-book-notes-box"><div id="zzBookNotesList" class="zz-book-notes-list"></div><form id="zzBookNotesForm" class="zz-book-note-compose"><textarea id="zzBookNoteInput" rows="3" maxlength="4000" placeholder="Shkruaj një shënim për këtë libër…"></textarea><button class="primary-btn" type="submit">Shto shënim</button></form><div id="zzBookNotesHint" class="muted-small"></div></div>';
  const actions=q('#bookForm .modal-actions');form.insertBefore(p,actions||null);
  tabs.addEventListener('click',e=>{const t=e.target.closest('[data-book-tab]');if(!t)return;const key=t.dataset.bookTab;qa('[data-book-tab]',tabs).forEach(x=>x.classList.toggle('active',x===t));qa('.zz-book-editor-panel',form).forEach(x=>x.classList.toggle('active',x.dataset.panel===key));if(key==='notes')loadBookNotes()});
  q('#zzBookNotesForm').addEventListener('submit',async e=>{e.preventDefault();const id=currentBookId(),input=q('#zzBookNoteInput');if(!id){q('#zzBookNotesHint').textContent='Ruaje librin fillimisht, pastaj mund të shtosh shënime.';return}const body=input.value.trim();if(!body)return;try{await rpc('admin_add_book_note',{p_book_id:id,p_body:body});input.value='';await loadBookNotes()}catch(err){q('#zzBookNotesHint').textContent=err.message}});
}
async function loadBookNotes(){
  const list=q('#zzBookNotesList'),hint=q('#zzBookNotesHint');if(!list)return;const id=currentBookId();
  if(!id){list.innerHTML='<div class="empty-state">Ky është libër i ri. Ruaje njëherë librin që të aktivizohen shënimet.</div>';return}
  list.innerHTML='<div class="empty-state">Duke ngarkuar…</div>';if(hint)hint.textContent='';
  try{
    const rows=await rpc('admin_list_book_notes',{p_book_id:id});
    list.innerHTML=(rows||[]).map(n=>'<article class="zz-book-note"><div class="zz-book-note-meta"><strong>'+esc(n.admin_name||n.admin_email||'Admin')+'</strong><span>'+fmt(n.created_at)+'</span></div><p>'+esc(n.body).replace(/\n/g,'<br>')+'</p><button type="button" class="zz-note-delete" data-note-id="'+esc(n.id)+'">Fshi</button></article>').join('')||'<div class="empty-state">Ende nuk ka shënime për këtë libër.</div>';
    qa('[data-note-id]',list).forEach(btn=>btn.onclick=async()=>{if(!confirm('Ta fshij këtë shënim?'))return;await rpc('admin_delete_book_note',{p_note_id:btn.dataset.noteId});await loadBookNotes()})
  }catch(err){list.innerHTML='<div class="empty-state">'+esc(err.message)+'</div>'}
}
async function loadMessages(){
  const box=q('#adminChatMessages');if(!box)return;
  try{
    const rows=await rpc('admin_list_internal_messages',{p_limit:150});
    const ordered=[...(rows||[])].reverse();
    box.innerHTML=ordered.map(m=>'<article class="zz-chat-message '+(m.mine?'mine':'')+'"><div class="zz-chat-bubble"><div class="zz-chat-meta"><strong>'+esc(m.sender_name||m.sender_email||'Admin')+'</strong><span>'+fmt(m.created_at)+'</span></div><div>'+esc(m.body).replace(/\n/g,'<br>')+'</div>'+(m.mine?'<button type="button" data-message-id="'+esc(m.id)+'">Fshi</button>':'')+'</div></article>').join('')||'<div class="empty-state">Ende nuk ka mesazhe.</div>';
    box.scrollTop=box.scrollHeight;
    qa('[data-message-id]',box).forEach(btn=>btn.onclick=async()=>{if(!confirm('Ta fshij këtë mesazh?'))return;await rpc('admin_delete_internal_message',{p_message_id:btn.dataset.messageId});await loadMessages()})
  }catch(err){box.innerHTML='<div class="empty-state">'+esc(err.message)+'</div>'}
}
function boot(){
  let tries=0;const t=setInterval(()=>{tries++;ensureNotes();if(q('#zzBookEditorTabs')||tries>60)clearInterval(t)},150);
  q('#adminChatForm')?.addEventListener('submit',async e=>{e.preventDefault();const input=q('#adminChatInput'),body=input.value.trim();if(!body)return;try{await rpc('admin_send_internal_message',{p_body:body});input.value='';await loadMessages()}catch(err){alert(err.message)}});
  q('#adminChatRefresh')?.addEventListener('click',loadMessages);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="messages"]'))setTimeout(loadMessages,50);if(e.target.closest('[data-book-id]')||e.target.closest('#newBookBtn'))setTimeout(ensureNotes,120)});
  setInterval(()=>{if(q('#view-messages')?.classList.contains('active-view'))loadMessages()},3000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();