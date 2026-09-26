import { chromium } from 'playwright';

const base='https://www.zemzem.al';
const expectedSha=process.env.EXPECTED_SHA||process.env.GITHUB_SHA||'';

async function waitForLiveSha(){
  if(!expectedSha)return;
  const deadline=Date.now()+240000;
  while(Date.now()<deadline){
    try{
      const r=await fetch(base+'/release.json?smoke='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      if(d?.sha===expectedSha){console.log('✓ live release SHA',expectedSha);return}
      console.log('live SHA:',d?.sha||'unknown','expected:',expectedSha);
    }catch(e){console.log('release check:',e.message)}
    await new Promise(r=>setTimeout(r,10000));
  }
  throw new Error('Live release did not reach expected SHA within smoke window');
}

await waitForLiveSha();
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  deviceScaleFactor:1,
  isMobile:true,
  hasTouch:true,
  userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/153 Mobile Safari/537.36'
});

async function open(path, required=[]){
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  const resp=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
  if(!resp || resp.status()>=400) throw new Error(path+' HTTP '+(resp?.status()??'NO_RESPONSE'));
  await page.waitForTimeout(1800);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  if(overflow>2) throw new Error(path+' horizontal overflow '+overflow+'px');
  for(const sel of required){
    if(await page.locator(sel).count()===0) throw new Error(path+' missing '+sel);
  }
  if(pageErrors.length) console.warn(path+' page errors:',pageErrors.slice(0,4));
  console.log('✓',path,'mobile smoke');
  return page;
}

let page=await open('/', ['body']);
await page.close();

page=await open('/shop.html',['#shopBooks']);
await page.waitForTimeout(2200);
const href=await page.locator('a[href*="product.html?id="]').first().getAttribute('href').catch(()=>null);
if(!href) throw new Error('shop: no product link found');
const id=new URL(href,base).searchParams.get('id');
if(!id) throw new Error('shop: product id missing');
await page.close();

page=await open('/product.html?id='+encodeURIComponent(id),['#productDetail']);
await page.waitForTimeout(1500);
const productText=await page.locator('#productDetail').innerText();
if(/Libri nuk u gjet/i.test(productText)) throw new Error('product: selected book not found');
await page.close();

page=await context.newPage();
await page.goto(base+'/checkout.html',{waitUntil:'domcontentloaded',timeout:45000});
await page.evaluate(id=>localStorage.setItem('zemzem_cart',JSON.stringify([{id,qty:1}])),id);
await page.reload({waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(2500);
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
if(overflow>2) throw new Error('checkout horizontal overflow '+overflow+'px');
for(const sel of ['input[name="payment_method"][value="paypal"]','input[name="payment_method"][value="cod"]','#country']){
  if(await page.locator(sel).count()===0) throw new Error('checkout missing '+sel);
}
const checkoutBody=await page.locator('body').innerText();
if(/NaN|Nuk u llogarit porosia/i.test(checkoutBody)) throw new Error('checkout quote/total error visible');
console.log('✓ /checkout.html live cart + payment methods + totals');
await page.close();

for(const path of ['/account.html','/admin.html','/partner.html']){
  const p=await open(path,['body']); await p.close();
}

await browser.close();
console.log('LIVE MOBILE SMOKE PASSED');
