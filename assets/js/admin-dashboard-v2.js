(()=>{
'use strict';
const q=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),money=n=>Number(n||0).toFixed(2)+' €';
function style(){if(q('#zzDashV2Style'))return;document.head.insertAdjacentHTML('beforeend',`<style id="zzDashV2Style">
.zz-dash-v2{margin:16px 0}.zz-dash-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.zz-kpi{background:#fff;border:1px solid #dfe7e2;border-radius:14px;padding:13px}.zz-kpi span{display:block;color:#748078;font-size:11px}.zz-kpi strong{display:block;margin-top:5px;font-size:19px;color:#173d2b}.zz-dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.zz-sales-chart-card{margin-top:14px;background:#fff;border:1px solid #dfe7e2;border-radius:14px;padding:14px}.zz-sales-chart-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:12px}.zz-sales-chart-head h3{margin:0}.zz-sales-chart{width:100%;height:230px;display:block}.zz-chart-grid{stroke:#e9efec;stroke-width:1}.zz-chart-line{fill:none;stroke:#159da8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.zz-chart-area{fill:rgba(21,157,168,.10)}.zz-chart-label{font-size:10px;fill:#78867e}.zz-chart-value{font-size:11px;fill:#173d2b;font-weight:800}.zz-rank{display:grid;gap:7px}.zz-rank-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px 0;border-bottom:1px solid #edf1ef}.zz-rank-row:last-child{border-bottom:0}.zz-rank-row small{display:block;color:#7b8780;margin-top:2px}.zz-period{display:flex;gap:8px;align-items:center;margin-bottom:10px}.zz-period select{min-height:38px;border:1px solid #dce5e0;border-radius:8px;padding:7px 10px;background:#fff}@media(max-width:1200px){.zz-dash-kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.zz-dash-kpis{grid-template-columns:repeat(2,1fr)}.zz-dash-grid{grid-template-columns:1fr}}
</style>`)}
function build(){const dash=q('#view-dashboard');if(!dash||q('#zzDashboardV2'))return;style();const host=document.createElement('section');host.id='zzDashboardV2';host.className='zz-dash-v2';host.innerHTML=`<div class="zz-period"><strong>Dashboard i avancuar</strong><select id="zzDashDays"><option value="7">7 ditë</option><option value="30" selected>30 ditë</option><option value="90">90 ditë</option><option value="365">1 vit</option></select><button class="secondary-btn" id="zzDashRefresh">↻ Rifresko</button></div><div id="zzDashKpis" class="zz-dash-kpis"></div><section class="zz-sales-chart-card" data-dashboard-widget="sales"><div class="zz-sales-chart-head"><div><h3>Grafiku i shitjeve</h3><p id="zzSalesChartCaption" class="muted-small">Trend i shitjeve fizike + eBook</p></div><strong id="zzSalesChartTotal"></strong></div><div id="zzSalesChart"></div></section><div class="zz-dash-grid"><section class="panel" data-dashboard-widget="top_books"><div class="panel-head"><div><h2>Top librat</h2><p>Sipas sasisë dhe të ardhurave</p></div></div><div id="zzTopBooks" class="zz-rank"></div></section><section class="panel" data-dashboard-widget="top_categories"><div class="panel-head"><div><h2>Top kategoritë</h2><p>Sipas të ardhurave</p></div></div><div id="zzTopCats" class="zz-rank"></div></section></div>`;const head=dash.querySelector('.dashboard-pro-head');if(head)head.insertAdjacentElement('afterend',host);else dash.prepend(host);q('#zzDashDays').onchange=load;q('#zzDashRefresh').onclick=load}
function renderSalesChart(rows,days){
  const box=q('#zzSalesChart');if(!box)return;const data=Array.isArray(rows)?rows:[],w=900,h=230,pad={l:48,r:18,t:18,b:34};
  if(!data.length){box.innerHTML='<div class="empty-state">Pa të dhëna për grafik.</div>';return}
  const vals=data.map(x=>Number(x.value||0)),max=Math.max(1,...vals),min=0,iw=w-pad.l-pad.r,ih=h-pad.t-pad.b;
  const x=i=>pad.l+(data.length===1?iw/2:(i/(data.length-1))*iw),y=v=>pad.t+ih-((v-min)/(max-min||1))*ih;
  const points=data.map((d,i)=>`${x(i).toFixed(1)},${y(vals[i]).toFixed(1)}`).join(' ');
  const area=`${pad.l},${pad.t+ih} ${points} ${pad.l+iw},${pad.t+ih}`;
  const grid=[0,.25,.5,.75,1].map(t=>{const yy=pad.t+ih*(1-t),val=max*t;return `<line class="zz-chart-grid" x1="${pad.l}" x2="${pad.l+iw}" y1="${yy}" y2="${yy}"/><text class="zz-chart-label" x="4" y="${yy+3}">${val.toFixed(0)} €</text>`}).join('');
  const step=Math.max(1,Math.floor(data.length/5)),labels=data.map((d,i)=>i%step===0||i===data.length-1?`<text class="zz-chart-label" x="${x(i)}" y="${h-8}" text-anchor="middle">${new Intl.DateTimeFormat('sq-AL',{day:'2-digit',month:'short'}).format(new Date(d.date+'T00:00:00'))}</text>`:'').join('');
  box.innerHTML=`<svg class="zz-sales-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafiku i shitjeve"><polygon class="zz-chart-area" points="${area}"/>${grid}<polyline class="zz-chart-line" points="${points}"/>${labels}</svg>`;
  const cap=q('#zzSalesChartCaption');if(cap)cap.textContent=`Trend i ${days} ditëve të fundit · libra fizikë + eBook`;const total=q('#zzSalesChartTotal');if(total)total.textContent=money(vals.reduce((a,b)=>a+b,0));
}
function rank(rows,nameKey){return (rows||[]).map((x,i)=>`<div class="zz-rank-row"><div><strong>#${i+1} ${esc(x[nameKey]||'—')}</strong><small>${Number(x.qty||0)} copë</small></div><strong>${money(x.revenue)}</strong></div>`).join('')||'<div class="empty-state">Pa të dhëna.</div>'}
async function load(){build();const days=Number(q('#zzDashDays')?.value||30);try{const d=await api('rpc/admin_dashboard_v2',{method:'POST',body:{p_days:days}})||{};q('#zzDashKpis').innerHTML=`<div class="zz-kpi"><span>Shitjet sot</span><strong>${money(d.sales_today)}</strong></div><div class="zz-kpi"><span>Këtë javë</span><strong>${money(d.sales_week)}</strong></div><div class="zz-kpi"><span>Këtë muaj</span><strong>${money(d.sales_month)}</strong></div><div class="zz-kpi"><span>Average order value</span><strong>${money(d.average_order_value)}</strong></div><div class="zz-kpi" data-dashboard-widget="abandoned"><span>Abandoned carts</span><strong>${Number(d.abandoned_carts||0)}</strong></div><div class="zz-kpi" data-dashboard-widget="profit"><span>Fitimi (${days} ditë)</span><strong>${money(d.profit)}</strong></div>`;renderSalesChart(d.sales_series,Number(d.series_days||days));await applyWidgetPrefs();q('#zzTopBooks').innerHTML=rank(d.top_books,'title');q('#zzTopCats').innerHTML=rank(d.top_categories,'category')}catch(e){typeof toast==='function'&&toast(e.message,'error')}}
async function applyWidgetPrefs(){
  try{const rows=await api('admin_dashboard_widgets?select=widget_key,visible')||[],map=new Map(rows.map(x=>[x.widget_key,x.visible!==false]));document.querySelectorAll('[data-dashboard-widget]').forEach(el=>{const k=el.dataset.dashboardWidget;el.hidden=map.has(k)&&!map.get(k)})}catch{}
}
function wrap(){try{if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__dashv2){const core=window.renderDashboard;window.renderDashboard=function(){const r=core.apply(this,arguments);setTimeout(load,20);return r};window.renderDashboard.__dashv2=true}}catch{}}
function init(){build();wrap();window.addEventListener('zemzem:admin-access-ready',()=>{build();wrap();if(window.ZemZemAdminAccess?.authorized)load()});setTimeout(()=>{build();wrap()},700)}
document.addEventListener('DOMContentLoaded',init);
})();

