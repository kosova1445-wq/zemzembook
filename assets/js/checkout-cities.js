(()=>{
'use strict';
const CITIES={
 KS:[
 'Deçan','Dragash','Drenas','Ferizaj','Fushë Kosovë','Gjakovë','Gjilan','Graçanicë','Hani i Elezit','Istog','Junik','Kaçanik','Kamenicë','Klinë','Kllokot','Leposaviq','Lipjan','Malishevë','Mamushë','Mitrovicë','Mitrovicë e Veriut','Novobërdë','Obiliq','Partesh','Pejë','Podujevë','Prishtinë','Prizren','Rahovec','Ranillug','Shtime','Shtërpcë','Skenderaj','Suharekë','Viti','Vushtrri','Zubin Potok','Zveçan'
 ],
 AL:[
 'Belsh','Berat','Bulqizë','Cërrik','Delvinë','Devoll','Dibër','Divjakë','Durrës','Elbasan','Fier','Finiq','Fushë-Arrëz','Gjirokastër','Gramsh','Has','Himarë','Kamëz','Kavajë','Këlcyrë','Klos','Kolonjë','Konispol','Korçë','Krujë','Kuçovë','Kukës','Kurbin','Lezhë','Libohovë','Librazhd','Lushnjë','Malësi e Madhe','Maliq','Mallakastër','Mat','Memaliaj','Mirditë','Patos','Peqin','Përmet','Pogradec','Poliçan','Prrenjas','Pukë','Roskovec','Rrogozhinë','Sarandë','Selenicë','Shijak','Shkodër','Skrapar','Tepelenë','Tiranë','Tropojë','Ura Vajgurore','Vau i Dejës','Vlorë','Vorë'
 ],
 MK:[
 'Berovë','Bitolë','Bogdanc','Bogovinë','Bosilovë','Bërvenicë','Çair','Çashkë','Çeshinovë-Obleshevë','Dibër','Dellçevë','Demir Hisar','Demir Kapi','Dojran','Gazi Babë','Gjevgjeli','Gostivar','Gradsko','Ilinden','Jegunovcë','Karbinci','Karposh','Kavadar','Kërçovë','Kisela Vodë','Koçan','Konçe','Kratovë','Kriva Pallankë','Krivogashtan','Krushevë','Kumanovë','Likovë','Lozovë','Manastir','Makedonska Kamenicë','Makedonski Brod','Mavrovë dhe Rostushë','Mogillë','Negotinë','Novaci','Novo Sellë','Ohër','Pehçevë','Petrovec','Pllasnicë','Prilep','Probishtip','Radovish','Rankovcë','Resnjë','Rosoman','Saraj','Shkup','Shtip','Sopishte','Staro Nagoriçan','Strugë','Strumicë','Studeniçan','Sveti Nikollë','Tearcë','Tetovë','Valandovë','Vasilevë','Veles','Vevçan','Vinicë','Zelenikovë','Zhelinë'
 ]
};
const LABELS={KS:'Kosovë',AL:'Shqipëri',MK:'Maqedoni e Veriut'};
function q(s){return document.querySelector(s)}
function populate(preserve=''){
 const country=q('#country'),city=q('#citySelect')||q('[name="city"]');if(!country||!city)return;
 const code=country.value||'KS',items=CITIES[code]||[];
 const wanted=String(preserve||city.value||'').trim();
 city.innerHTML='<option value="">— Zgjidh qytetin —</option>'+items.map(x=>'<option value="'+x.replace(/"/g,'&quot;')+'">'+x+'</option>').join('');
 if(wanted&&items.includes(wanted))city.value=wanted;
 else if(wanted){const opt=document.createElement('option');opt.value=wanted;opt.textContent=wanted+' (adresë e ruajtur)';city.appendChild(opt);city.value=wanted}
 city.dataset.country=code;
 city.setAttribute('aria-label','Qyteti në '+(LABELS[code]||'shtetin e zgjedhur'));
}
function init(){
 const country=q('#country'),city=q('#citySelect')||q('[name="city"]');if(!country||!city)return;
 populate(city.value);
 country.addEventListener('change',()=>populate(''));
 window.ZemZemCheckoutCities={populate,cities:CITIES};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();