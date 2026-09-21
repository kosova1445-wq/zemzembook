(()=>{
'use strict';
if(window.__zzCollaborationSuite)return;window.__zzCollaborationSuite=1;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>{try{return v?new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v)):'—'}catch{return '—'}};
let state=null,activeTab='tasks',refreshing=false;
const rpc=(fn,body={})=>window.api('rpc/'+fn,{method:'POST',body});
const access=()=>window.ZemZemAdminAccess||{};
const canApprove=()=>!!(access().is_owner||access().role==='admin'||access().full_access);

function ensureView(){
 if(!q('#view-team-center')){
  const v=document.createElement('section');v.id='view-team-center';v.className='view';
  v.innerHTML='<div class="zz-team-shell" id="zzTeamShell"><div class="empty-state">Duke ngarkuar Team Center…</div></div>';
  q('main.main')?.appendChild(v);
 }
}
function ensureNav(){
 const side=q('.side-nav');if(!side)return;
 let b=q('[data-view="team-center"]',side);
 if(!b){
  b=document.createElement('button');b.className='nav-item zz-team-nav';b.dataset.view='team-center';b.innerHTML='✦ <span>Team Center</span>';
  const msg=q('[data-view="messages"]',side);(msg?.parentNode||side).insertBefore(b,msg?.nextSibling||null);
 }
 b.onclick=()=>{window.setView?.('team-center');openTab(activeTab);refresh()};
}
function ensureNotify(){
 const a=q('.top-actions');if(!a||q('#zzNotificationBtn'))return;
 const b=document.createElement('button');b.id='zzNotificationBtn';b.className='icon-action zz-notify-button';b.type='button';b.title='Njoftimet';b.innerHTML='🔔<span id="zzNotificationBadge" class="zz-notify-badge" hidden>0</span>';
 b.onclick=()=>{window.setView?.('team-center');activeTab='notifications';render();};
 const ref=q('#refreshBtn');a.insertBefore(b,ref||a.firstChild);
}
function shell(){
 return `
  <div class="zz-team-hero"><div><div class="eyebrow">ZEMZEM TEAM WORKSPACE</div><h2>Team Center</h2><p>Detyra, njoftime, aprovime, kalendar, shënime, performancë dhe auditim i ndryshimeve në një vend.</p></div><button class="secondary-btn" id="zzTeamRefresh">↻ Rifresko</button></div>
  <div class="zz-team-tabs">
   ${[['tasks','Detyrat'],['activity','Activity'],['alerts','Alerts'],['calendar','Kalendari'],['approvals','Aprovimet'],['notes','Shared Notes'],['announcements','Njoftimet e ekipit'],['replies','Saved Replies'],['notifications','Notification Center'],['changes','Audit Compare'],['settings','Settings']].map(([k,l])=>'<button class="zz-team-tab '+(activeTab===k?'active':'')+'" data-team-tab="'+k+'">'+l+'</button>').join('')}
  </div>
  <div id="zzTeamPanels"></div>`;
}
function taskPanel(){
 const admins=state.presence||[];
 return `<section class="zz-team-panel active"><div class="zz-team-grid">
 <article class="zz-team-card"><h3>Detyrë e re</h3><p>Cakto përgjegjësin, prioritetin dhe afatin.</p>
 <form class="zz-team-form two" id="zzTaskForm">
 <input class="full" name="title" required placeholder="Titulli i detyrës"><textarea class="full" name="description" rows="3" placeholder="Përshkrimi"></textarea>
 <select name="assigned_to"><option value="">Pa përgjegjës</option>${admins.map(a=>'<option value="'+esc(a.user_id)+'">'+esc(a.name)+'</option>').join('')}</select>
 <select name="priority"><option>normal</option><option>low</option><option>high</option><option>urgent</option></select>
 <input name="due_at" type="datetime-local"><button class="primary-btn" type="submit">Krijo detyrën</button></form></article>
 <article class="zz-team-card"><h3>Task Manager</h3><p>To Do / In Progress / Done.</p><div class="zz-team-list">
 ${(state.tasks||[]).map(t=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(t.title)+'</strong><span class="zz-priority '+esc(t.priority)+'">'+esc(t.priority)+'</span></div><small>'+esc(t.assigned_name||'Pa përgjegjës')+' · '+fmt(t.due_at)+'</small><p>'+esc(t.description||'')+'</p><div class="zz-team-actions">'+(['todo','in_progress','done'].map(s=>'<button data-task-status="'+esc(t.id)+'|'+s+'" class="'+(t.status===s?'primary':'')+'">'+s+'</button>').join(''))+'</div></div>').join('')||'<div class="empty-state">Nuk ka detyra.</div>'}
 </div></article></div></section>`;
}
function activityPanel(){
 const perf=state.performance||[],act=state.activity||[];
 return `<section class="zz-team-panel active"><div class="zz-team-kpis">${perf.slice(0,4).map(p=>'<div class="zz-team-kpi"><span>'+esc(p.admin_name)+'</span><strong>'+Number(p.actions||0)+'</strong><small>veprime / 30 ditë · '+Number(p.actions_7d||0)+' / 7 ditë</small></div>').join('')}</div><div class="zz-team-grid" style="margin-top:14px"><article class="zz-team-card"><h3>Activity Feed</h3><p>Ndryshimet dhe veprimet e fundit.</p><div class="zz-team-list">${act.map(a=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(a.admin_name||'Admin')+'</strong><small>'+fmt(a.created_at)+'</small></div><p>'+esc(a.action)+' · '+esc(a.entity_type||'')+' '+esc(a.entity_id||'')+'</p></div>').join('')||'<div class="empty-state">Pa aktivitet.</div>'}</div></article><article class="zz-team-card"><h3>Admin Performance</h3><p>Vetëm si pasqyrë pune, jo si sistem penalizues.</p><div class="zz-team-list">${perf.map(p=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(p.admin_name)+'</strong><span>'+esc(p.role)+'</span></div><p>'+Number(p.actions||0)+' veprime në 30 ditë · '+Number(p.actions_7d||0)+' në 7 ditë</p></div>').join('')}</div></article></div></section>`;
}
function alertsPanel(){
 const admins=state.presence||[];
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Internal Alert</h3><form class="zz-team-form two" id="zzAlertForm"><input class="full" name="title" required placeholder="Titulli"><textarea class="full" name="body" rows="3" placeholder="Detajet"></textarea><select name="severity"><option>info</option><option>warning</option><option>critical</option></select><select name="assigned_to"><option value="">Të gjithë</option>${admins.map(a=>'<option value="'+esc(a.user_id)+'">'+esc(a.name)+'</option>').join('')}</select><button class="primary-btn full">Krijo alert</button></form></article><article class="zz-team-card"><h3>Alerts aktive</h3><div class="zz-team-list">${(state.alerts||[]).map(a=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(a.title)+'</strong><span class="zz-priority '+(a.severity==='critical'?'urgent':a.severity==='warning'?'high':'')+'">'+esc(a.severity)+'</span></div><small>'+esc(a.assigned_name||'Të gjithë')+' · '+fmt(a.created_at)+'</small><p>'+esc(a.body||'')+'</p><div class="zz-team-actions"><button data-resolve-alert="'+esc(a.id)+'">Zgjidhe</button></div></div>').join('')||'<div class="empty-state">Nuk ka alerts aktive.</div>'}</div></article></div></section>`;
}
function calendarPanel(){
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Shto në kalendar</h3><form id="zzCalendarForm" class="zz-team-form two"><input class="full" name="title" required placeholder="Titulli"><select name="type"><option value="publication">Publikim</option><option value="campaign">Fushatë</option><option value="supply">Furnizim</option><option value="deadline">Afat</option><option value="other">Tjetër</option></select><input name="starts_at" type="datetime-local" required><input name="ends_at" type="datetime-local"><textarea class="full" name="description" rows="3" placeholder="Përshkrimi"></textarea><button class="primary-btn full">Ruaj eventin</button></form></article><article class="zz-team-card"><h3>Admin Calendar</h3><div class="zz-team-list">${(state.calendar||[]).map(e=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(e.title)+'</strong><span class="zz-priority">'+esc(e.event_type)+'</span></div><small>'+fmt(e.starts_at)+(e.ends_at?' → '+fmt(e.ends_at):'')+'</small><p>'+esc(e.description||'')+'</p></div>').join('')||'<div class="empty-state">Pa evente.</div>'}</div></article></div></section>`;
}
function approvalsPanel(){
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Kërkesë për aprovim</h3><p>Staff mund të kërkojë publikim; Owner/Admin e aprovon.</p><form id="zzApprovalForm" class="zz-team-form two"><select name="type"><option value="publish_book">Publikim libri</option><option value="price_change">Ndryshim çmimi</option><option value="refund">Refund</option><option value="other">Tjetër</option></select><select name="entity_type"><option value="book">Libër</option><option value="order">Porosi</option><option value="customer">Klient</option><option value="other">Tjetër</option></select><input name="entity_id" required placeholder="ID e objektit"><input name="title" required placeholder="Titulli i kërkesës"><button class="primary-btn full">Dërgo për aprovim</button></form></article><article class="zz-team-card"><h3>Approval Workflow</h3><div class="zz-team-list">${(state.approvals||[]).map(a=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(a.title)+'</strong><span class="zz-priority">'+esc(a.status)+'</span></div><small>'+esc(a.requested_name||'')+' · '+fmt(a.created_at)+'</small><p>'+esc(a.entity_type)+' / '+esc(a.entity_id)+'</p>'+(a.status==='pending'&&canApprove()?'<div class="zz-team-actions"><button class="primary" data-approval="'+esc(a.id)+'|approved">Aprovo</button><button class="danger" data-approval="'+esc(a.id)+'|rejected">Refuzo</button></div>':'')+'</div>').join('')||'<div class="empty-state">Pa kërkesa.</div>'}</div></article></div></section>`;
}
function notesPanel(){
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Shared Admin Notes</h3><p>Shënime të brendshme për porosi, klient, faturë, furnitor ose çdo objekt.</p><form id="zzEntityNotesForm" class="zz-team-form two"><select name="type"><option value="order">Porosi</option><option value="customer">Klient</option><option value="invoice">Faturë</option><option value="supplier">Furnitor</option><option value="book">Libër</option></select><input name="id" required placeholder="ID"><textarea class="full" name="body" rows="4" required placeholder="Shënimi i brendshëm"></textarea><button class="primary-btn">Shto shënim</button><button type="button" class="secondary-btn" id="zzLoadNotes">Shfaq shënimet</button></form></article><article class="zz-team-card"><h3>Shënimet</h3><div id="zzEntityNotesList" class="zz-team-list"><div class="empty-state">Zgjidh llojin dhe ID-në.</div></div></article></div></section>`;
}
function announcementPanel(){
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Announcement Center</h3><form id="zzAnnouncementForm" class="zz-team-form"><input name="title" required placeholder="Titulli"><textarea name="body" rows="4" required placeholder="Njoftimi për ekipin"></textarea><label><input name="pinned" type="checkbox"> Fiksoje lart</label><input name="expires_at" type="datetime-local"><button class="primary-btn">Publiko njoftimin</button></form></article><article class="zz-team-card"><h3>Njoftimet aktive</h3><div class="zz-team-list">${(state.announcements||[]).map(a=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+(a.pinned?'📌 ':'')+esc(a.title)+'</strong><small>'+fmt(a.created_at)+'</small></div><p>'+esc(a.body)+'</p><small>'+esc(a.created_name||'')+'</small></div>').join('')||'<div class="empty-state">Pa njoftime.</div>'}</div></article></div></section>`;
}
function repliesPanel(){
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Saved Replies</h3><form id="zzReplyForm" class="zz-team-form"><input name="label" required placeholder="Emri i përgjigjes"><textarea name="body" rows="4" required placeholder="Teksti standard"></textarea><button class="primary-btn">Ruaj përgjigjen</button></form></article><article class="zz-team-card"><h3>Përgjigjet e ruajtura</h3><div class="zz-team-list">${(state.saved_replies||[]).map(r=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(r.label)+'</strong></div><p>'+esc(r.body)+'</p><div class="zz-team-actions"><button data-copy-reply="'+esc(r.id)+'">Kopjo</button><button data-send-reply="'+esc(r.id)+'">Përdore në Messenger</button></div></div>').join('')||'<div class="empty-state">Pa përgjigje të ruajtura.</div>'}</div></article></div></section>`;
}
function notificationsPanel(){
 return `<section class="zz-team-panel active"><article class="zz-team-card"><div class="zz-team-item-head"><div><h3>Notification Center</h3><p>Mesazhe, mentions, detyra, alerts, aprovime dhe njoftime.</p></div><button class="secondary-btn" id="zzMarkAllRead">Shëno të gjitha si të lexuara</button></div><div class="zz-team-list">${(state.notifications||[]).map(n=>'<div class="zz-team-item '+(!n.read_at?'zz-notification-unread':'')+'"><div class="zz-team-item-head"><strong>'+esc(n.title)+'</strong><small>'+fmt(n.created_at)+'</small></div><p>'+esc(n.body||'')+'</p><small>'+esc(n.kind)+'</small>'+(!n.read_at?'<div class="zz-team-actions"><button data-read-notification="'+esc(n.id)+'">Lexuar</button></div>':'')+'</div>').join('')||'<div class="empty-state">Pa njoftime.</div>'}</div></article></section>`;
}
function diffRows(ch){
 const old=ch.old_data||{},nw=ch.new_data||{},keys=[...new Set([...Object.keys(old),...Object.keys(nw)])].filter(k=>JSON.stringify(old[k])!==JSON.stringify(nw[k])).slice(0,12);
 return keys.map(k=>'<div class="zz-change-row"><strong>'+esc(k)+'</strong><code>'+esc(JSON.stringify(old[k]))+'</code><span>→</span><code>'+esc(JSON.stringify(nw[k]))+'</code></div>').join('');
}
function changesPanel(){
 return `<section class="zz-team-panel active"><article class="zz-team-card"><h3>Audit Compare</h3><p>Para / pas për librat dhe porositë.</p><div class="zz-team-list">${(state.changes||[]).map(ch=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(ch.entity_type)+' · '+esc(ch.action)+'</strong><small>'+fmt(ch.created_at)+'</small></div><small>'+esc(ch.entity_id)+'</small><div class="zz-change-diff">'+diffRows(ch)+'</div></div>').join('')||'<div class="empty-state">Pa ndryshime të regjistruara.</div>'}</div></article></section>`;
}
function settingsPanel(){
 const p=state.preferences||{},pres=state.presence||[],favs=state.favorites||[];
 return `<section class="zz-team-panel active"><div class="zz-team-grid"><article class="zz-team-card"><h3>Shift / Presence Board</h3><div class="zz-presence-list">${pres.map(x=>'<div class="zz-presence-row"><div class="zz-presence-left"><span class="zz-presence-dot2 '+(x.online?'online':'')+'"></span><strong>'+esc(x.name)+'</strong></div><small>'+esc(x.role)+' · '+(x.online?'Online':fmt(x.last_seen_at))+'</small></div>').join('')}</div></article><article class="zz-team-card"><h3>Custom Dashboard</h3><form id="zzPrefsForm" class="zz-team-form"><label><input type="checkbox" name="hide_stats" '+(p.hide_stats?'checked':'')+'> Fshih statistikat kryesore</label><label><input type="checkbox" name="hide_insights" '+(p.hide_insights?'checked':'')+'> Fshih Insights</label><label><input type="checkbox" name="hide_activity" '+(p.hide_activity?'checked':'')+'> Fshih Activity</label><label><input type="checkbox" name="compact" '+(p.compact?'checked':'')+'> Dashboard kompakt</label><button class="primary-btn">Ruaj pamjen</button></form></article><article class="zz-team-card"><h3>Favorites / Shortcuts</h3><p>Shto pamjen aktuale te shkurtoret.</p><button class="secondary-btn" id="zzFavoriteCurrent">☆ Ruaj pamjen aktuale</button><div class="zz-team-list" style="margin-top:10px">${favs.map(f=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(f.label||f.entity_id)+'</strong><button data-open-favorite="'+esc(f.entity_id)+'">Hape</button></div></div>').join('')||'<div class="empty-state">Pa shortcuts.</div>'}</div></article><article class="zz-team-card"><h3>Command Palette</h3><p>Shtyp <strong>Ctrl + K</strong> nga çdo pjesë e Adminit.</p><button class="primary-btn" id="zzOpenCommand">Hape Command Palette</button></article></div></section>`;
}
function panel(){return ({tasks:taskPanel,activity:activityPanel,alerts:alertsPanel,calendar:calendarPanel,approvals:approvalsPanel,notes:notesPanel,announcements:announcementPanel,replies:repliesPanel,notifications:notificationsPanel,changes:changesPanel,settings:settingsPanel}[activeTab]||taskPanel)()}
function render(){
 ensureView();const host=q('#zzTeamShell');if(!host||!state)return;
 host.innerHTML=shell();q('#zzTeamPanels').innerHTML=panel();bindPanel();updateNotify();applyPreferences(state.preferences||{});
}
function openTab(k){activeTab=k;render()}
async function refresh(){
 if(refreshing)return;refreshing=true;
 try{state=await rpc('admin_collab_snapshot',{});window.ZZCollabState=state;render()}catch(e){const h=q('#zzTeamShell');if(h)h.innerHTML='<div class="empty-state">'+esc(e.message)+'</div>'}finally{refreshing=false}
}
function updateNotify(){
 const unread=(state?.notifications||[]).filter(x=>!x.read_at).length;
 const b=q('#zzNotificationBadge');if(b){b.textContent=unread>99?'99+':unread;b.hidden=!unread}
}
function applyPreferences(p){
 document.body.classList.toggle('zz-hide-dash-stats',!!p.hide_stats);
 document.body.classList.toggle('zz-hide-dash-insights',!!p.hide_insights);
 document.body.classList.toggle('zz-hide-dash-activity',!!p.hide_activity);
 document.body.classList.toggle('zz-dash-compact',!!p.compact);
}
function valForm(form){return Object.fromEntries(new FormData(form).entries())}
function bindPanel(){
 qa('[data-team-tab]').forEach(b=>b.onclick=()=>openTab(b.dataset.teamTab));
 q('#zzTeamRefresh')?.addEventListener('click',refresh);
 q('#zzTaskForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_task_upsert',{p_id:null,p_title:x.title,p_description:x.description||'',p_assigned_to:x.assigned_to||null,p_status:'todo',p_priority:x.priority||'normal',p_due_at:x.due_at||null});await refresh()});
 qa('[data-task-status]').forEach(b=>b.onclick=async()=>{const [id,status]=b.dataset.taskStatus.split('|'),t=(state.tasks||[]).find(x=>x.id===id);await rpc('admin_task_upsert',{p_id:id,p_title:t.title,p_description:t.description||'',p_assigned_to:t.assigned_to||null,p_status:status,p_priority:t.priority,p_due_at:t.due_at||null});await refresh()});
 q('#zzAlertForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_alert_create',{p_title:x.title,p_body:x.body||'',p_severity:x.severity,p_assigned_to:x.assigned_to||null});await refresh()});
 qa('[data-resolve-alert]').forEach(b=>b.onclick=async()=>{await rpc('admin_alert_resolve',{p_id:b.dataset.resolveAlert});await refresh()});
 q('#zzCalendarForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_calendar_create',{p_title:x.title,p_type:x.type,p_starts_at:x.starts_at,p_ends_at:x.ends_at||null,p_description:x.description||''});await refresh()});
 q('#zzApprovalForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_approval_create',{p_type:x.type,p_entity_type:x.entity_type,p_entity_id:x.entity_id,p_title:x.title,p_details:{}});await refresh()});
 qa('[data-approval]').forEach(b=>b.onclick=async()=>{const [id,status]=b.dataset.approval.split('|');const note=prompt(status==='approved'?'Shënim aprovimi (opsionale):':'Arsyeja e refuzimit (opsionale):')||'';await rpc('admin_approval_review',{p_id:id,p_status:status,p_note:note});await refresh()});
 const loadNotes=async()=>{const f=q('#zzEntityNotesForm');if(!f)return;const x=valForm(f),box=q('#zzEntityNotesList');if(!x.id){box.innerHTML='<div class="empty-state">Shkruaj ID-në.</div>';return}const rows=await rpc('admin_entity_notes_list',{p_entity_type:x.type,p_entity_id:x.id});box.innerHTML=(rows||[]).map(n=>'<div class="zz-team-item"><div class="zz-team-item-head"><strong>'+esc(n.admin_name)+'</strong><small>'+fmt(n.created_at)+'</small></div><p>'+esc(n.body)+'</p></div>').join('')||'<div class="empty-state">Pa shënime.</div>'};
 q('#zzLoadNotes')?.addEventListener('click',loadNotes);
 q('#zzEntityNotesForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_entity_note_add',{p_entity_type:x.type,p_entity_id:x.id,p_body:x.body});e.currentTarget.querySelector('[name="body"]').value='';await loadNotes()});
 q('#zzAnnouncementForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_announcement_create',{p_title:x.title,p_body:x.body,p_pinned:!!e.currentTarget.querySelector('[name="pinned"]').checked,p_expires_at:x.expires_at||null});await refresh()});
 q('#zzReplyForm')?.addEventListener('submit',async e=>{e.preventDefault();const x=valForm(e.currentTarget);await rpc('admin_saved_reply_upsert',{p_id:null,p_label:x.label,p_body:x.body});await refresh()});
 qa('[data-copy-reply]').forEach(b=>b.onclick=async()=>{const r=(state.saved_replies||[]).find(x=>x.id===b.dataset.copyReply);await navigator.clipboard.writeText(r?.body||'')});
 qa('[data-send-reply]').forEach(b=>b.onclick=()=>{const r=(state.saved_replies||[]).find(x=>x.id===b.dataset.sendReply);window.setView?.('messages');setTimeout(()=>{const i=q('#adminChatInput');if(i){i.value=r?.body||'';i.focus()}},80)});
 q('#zzMarkAllRead')?.addEventListener('click',async()=>{await rpc('admin_notification_mark_read',{p_id:null});await refresh()});
 qa('[data-read-notification]').forEach(b=>b.onclick=async()=>{await rpc('admin_notification_mark_read',{p_id:b.dataset.readNotification});await refresh()});
 q('#zzPrefsForm')?.addEventListener('submit',async e=>{e.preventDefault();const p={hide_stats:q('[name="hide_stats"]',e.currentTarget)?.checked||false,hide_insights:q('[name="hide_insights"]',e.currentTarget)?.checked||false,hide_activity:q('[name="hide_activity"]',e.currentTarget)?.checked||false,compact:q('[name="compact"]',e.currentTarget)?.checked||false};await rpc('admin_preferences_save',{p_preferences:p});state.preferences=p;applyPreferences(p)});
 q('#zzFavoriteCurrent')?.addEventListener('click',async()=>{const v=q('.view.active-view')?.id?.replace('view-','')||'dashboard',label=q('#viewTitle')?.textContent||v;await rpc('admin_favorite_toggle',{p_entity_type:'view',p_entity_id:v,p_label:label});await refresh()});
 qa('[data-open-favorite]').forEach(b=>b.onclick=()=>window.setView?.(b.dataset.openFavorite));
 q('#zzOpenCommand')?.addEventListener('click',openCommand);
}
function ensureCommand(){
 if(q('#zzCommandOverlay'))return;
 const o=document.createElement('div');o.id='zzCommandOverlay';o.className='zz-command-overlay';o.hidden=true;o.innerHTML='<div class="zz-command-box"><input id="zzCommandInput" class="zz-command-search" placeholder="Kërko libër, porosi, klient ose komandë…"><div id="zzCommandResults" class="zz-command-results"></div></div>';document.body.appendChild(o);
 o.addEventListener('click',e=>{if(e.target===o)o.hidden=true});
 q('#zzCommandInput').addEventListener('input',debounce(commandSearch,180));q('#zzCommandInput').addEventListener('keydown',e=>{if(e.key==='Escape')o.hidden=true});
}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
const commands=[['dashboard','Dashboard'],['orders','Porositë'],['books','Librat fizikë'],['add-book','Shto libër'],['messages','Messenger'],['customers','Klientët'],['team-center','Team Center'],['operations','Operations'],['branding','Logo & Brand']];
async function commandSearch(){
 const input=q('#zzCommandInput'),box=q('#zzCommandResults'),s=input.value.trim().toLowerCase();
 let rows=commands.filter(x=>x[1].toLowerCase().includes(s)).map(x=>({type:'Komandë',label:x[1],view:x[0]}));
 if(s.length>=2){
  try{const r=await rpc('admin_command_search',{p_q:s});(r.books||[]).forEach(x=>rows.push({type:'Libër',label:x.title,sub:[x.sku,x.isbn].filter(Boolean).join(' · '),view:'books',query:x.title}));(r.orders||[]).forEach(x=>rows.push({type:'Porosi',label:x.order_number,sub:[x.first_name,x.last_name,x.guest_email].filter(Boolean).join(' '),view:'orders',query:x.order_number}));(r.customers||[]).forEach(x=>rows.push({type:'Klient',label:[x.first_name,x.last_name].filter(Boolean).join(' ')||x.email,sub:x.email||'',view:'customers',query:x.email||x.last_name||''}))}catch{}
 }
 box.innerHTML=rows.slice(0,20).map((r,i)=>'<div class="zz-command-row" data-command-i="'+i+'"><div><strong>'+esc(r.label)+'</strong><small>'+esc(r.sub||'')+'</small></div><span class="zz-command-tag">'+esc(r.type)+'</span></div>').join('')||'<div class="empty-state">Nuk u gjet asgjë.</div>';
 qa('[data-command-i]',box).forEach((el,i)=>el.onclick=()=>runCommand(rows[i]));
}
function runCommand(r){
 q('#zzCommandOverlay').hidden=true;window.setView?.(r.view);
 setTimeout(()=>{if(r.view==='books'&&q('#bookSearch')){q('#bookSearch').value=r.query||'';q('#bookSearch').dispatchEvent(new Event('input'))}if(r.view==='orders'&&q('#orderSearch')){q('#orderSearch').value=r.query||'';q('#orderSearch').dispatchEvent(new Event('input'))}if(r.view==='customers'&&q('#customerSearch')){q('#customerSearch').value=r.query||'';q('#customerSearch').dispatchEvent(new Event('input'))}},50);
}
function openCommand(){ensureCommand();const o=q('#zzCommandOverlay');o.hidden=false;const i=q('#zzCommandInput');i.value='';q('#zzCommandResults').innerHTML=commands.map((x,n)=>'<div class="zz-command-row" data-command-i="'+n+'"><div><strong>'+esc(x[1])+'</strong></div><span class="zz-command-tag">Komandë</span></div>').join('');qa('[data-command-i]',q('#zzCommandResults')).forEach((el,n)=>el.onclick=()=>runCommand({view:commands[n][0]}));setTimeout(()=>i.focus(),20)}
function boot(){
 ensureView();ensureNav();ensureNotify();ensureCommand();
 new MutationObserver(()=>{ensureNav();ensureNotify()}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}});
 document.addEventListener('click',e=>{if(e.target.closest('[data-view="team-center"]'))setTimeout(refresh,40)});
 window.addEventListener('zemzem:admin-access-ready',()=>setTimeout(refresh,100));
 setTimeout(refresh,800);setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();