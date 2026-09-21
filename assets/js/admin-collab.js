(()=>{
'use strict';
if(window.__zzAdminCollabV2)return;window.__zzAdminCollabV2=1;
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=d=>{try{return new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d))}catch{return ''}};
const timeAgo=d=>{if(!d)return 'offline';const sec=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/1000));if(sec<60)return 'online';if(sec<3600)return 'para '+Math.floor(sec/60)+' min';if(sec<86400)return 'para '+Math.floor(sec/3600)+' orë';return fmt(d)};
let activePeer=null, activePeerName='', users=[], unreadTotal=0, lastMessageSignature='', pollBusy=false;
async function rpc(fn,body={}){
  if(typeof window.api!=='function')throw new Error('Admin API nuk është gati.');
  return await window.api('rpc/'+fn,{method:'POST',body});
}
function currentBookId(){return q('#bookId')?.value||''}

function ensureNotes(){
  const form=q('#bookForm'),tabs=q('#zzBookEditorTabs');if(!form||!tabs||q('[data-book-tab="notes"]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.bookTab='notes';b.textContent='5. Shënime';tabs.appendChild(b);
  const p=document.createElement('section');p.className='zz-book-editor-panel';p.dataset.panel='notes';
  p.innerHTML='<div class="zz-book-panel-title"><strong>Shënime të brendshme</strong><span>Vetëm për administratorët</span></div><div class="zz-book-notes-box"><div id="zzBookNotesList" class="zz-book-notes-list"></div><form id="zzBookNotesForm" class="zz-book-note-compose"><textarea id="zzBookNoteInput" rows="3" maxlength="4000" placeholder="Shkruaj një shënim për këtë libër…"></textarea><button class="primary-btn" type="submit">Shto shënim</button></form><div id="zzBookNotesHint" class="muted-small"></div></div>';
  const actions=q('#bookForm .modal-actions');form.insertBefore(p,actions||null);
  tabs.addEventListener('click',e=>{const t=e.target.closest('[data-book-tab]');if(!t)return;const key=t.dataset.bookTab;if(key==='notes')setTimeout(loadBookNotes,10)});
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

function updateBadge(n){
  unreadTotal=Number(n)||0;
  for(const el of [q('#adminMessengerNavBadge'),q('#adminMessengerTopBadge')]){
    if(!el)continue;el.textContent=unreadTotal>99?'99+':String(unreadTotal);el.hidden=unreadTotal<1;
  }
}
function renderUsers(){
  const host=q('#adminChatUsers');if(!host)return;
  host.innerHTML=users.map(u=>{
    const active=activePeer===u.user_id;
    const unread=Number(u.unread_count)||0;
    return '<button type="button" class="zz-chat-contact '+(active?'active':'')+'" data-chat-peer="'+esc(u.user_id)+'" data-chat-name="'+esc(u.display_name||u.email||'Admin')+'">'+
      '<span class="zz-chat-avatar">'+esc((u.display_name||u.email||'A').trim().charAt(0).toUpperCase())+'<i class="zz-presence-dot '+(u.online?'online':'')+'"></i></span>'+
      '<span class="zz-chat-contact-copy"><strong>'+esc(u.display_name||u.email||'Admin')+'</strong><small>'+(u.online?'Online':esc(timeAgo(u.last_seen_at)))+' · '+esc(u.role||'admin')+'</small></span>'+
      (unread?'<span class="zz-chat-unread">'+(unread>99?'99+':unread)+'</span>':'')+
    '</button>';
  }).join('')||'<div class="empty-state">Nuk ka administratorë të tjerë aktivë.</div>';
}
function setThreadHeader(){
  const mode=q('#adminChatModeLabel'),title=q('#adminChatTitle'),sub=q('#adminChatSubtitle'),input=q('#adminChatInput');
  if(activePeer){
    const u=users.find(x=>x.user_id===activePeer);
    if(mode)mode.textContent='BISEDË PRIVATE';
    if(title)title.textContent=activePeerName||u?.display_name||'Admin';
    if(sub)sub.textContent=u?.online?'Online tani':'Statusi: '+timeAgo(u?.last_seen_at);
    if(input)input.placeholder='Shkruaj mesazh privat…';
  }else{
    if(mode)mode.textContent='CHAT I PËRBASHKËT';
    if(title)title.textContent='Messenger i administratorëve';
    if(sub)sub.textContent='Vetëm administratorët e ZemZem mund t’i shohin këto mesazhe.';
    if(input)input.placeholder='Shkruaj mesazh për administratorët…';
  }
}
async function refreshRoster(){
  try{
    await rpc('admin_touch_presence',{});
    users=await rpc('admin_chat_users',{})||[];
    renderUsers();
    const online=users.filter(x=>x.online).length+1;
    if(q('#adminOnlineCount'))q('#adminOnlineCount').textContent=online+' online';
    updateBadge(await rpc('admin_chat_unread_total',{}));
  }catch{}
}
async function loadMessages(force=false){
  const box=q('#adminChatMessages');if(!box||pollBusy)return;pollBusy=true;
  try{
    const rows=await rpc('admin_list_internal_messages_v2',{p_limit:150,p_peer_user_id:activePeer});
    const ordered=[...(rows||[])].reverse();
    const signature=ordered.map(x=>x.id).join('|');
    if(force||signature!==lastMessageSignature){
      const stickToBottom=box.scrollHeight-box.scrollTop-box.clientHeight<100||force;
      box.innerHTML=ordered.map(m=>'<article class="zz-chat-message '+(m.mine?'mine':'')+'"><div class="zz-chat-bubble"><div class="zz-chat-meta"><strong>'+esc(m.sender_name||m.sender_email||'Admin')+'</strong><span>'+fmt(m.created_at)+'</span></div><div>'+esc(m.body).replace(/\n/g,'<br>')+'</div>'+(m.mine?'<button type="button" data-message-id="'+esc(m.id)+'">Fshi</button>':'')+'</div></article>').join('')||'<div class="empty-state">Ende nuk ka mesazhe në këtë bisedë.</div>';
      if(stickToBottom)box.scrollTop=box.scrollHeight;
      qa('[data-message-id]',box).forEach(btn=>btn.onclick=async()=>{if(!confirm('Ta fshij këtë mesazh?'))return;await rpc('admin_delete_internal_message',{p_message_id:btn.dataset.messageId});lastMessageSignature='';await loadMessages(true);await refreshRoster()});
      lastMessageSignature=signature;
    }
    await refreshRoster();
  }catch(err){
    if(force)box.innerHTML='<div class="empty-state">'+esc(err.message)+'</div>';
  }finally{pollBusy=false}
}
function selectPeer(peer,name=''){
  activePeer=peer||null;activePeerName=name||'';
  qa('[data-chat-peer]').forEach(el=>el.classList.toggle('active',(el.dataset.chatPeer||null)===activePeer));
  setThreadHeader();lastMessageSignature='';loadMessages(true);
}
async function sendMessage(){
  const input=q('#adminChatInput'),body=input?.value.trim();if(!body)return;
  const btn=q('#adminChatForm button[type="submit"]');if(btn)btn.disabled=true;
  try{
    await rpc('admin_send_internal_message_v2',{p_body:body,p_recipient_user_id:activePeer});
    input.value='';lastMessageSignature='';await loadMessages(true);
  }catch(err){alert(err.message)}finally{if(btn)btn.disabled=false;input?.focus()}
}
function bindChat(){
  q('#adminChatForm')?.addEventListener('submit',async e=>{e.preventDefault();await sendMessage()});
  q('#adminChatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}});
  q('#adminChatRefresh')?.addEventListener('click',async()=>{await refreshRoster();lastMessageSignature='';await loadMessages(true)});
  document.addEventListener('click',e=>{
    const peer=e.target.closest('[data-chat-peer]');
    if(peer){selectPeer(peer.dataset.chatPeer||null,peer.dataset.chatName||'');return}
    if(e.target.closest('[data-view="messages"]'))setTimeout(async()=>{await refreshRoster();await loadMessages(true)},60);
    if(e.target.closest('[data-book-id]')||e.target.closest('#newBookBtn'))setTimeout(ensureNotes,120);
  });
}
async function heartbeat(){
  try{
    await rpc('admin_touch_presence',{});
    if(document.visibilityState==='visible'){
      await refreshRoster();
      if(q('#view-messages')?.classList.contains('active-view'))await loadMessages(false);
    }
  }catch{}
}
function boot(){
  let tries=0;const t=setInterval(()=>{tries++;ensureNotes();if(q('#zzBookEditorTabs')||tries>60)clearInterval(t)},150);
  bindChat();
  setTimeout(heartbeat,1000);
  setInterval(heartbeat,5000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')heartbeat()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();