/* ZemZem Admin workspace templates: Simple / Store / Professional / Owner */
(()=>{
'use strict';
if(window.__zzAdminWorkspaceTemplates)return;window.__zzAdminWorkspaceTemplates=1;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='zemzem_admin_workspace_template';
const templates={
  simple:{label:'Simple Admin',desc:'Pamje e pastër për punët e përditshme.'},
  store:{label:'Store Manager',desc:'Porosi, libra, stok, klientë dhe checkout.'},
  pro:{label:'Professional',desc:'Dashboard, rritje, raporte dhe menaxhim i avancuar.'},
  owner:{label:'Owner Dashboard',desc:'Qasje e plotë në të gjitha modulet e Adminit.'}
};
function injectStyle(){
  if($('#zzAdminWorkspaceStyle'))return;
  document.head.insertAdjacentHTML('beforeend',\`<style id="zzAdminWorkspaceStyle">
  .zz-workspace-picker{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid #dfe7e2;border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(23,61,43,.04)}
  .zz-workspace-picker label{font-size:10px;font-weight:900;color:#6d7d74;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
  .zz-workspace-picker select{border:0;background:#f5f8f6;color:#173d2b;font-weight:800;border-radius:8px;min-height:34px;padding:6px 28px 6px 9px;outline:0}
  .zz-workspace-note{font-size:9px;color:#829087;max-width:180px;line-height:1.25}
  .zz-template-welcome{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;margin:0 0 14px;border:1px solid #dfe7e2;border-radius:14px;background:linear-gradient(135deg,#fff,#f6faf8)}
  .zz-template-welcome h3{margin:0;font-size:15px;color:#173d2b}.zz-template-welcome p{margin:4px 0 0;font-size:11px;color:#748078}
  .zz-quick-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:14px}
  .zz-quick-action{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid #dfe7e2;background:#fff;border-radius:12px;padding:11px 12px;cursor:pointer;color:#274638;font-weight:800}
  .zz-quick-action:hover{border-color:#b7d8c8;background:#f8fbf9;transform:translateY(-1px)}
  .zz-quick-action b{width:30px;height:30px;border-radius:9px;background:#eef6f2;display:grid;place-items:center;font-size:15px}
  #adminApp[data-workspace-template="simple"] .side-nav .zz-nav-advanced,
  #adminApp[data-workspace-template="simple"] .side-nav .zz-nav-owner,
  #adminApp[data-workspace-template="simple"] .side-nav .zz-nav-store-extra{display:none!important}
  #adminApp[data-workspace-template="store"] .side-nav .zz-nav-advanced,
  #adminApp[data-workspace-template="store"] .side-nav .zz-nav-owner{display:none!important}
  #adminApp[data-workspace-template="pro"] .side-nav .zz-nav-owner{display:none!important}
  #adminApp[data-workspace-template="simple"] .zz-dash-grid,
  #adminApp[data-workspace-template="simple"] .zz-sales-chart-card{display:none!important}
  #adminApp[data-workspace-template="simple"] .zz-dash-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
  #adminApp[data-workspace-template="store"] .zz-dash-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
  @media(max-width:1050px){.zz-workspace-note{display:none}.zz-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:760px){
    .zz-workspace-picker{width:100%;order:10}.zz-workspace-picker label{display:none}.zz-workspace-picker select{width:100%}
    .zz-template-welcome{align-items:flex-start;flex-direction:column}.zz-quick-actions{grid-template-columns:1fr 1fr}
    #adminApp[data-workspace-template="simple"] .zz-dash-kpis,#adminApp[data-workspace-template="store"] .zz-dash-kpis{grid-template-columns:1fr 1fr}
  }
  </style>\`);
}
function navKind(el){
  const v=(el.dataset.view||'').toLowerCase(),h=(el.getAttribute('href')||'').toLowerCase(),t=(el.textContent||'').toLowerCase();
  if(['admins','branding','security-release','integrations'].includes(v)||/administrator|siguria|integrim|logo & brand/.test(t))return'owner';
  if(['operations','checkout-settings','reviews','coupons','team-center','messages','partners'].includes(v)||/invoice|packing|gift|social|document|partner|team|messenger|checkout/.test(t))return'store-extra';
  if(['business-center'].includes(v)||/intelligence|growth|experience|automation|workflow|report|marketing|forecast|abandoned|business|analytics/.test(t))return'advanced';
  if(h.includes('admin-ebooks'))return'core';
  return'core';
}
function classifyNav(){
  $$('.side-nav .nav-item').forEach(el=>{
    el.classList.remove('zz-nav-core','zz-nav-store-extra','zz-nav-advanced','zz-nav-owner');
    el.classList.add('zz-nav-'+navKind(el));
  });
}
function title(mode){return templates[mode]?.label||templates.simple.label}
function go(view){
  const el=$(\`[data-view="\${view}"]\`);
  if(el){el.click();return}
  try{if(typeof window.setView==='function')window.setView(view)}catch{}
}
function quickActions(mode){
  const sets={
    simple:[['▤','Porositë','orders'],['▥','Librat','books'],['＋','Shto libër','add-book'],['◎','Klientët','customers']],
    store:[['▤','Porositë','orders'],['▥','Librat & stok','books'],['％','Kuponët','coupons'],['🛒','Checkout','checkout-settings']],
    pro:[['📊','Business Center','business-center'],['▤','Porositë','orders'],['◎','Klientët','customers'],['◈','Katalogu','catalog']],
    owner:[['🛡','Siguria','security-release'],['♙','Administratorët','admins'],['📊','Business Center','business-center'],['⚙','Operations','operations']]
  };
  return (sets[mode]||sets.simple).map(x=>\`<button type="button" class="zz-quick-action" data-zz-go="\${x[2]}"><b>\${x[0]}</b><span>\${x[1]}</span></button>\`).join('');
}
function dashboardHero(mode){
  const dash=$('#view-dashboard');if(!dash)return;
  let box=$('#zzTemplateWelcome');
  if(!box){box=document.createElement('div');box.id='zzTemplateWelcome';dash.prepend(box)}
  box.innerHTML=\`<div class="zz-template-welcome"><div><h3>\${title(mode)}</h3><p>\${templates[mode].desc}</p></div><button type="button" class="secondary-btn" id="zzShowAllAdmin">Shfaq Owner Dashboard</button></div><div class="zz-quick-actions">\${quickActions(mode)}</div>\`;
  box.querySelectorAll('[data-zz-go]').forEach(b=>b.onclick=()=>go(b.dataset.zzGo));
  const all=$('#zzShowAllAdmin');if(all){all.hidden=mode==='owner';all.onclick=()=>apply('owner',true)}
}
function apply(mode,save){
  if(!templates[mode])mode='simple';
  const app=$('#adminApp');if(!app)return;
  app.dataset.workspaceTemplate=mode;
  if(save!==false)try{localStorage.setItem(KEY,mode)}catch{}
  const sel=$('#zzWorkspaceSelect');if(sel)sel.value=mode;
  const note=$('#zzWorkspaceNote');if(note)note.textContent=templates[mode].desc;
  classifyNav();dashboardHero(mode);
  window.dispatchEvent(new CustomEvent('zemzem:admin-template-change',{detail:{template:mode}}));
}
function picker(){
  const top=$('.admin-topbar .top-actions');if(!top||$('#zzWorkspacePicker'))return false;
  const wrap=document.createElement('div');wrap.id='zzWorkspacePicker';wrap.className='zz-workspace-picker';
  wrap.innerHTML=\`<label for="zzWorkspaceSelect">Pamja</label><select id="zzWorkspaceSelect" aria-label="Pamja e Adminit"><option value="simple">Simple Admin</option><option value="store">Store Manager</option><option value="pro">Professional</option><option value="owner">Owner Dashboard</option></select><span class="zz-workspace-note" id="zzWorkspaceNote"></span>\`;
  top.prepend(wrap);$('#zzWorkspaceSelect').onchange=e=>apply(e.target.value,true);return true;
}
function boot(){
  injectStyle();picker();classifyNav();
  let mode='simple';try{mode=localStorage.getItem(KEY)||'simple'}catch{}
  apply(mode,false);
  const obs=new MutationObserver(()=>{classifyNav();picker()});
  const side=$('.side-nav');if(side)obs.observe(side,{childList:true,subtree:false});
  setTimeout(()=>apply(mode,false),900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
