(()=>{
  const q=(s,r=document)=>r.querySelector(s);
  const defaults={
    hero_label_1:'ZemZem Select',hero_label_2:'Editor’s Pick',hero_label_3:'Featured',
    mega_categories_kicker:'Shfleto koleksionet',mega_categories_title:'Kategoritë',
    mega_picks_kicker:'Përzgjedhja ZemZem',mega_picks_title:'Të rekomanduara',
    digital_kicker:'ZemZem Digital',digital_title:'Lexo në formatin që të përshtatet.',
    digital_description:'Libra fizikë për bibliotekën tënde dhe eBook për qasje të menjëhershme nga llogaria ZemZem.',
    featured_kicker:'Featured Collection',featured_title:'Një koleksion që meriton vend në bibliotekë.',
    featured_description:'Një përzgjedhje vizuale me titujt më të veçuar të katalogut.',
    editorial_kicker:'ZemZem Editorial',editorial_title:'Jo vetëm dyqan. Një vend ku libri prezantohet me peshën që meriton.',
    editorial_description:'Ballina ndërtohet si një ekspozitë editoriale: koleksione të kuruara, tituj të zgjedhur, përmbajtje nga Blogu dhe qasje e drejtpërdrejtë te libri fizik ose digjital.'
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let current={...defaults};
  function ensureStyle(){if(q('#homeLabelsAdminStyle'))return;document.head.insertAdjacentHTML('beforeend',`<style id="homeLabelsAdminStyle">
    .home-labels-card .hl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.home-labels-card .hl-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.home-labels-card .hl-group{margin:14px 0 8px;padding-top:12px;border-top:1px solid #edf1f4}.home-labels-card .hl-group:first-of-type{border-top:0;margin-top:0;padding-top:0}.home-labels-card .hl-group h4{margin:0 0 8px;font-size:12px;color:#2e4052}.home-labels-card textarea{min-height:84px;resize:vertical}.home-labels-note{font-size:11px;color:#7d8a95;margin-top:8px}.home-labels-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:12px}.home-labels-status{font-size:11px;color:#16836f}@media(max-width:900px){.home-labels-card .hl-grid,.home-labels-card .hl-two{grid-template-columns:1fr}}
  </style>`)}
  function field(label,key,type='input'){
    const val=esc(current[key]??'');
    return `<div class="site-field"><label>${esc(label)}</label>${type==='textarea'?`<textarea data-home-label="${key}" rows="3">${val}</textarea>`:`<input data-home-label="${key}" value="${val}">`}</div>`;
  }
  function render(){const grid=q('#view-site .site-editor-grid');if(!grid||q('#homeLabelsCard'))return false;ensureStyle();const card=document.createElement('article');card.id='homeLabelsCard';card.className='site-editor-card span-2 home-labels-card';card.innerHTML=`
    <div class="site-card-head"><div><h3>Tekstet e dizajnit të Ballinës</h3><p>Këtu mund t’i ndryshosh vetë etiketat si “ZemZem Select” dhe tekstet e seksioneve moderne të Ballinës.</p></div></div>
    <div class="hl-group"><h4>Etiketat mbi Hero</h4><div class="hl-grid">${field('Etiketa 1','hero_label_1')}${field('Etiketa 2','hero_label_2')}${field('Etiketa 3','hero_label_3')}</div></div>
    <div class="hl-group"><h4>Mega Menu</h4><div class="hl-two">${field('Sipër kategorive','mega_categories_kicker')}${field('Titulli i kategorive','mega_categories_title')}${field('Sipër librave','mega_picks_kicker')}${field('Titulli i librave','mega_picks_title')}</div></div>
    <div class="hl-group"><h4>ZemZem Digital</h4><div class="hl-two">${field('Etiketa','digital_kicker')}${field('Titulli','digital_title')}</div>${field('Përshkrimi','digital_description','textarea')}</div>
    <div class="hl-group"><h4>Featured Collection</h4><div class="hl-two">${field('Etiketa','featured_kicker')}${field('Titulli','featured_title')}</div>${field('Përshkrimi','featured_description','textarea')}</div>
    <div class="hl-group"><h4>ZemZem Editorial</h4><div class="hl-two">${field('Etiketa','editorial_kicker')}${field('Titulli','editorial_title')}</div>${field('Përshkrimi','editorial_description','textarea')}</div>
    <div class="home-labels-actions"><button class="primary-btn" type="button" id="homeLabelsSave">Ruaj tekstet e Ballinës</button><button class="secondary-btn" type="button" id="homeLabelsReset">Kthe tekstet fillestare</button><span class="home-labels-status" id="homeLabelsStatus"></span></div>
    <div class="home-labels-note">Këto ruhen veçmas nga menuja dhe kategoritë, prandaj nuk humbin kur ruan pjesët tjera të faqes.</div>`;
    grid.appendChild(card);q('#homeLabelsSave').onclick=save;q('#homeLabelsReset').onclick=reset;return true}
  function read(){const out={...current};document.querySelectorAll('[data-home-label]').forEach(el=>out[el.dataset.homeLabel]=el.value.trim());return out}
  function fill(){document.querySelectorAll('[data-home-label]').forEach(el=>{el.value=current[el.dataset.homeLabel]??''})}
  async function load(){try{const rows=await api('site_content?key=eq.home_labels&select=content&limit=1');current={...defaults,...(rows?.[0]?.content||{})};fill()}catch(e){const s=q('#homeLabelsStatus');if(s)s.textContent='Nuk u ngarkuan: '+e.message}}
  async function save(){const btn=q('#homeLabelsSave'),s=q('#homeLabelsStatus');if(btn)btn.disabled=true;if(s)s.textContent='Duke ruajtur...';try{current=read();const rows=await api('site_content?key=eq.home_labels&select=key&limit=1');if(rows?.length){await api('site_content?key=eq.home_labels',{method:'PATCH',body:{content:current,updated_at:new Date().toISOString()},prefer:'return=minimal'})}else{await api('site_content',{method:'POST',body:{key:'home_labels',content:current,updated_at:new Date().toISOString()},prefer:'return=minimal'})}if(s)s.textContent='U ruajt. Ndryshimi del menjëherë në Ballinë.';if(typeof toast==='function')toast('Tekstet e Ballinës u ruajtën')}catch(e){if(s)s.textContent='Gabim: '+e.message;if(typeof toast==='function')toast(e.message,'error')}finally{if(btn)btn.disabled=false}}
  function reset(){current={...defaults};fill();const s=q('#homeLabelsStatus');if(s)s.textContent='Tekstet fillestare u vendosën në formular. Kliko Ruaj për t’i aplikuar.'}
  function boot(){let tries=0;const t=setInterval(()=>{if(render()){clearInterval(t);load()}else if(++tries>80)clearInterval(t)},150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
