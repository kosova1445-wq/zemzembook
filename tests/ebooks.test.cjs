const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('assets/js/ebooks.js','utf8');
function setup(ok=true){
 const nodes=Object.fromEntries(['#ebookGrid','#ebookCount','#ebookCatalogTitle','#ebookRetry'].map(id=>[id,{innerHTML:'',textContent:'',addEventListener(){}}]));
 const context=vm.createContext({document:{querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){},dispatchEvent(){}},localStorage:{getItem:()=>null},console:{error(){}},CustomEvent:class{},URLSearchParams,location:{search:''},fetch:async()=>({ok,status:503,json:async()=>[{id:'1',title:'Libri shqip',language:'sq',price:5},{id:'2',title:'English book',language:'en',price:10}]})});
 vm.runInContext(source,context);return {context,nodes};
}
test('catalog renders before a stalled account check; language and search work',async()=>{
 const {context,nodes}=setup();
 vm.runInContext('loadOwnedEbooks=()=>new Promise(()=>{})',context);
 await vm.runInContext('loadEbooks()',context);
 assert.match(nodes['#ebookGrid'].innerHTML,/Libri shqip/);
 assert.doesNotMatch(nodes['#ebookGrid'].innerHTML,/English book/);
 assert.equal(nodes['#ebookCount'].textContent,'1 eBook në katalog.');
 vm.runInContext("ACTIVE_EBOOK_LANGUAGE='en';renderEbookGrid()",context);
 assert.match(nodes['#ebookGrid'].innerHTML,/English book/);
 vm.runInContext("ACTIVE_EBOOK_LANGUAGE='all';renderEbookGrid()",context);
 assert.equal(nodes['#ebookCount'].textContent,'2 eBook-a në katalog.');
});
test('failed request clears loading state and offers retry',async()=>{
 const {context,nodes}=setup(false);await vm.runInContext('loadEbooks()',context);
 assert.equal(nodes['#ebookCount'].textContent,'Ngarkimi nuk përfundoi.');
 assert.match(nodes['#ebookGrid'].innerHTML,/Provo përsëri/);
});
