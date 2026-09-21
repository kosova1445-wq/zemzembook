(()=>{
'use strict';
if(window.__zzAdminCollabV3)return;window.__zzAdminCollabV3=1;
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=d=>{try{return new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d))}catch{return ''}};
const timeAgo=d=>{if(!d)return 'offline';const sec=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/1000));if(sec<60)return 'online';if(sec<3600)return 'para '+Math.floor(sec/60)+' min';if(sec<86400)return 'para '+Math.floor(sec/3600)+' orë';return fmt(d)};
let activePeer=null,activePeerName='',users=[],lastMessageSignature='',pollBusy=false,pendingFile=null,recorder=null,recordChunks=[];
async function rpc(fn,body={}){if(typeof window.api!=='function')throw new Error('Admin API nuk është gati.');return await window.api('rpc/'+fn,{method:'POST',body})}
function currentBookId(){return q('#bookId')?.value||''}

function ensureNotes(){
 const form=q('#bookForm'),tabs=q('#zzBookEditorTabs');if(!form||!tabs||q('[data-book-tab="notes"]'))return;
 const b=document.createElement('button');b.type='button';b.dataset.bookTab='notes';b.textContent='5. Shënime';tabs.appendChild(b);
 const p=document.createElement('section');p.className='zz-book-editor-panel';p.dataset.panel='notes';
 p.innerHTML='<div class="zz-book-panel-title"><strong>Shënime të brendshme</strong><span>Vetëm për administratorët</span></div><div class="zz-book-notes-box"><div id="zzBookNotesList" class="zz-book-notes-list"></div><form id="zzBookNotesForm" class="zz-book-note-compose"><textarea id="zzBookNoteInput" rows="3" maxlength="4000" placeholder="Shkruaj një shënim për këtë libër…"></textarea><button class="primary-btn" type="submit">Shto shënim</button></form><div id="zzBookNotesHint" class="muted-small"></div></div>';
 const actions=q('#bookForm .modal-actions');form.insertBefore(p,actions||null);
 tabs.addEventListener('click',e=>{const t=e.target.closest('[data-book-tab]');if(t?.dataset.bookTab==='notes')setTimeout(loadBookNotes,10)});
 q('#zzBookNotesForm').addEventListener('submit',async e=>{e.preventDefault();const id=currentBookId(),input=q('#zzBookNoteInput');if(!id){q('#zzBookNotesHint').textContent='Ruaje librin fillimisht, pastaj mund të shtosh shënime.';return}const body=input.value.trim();if(!body)return;try{await rpc('admin_add_book_note',{p_book_id:id,p_body:body});input.value='';await loadBookNotes()}catch(err){q('#zzBookNotesHint').textContent=err.message}});
}
async function loadBookNotes(){
 const list=q('#zzBookNotesList'),hint=q('#zzBookNotesHint');if(!list)return;const id=currentBookId();
 if(!id){list.innerHTML='<div class="empty-state">Ky është libër i ri. Ruaje njëherë librin që të aktivizohen shënimet.</div>';return}
 list.innerHTML='<div class="empty-state">Duke ngarkuar…</div>';if(hint)hint.textContent='';
 try{const rows=await rpc('admin_list_book_notes',{p_book_id:id});list.innerHTML=(rows||[]).map(n=>'<article class="zz-book-note"><div class="zz-book-note-meta"><strong>'+esc(n.admin_name||'Admin')+'</strong><span>'+fmt(n.created_at)+'</span></div><p>'+esc(n.body).replace(/\n/g,'<br>')+'</p><button type="button" class="zz-note-delete" data-note-id="'+esc(n.id)+'">Fshi</button></article>').join('')||'<div class="empty-state">Ende nuk ka shënime për këtë libër.</div>';qa('[data-note-id]',list).forEach(btn=>btn.onclick=async()=>{if(!confirm('Ta fshij këtë shënim?'))return;await rpc('admin_delete_book_note',{p_note_id:btn.dataset.noteId});await loadBookNotes()})}catch(err){list.innerHTML='<div class="empty-state">'+esc(err.message)+'</div>'}
}

function updateBadge(n){for(const el of [q('#adminMessengerNavBadge'),q('#adminMessengerTopBadge')]){if(!el)continue;const v=Number(n)||0;el.textContent=v>99?'99+':String(v);el.hidden=v<1}}
function renderUsers(){
 const host=q('#adminChatUsers');if(!host)return;
 host.innerHTML=users.map(u=>'<button type="button" class="zz-chat-contact '+(activePeer===u.user_id?'active':'')+'" data-chat-peer="'+esc(u.user_id)+'" data-chat-name="'+esc(u.display_name||u.email||'Admin')+'"><span class="zz-chat-avatar">'+esc((u.display_name||u.email||'A').trim().charAt(0).toUpperCase())+'<i class="zz-presence-dot '+(u.online?'online':'')+'"></i></span><span class="zz-chat-contact-copy"><strong>'+esc(u.display_name||u.email||'Admin')+'</strong><small>'+(u.online?'Online':esc(timeAgo(u.last_seen_at)))+' · '+esc(u.role||'admin')+'</small></span>'+(Number(u.unread_count)?'<span class="zz-chat-unread">'+Math.min(99,Number(u.unread_count))+'</span>':'')+'</button>').join('')||'<div class="empty-state">Nuk ka administratorë të tjerë aktivë.</div>';
}
function setThreadHeader(){
 const mode=q('#adminChatModeLabel'),title=q('#adminChatTitle'),sub=q('#adminChatSubtitle'),input=q('#adminChatInput');
 if(activePeer){const u=users.find(x=>x.user_id===activePeer);if(mode)mode.textContent='BISEDË PRIVATE';if(title)title.textContent=activePeerName||u?.display_name||'Admin';if(sub)sub.textContent=u?.online?'Online tani':'Statusi: '+timeAgo(u?.last_seen_at);if(input)input.placeholder='Shkruaj mesazh privat…'}
 else{if(mode)mode.textContent='CHAT I PËRBASHKËT';if(title)title.textContent='Messenger i administratorëve';if(sub)sub.textContent='Përdor @emri për ta njoftuar një administrator.';if(input)input.placeholder='Shkruaj mesazh për administratorët…'}
}
async function refreshRoster(){
 try{await rpc('admin_touch_presence',{});users=await rpc('admin_chat_users',{})||[];renderUsers();if(q('#adminOnlineCount'))q('#adminOnlineCount').textContent=(users.filter(x=>x.online).length+1)+' online';updateBadge(await rpc('admin_chat_unread_total',{}))}catch{}
}
function attachmentMarkup(m){
 if(!m.attachment_path)return '';
 const isAudio=String(m.attachment_type||'').startsWith('audio/');
 return '<div class="zz-chat-attachment">'+(isAudio?'<button type="button" data-play-audio="'+esc(m.attachment_path)+'">▶ Voice note</button>':'<button type="button" data-download-attachment="'+esc(m.attachment_path)+'" data-file-name="'+esc(m.attachment_name||'skedar')+'">📎 '+esc(m.attachment_name||'Skedar')+'</button>')+(m.attachment_size?' <small>'+Math.ceil(Number(m.attachment_size)/1024)+' KB</small>':'')+'</div>';
}
async function loadMessages(force=false){
 const box=q('#adminChatMessages');if(!box||pollBusy)return;pollBusy=true;
 try{
  const rows=await rpc('admin_list_internal_messages_v3',{p_limit:150,p_peer_user_id:activePeer});
  const ordered=[...(rows||[])].reverse(),signature=ordered.map(x=>x.id+':'+x.pinned).join('|');
  if(force||signature!==lastMessageSignature){
   const stick=box.scrollHeight-box.scrollTop-box.clientHeight<100||force;
   box.innerHTML=ordered.map(m=>'<article class="zz-chat-message '+(m.mine?'mine':'')+'"><div class="zz-chat-bubble">'+(m.pinned?'<div class="zz-chat-pin-label">📌 Pinned</div>':'')+'<div class="zz-chat-meta"><strong>'+esc(m.sender_name||m.sender_email||'Admin')+'</strong><span>'+fmt(m.created_at)+'</span></div>'+(m.body?'<div>'+esc(m.body).replace(/\n/g,'<br>')+'</div>':'')+attachmentMarkup(m)+'<div class="zz-chat-msg-actions"><button type="button" data-pin-message="'+esc(m.id)+'">'+(m.pinned?'Hiq pin':'📌 Pin')+'</button>'+(m.mine?'<button type="button" data-message-id="'+esc(m.id)+'">Fshi</button>':'')+'</div></div></article>').join('')||'<div class="empty-state">Ende nuk ka mesazhe në këtë bisedë.</div>';
   if(stick)box.scrollTop=box.scrollHeight;
   qa('[data-message-id]',box).forEach(btn=>btn.onclick=async()=>{if(!confirm('Ta fshij këtë mesazh?'))return;await rpc('admin_delete_internal_message',{p_message_id:btn.dataset.messageId});lastMessageSignature='';await loadMessages(true)});
   qa('[data-pin-message]',box).forEach(btn=>btn.onclick=async()=>{await rpc('admin_message_pin_toggle',{p_message_id:btn.dataset.pinMessage});lastMessageSignature='';await loadMessages(true)});
   qa('[data-download-attachment]',box).forEach(btn=>btn.onclick=async()=>{const blob=await window.zzAdminStorageBlob(btn.dataset.downloadAttachment),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=btn.dataset.fileName||'skedar';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)});
   qa('[data-play-audio]',box).forEach(btn=>btn.onclick=async()=>{const blob=await window.zzAdminStorageBlob(btn.dataset.playAudio),url=URL.createObjectURL(blob),audio=new Audio(url);audio.onended=()=>URL.revokeObjectURL(url);await audio.play()});
   lastMessageSignature=signature;
  }
  await refreshRoster();
 }catch(err){if(force)box.innerHTML='<div class="empty-state">'+esc(err.message)+'</div>'}finally{pollBusy=false}
}
function selectPeer(peer,name=''){activePeer=peer||null;activePeerName=name||'';qa('[data-chat-peer]').forEach(el=>el.classList.toggle('active',(el.dataset.chatPeer||null)===activePeer));setThreadHeader();lastMessageSignature='';loadMessages(true)}
function sanitizeName(n){return String(n||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100)}
async function uploadPending(){
 if(!pendingFile)return {};
 if(pendingFile.size>15*1024*1024)throw new Error('Skedari mund të jetë maksimumi 15 MB.');
 const path=new Date().toISOString().slice(0,10)+'/'+(crypto.randomUUID?.()||Date.now())+'-'+sanitizeName(pendingFile.name);
 await window.zzAdminStorageUpload(pendingFile,path);
 return {p_attachment_path:path,p_attachment_name:pendingFile.name,p_attachment_type:pendingFile.type||'application/octet-stream',p_attachment_size:pendingFile.size};
}
function setPending(file){
 pendingFile=file||null;const s=q('#zzChatFileState');if(s)s.innerHTML=pendingFile?'📎 '+esc(pendingFile.name)+' <button type="button" id="zzClearChatFile">×</button>':'';
 q('#zzClearChatFile')?.addEventListener('click',()=>setPending(null));
}
async function sendMessage(){
 const input=q('#adminChatInput'),body=input?.value.trim();if(!body&&!pendingFile)return;
 const btn=q('#adminChatForm button[type="submit"]');if(btn)btn.disabled=true;
 try{const att=await uploadPending();await rpc('admin_send_internal_message_v3',{p_body:body||'',p_recipient_user_id:activePeer,...att});input.value='';setPending(null);lastMessageSignature='';await loadMessages(true)}catch(err){alert(err.message)}finally{if(btn)btn.disabled=false;input?.focus()}
}
function ensureComposeTools(){
 const form=q('#adminChatForm');if(!form||q('#zzChatTools'))return;
 const tools=document.createElement('div');tools.id='zzChatTools';tools.className='zz-chat-tools';
 tools.innerHTML='<button type="button" id="zzChatAttach">📎 Skedar</button><button type="button" id="zzChatVoice">🎙 Voice</button><button type="button" id="zzChatReplies">⚡ Përgjigje</button><input id="zzChatFile" type="file" hidden><div id="zzChatFileState"></div><div id="zzChatReplyMenu" class="zz-chat-reply-menu" hidden></div>';
 form.insertBefore(tools,form.firstChild);
 q('#zzChatAttach').onclick=()=>q('#zzChatFile').click();q('#zzChatFile').onchange=e=>setPending(e.target.files?.[0]||null);
 q('#zzChatVoice').onclick=toggleVoice;
 q('#zzChatReplies').onclick=toggleReplies;
}
async function toggleVoice(){
 const b=q('#zzChatVoice');
 if(recorder&&recorder.state==='recording'){recorder.stop();b.textContent='🎙 Voice';return}
 if(!navigator.mediaDevices?.getUserMedia){alert('Browseri nuk e mbështet regjistrimin e zërit.');return}
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recorder=new MediaRecorder(stream);
  recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};
  recorder.onstop=()=>{const blob=new Blob(recordChunks,{type:recorder.mimeType||'audio/webm'}),file=new File([blob],'voice-'+Date.now()+'.webm',{type:blob.type});setPending(file);stream.getTracks().forEach(t=>t.stop())};
  recorder.start();b.textContent='■ Ndalo';
 }catch(e){alert('Nuk u lejua mikrofoni.')}
}
async function toggleReplies(){
 const menu=q('#zzChatReplyMenu');if(!menu)return;
 if(!menu.hidden){menu.hidden=true;return}
 let replies=window.ZZCollabState?.saved_replies;
 if(!replies){try{const s=await rpc('admin_collab_snapshot',{});replies=s.saved_replies||[]}catch{replies=[]}}
 menu.innerHTML=(replies||[]).map(r=>'<button type="button" data-reply-body="'+esc(r.body)+'"><strong>'+esc(r.label)+'</strong><span>'+esc(r.body.slice(0,80))+'</span></button>').join('')||'<div class="empty-state">Nuk ka Saved Replies.</div>';
 qa('[data-reply-body]',menu).forEach(b=>b.onclick=()=>{q('#adminChatInput').value=b.dataset.replyBody;menu.hidden=true;q('#adminChatInput').focus()});menu.hidden=false;
}
async function showPinned(){
 let rows=[];try{rows=await rpc('admin_list_pinned_messages',{})||[]}catch{}
 const box=q('#zzPinnedBox');if(!box)return;
 box.innerHTML=rows.map(x=>'<div><strong>'+esc(x.sender_name)+'</strong><span>'+esc(x.body.slice(0,120))+'</span></div>').join('')||'<div class="empty-state">Nuk ka mesazhe të fiksuara.</div>';
}
function ensurePinnedButton(){
 const head=q('.zz-admin-chat-head');if(!head||q('#zzPinnedToggle'))return;
 const b=document.createElement('button');b.id='zzPinnedToggle';b.type='button';b.className='secondary-btn';b.textContent='📌 Pinned';
 const box=document.createElement('div');box.id='zzPinnedBox';box.className='zz-pinned-box';box.hidden=true;head.appendChild(b);head.appendChild(box);
 b.onclick=async()=>{box.hidden=!box.hidden;if(!box.hidden)await showPinned()};
}
function bindChat(){
 ensureComposeTools();ensurePinnedButton();
 q('#adminChatForm')?.addEventListener('submit',async e=>{e.preventDefault();await sendMessage()});
 q('#adminChatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}});
 q('#adminChatRefresh')?.addEventListener('click',async()=>{await refreshRoster();lastMessageSignature='';await loadMessages(true)});
 document.addEventListener('click',e=>{const peer=e.target.closest('[data-chat-peer]');if(peer){selectPeer(peer.dataset.chatPeer||null,peer.dataset.chatName||'');return}if(e.target.closest('[data-view="messages"]'))setTimeout(async()=>{ensureComposeTools();ensurePinnedButton();await refreshRoster();await loadMessages(true)},60);if(e.target.closest('[data-book-id]')||e.target.closest('#newBookBtn'))setTimeout(ensureNotes,120)});
}
async function heartbeat(){try{await rpc('admin_touch_presence',{});if(document.visibilityState==='visible'){await refreshRoster();if(q('#view-messages')?.classList.contains('active-view'))await loadMessages(false)}}catch{}}
function boot(){let tries=0;const t=setInterval(()=>{tries++;ensureNotes();ensureComposeTools();ensurePinnedButton();if(q('#zzBookEditorTabs')||tries>60)clearInterval(t)},150);bindChat();setTimeout(heartbeat,1000);setInterval(heartbeat,5000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')heartbeat()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();