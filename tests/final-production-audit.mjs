import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const fail=[],warn=[];
const ok=(cond,msg)=>cond?console.log('✓',msg):fail.push(msg);
const has=(c,re)=>re.test(c);

const pages=['index.html','shop.html','product.html','checkout.html','account.html','admin.html','partner.html'];
for(const p of pages){
  const c=read(p);
  ok(has(c,/name=["']viewport["']/i),p+' has mobile viewport');
  ok(has(c,/performance-vitals\.js/i),p+' records Core Web Vitals');
  const scripts=[...c.matchAll(/<script\b[^>]*\ssrc=["'][^"']+["'][^>]*>/gi)].map(x=>x[0]);
  ok(scripts.every(s=>/\bdefer\b/i.test(s)),p+' external scripts are deferred');
}

for(const p of ['checkout.html','account.html','admin.html','partner.html']){
  ok(has(read(p),/name=["']robots["'][^>]*noindex/i),p+' is noindex');
}

// Checkout: payment, quote, address and consent guards
const checkoutHtml=read('checkout.html');
const checkoutJs=read('assets/js/checkout-v2.js');
const checkout=checkoutHtml+'\n'+checkoutJs;
ok(/name=["']payment_method["'][^>]*value=["']paypal["']/i.test(checkoutHtml),'Checkout exposes PayPal payment method');
ok(/name=["']payment_method["'][^>]*value=["']cod["']/i.test(checkoutHtml),'Checkout exposes COD payment method');
ok(/id=["']country["']/i.test(checkoutHtml),'Checkout has country selector');
ok(/id=["']citySelect["']/i.test(checkoutHtml),'Checkout has city selector');
ok(/name=["']terms_acceptance["'][^>]*required/i.test(checkoutHtml),'Checkout requires terms acceptance');
ok(/coupon/i.test(checkout),'Checkout includes coupons');
ok(/shipping/i.test(checkout),'Checkout includes shipping calculation');
ok(/total/i.test(checkout),'Checkout includes totals');
ok(/server-side|server side|server/i.test(checkout),'Checkout indicates server verification');
ok(!/NaN/i.test(checkoutHtml),'Checkout template has no literal NaN');

// Partner fulfillment/accounting flow
const partner=read('partner.html')+'\n'+read('assets/js/partner-fulfillment.js')+'\n'+read('assets/js/partner-invoice.js');
for(const s of ['pending','preparing','shipped','delivered']) ok(partner.includes(s),'Partner flow includes '+s);
ok(/invoice|fatur/i.test(partner),'Partner flow includes invoice');
ok(/supplier_due|settlement|zemzem_margin_total/i.test(partner),'Partner flow includes settlement/accounting data');

// SEO
const index=read('index.html'),shop=read('shop.html'),product=read('product.html');
ok(/rel=["']canonical["']/i.test(index),'Homepage canonical exists');
ok(/rel=["']canonical["']/i.test(shop),'Shop canonical exists');
ok(/seo-product\.js/i.test(product),'Product dynamic SEO is enabled');
ok(fs.existsSync('sitemap.xml'),'Sitemap exists');
ok(/Sitemap:\s*https:\/\/www\.zemzem\.al\/sitemap\.xml/i.test(read('robots.txt')),'robots.txt points to sitemap');
ok(/Disallow:\s*\/admin\.html/i.test(read('robots.txt')),'Admin blocked from crawling');
ok(/Disallow:\s*\/partner\.html/i.test(read('robots.txt')),'Partner portal blocked from crawling');

// Admin mobile/stability safeguards
const admin=read('admin.html');
ok(/admin-mobile-stability-v1\.css/i.test(admin),'Admin loads mobile stability stylesheet');
ok(/zz-admin-mobile-navigation/i.test(admin),'Admin includes dedicated mobile navigation guard');
ok(/max-width:760px/i.test(admin),'Admin includes mobile breakpoint rules');
const adminScripts=[...admin.matchAll(/<script\b[^>]*\ssrc=["'][^"']+["'][^>]*>/gi)].map(x=>x[0]);
if(adminScripts.length>35) warn.push('Admin still has '+adminScripts.length+' external scripts; all are deferred, but module consolidation remains a future optimization.');

// CSP readiness guards
const cspHeaders=read('.htaccess');
ok(/Content-Security-Policy-Report-Only/i.test(cspHeaders),'CSP readiness runs in report-only mode');
ok(!/Header\s+always\s+set\s+Content-Security-Policy\s+["']/i.test(cspHeaders),'Enforcing CSP is not enabled yet');
ok(/object-src\s+'none'/i.test(cspHeaders),'CSP report-only blocks object plugins in policy design');
ok(/base-uri\s+'self'/i.test(cspHeaders),'CSP report-only restricts base URI in policy design');
ok(/frame-ancestors\s+'self'/i.test(cspHeaders),'CSP report-only preserves same-origin framing policy');

// Low-risk production security header guards
const securityHeaders=read('.htaccess');
ok(/X-Permitted-Cross-Domain-Policies\s+["']none["']/i.test(securityHeaders),'Cross-domain policy files are disabled');
ok(/Origin-Agent-Cluster\s+["']\?1["']/i.test(securityHeaders),'Origin-Agent-Cluster isolation is enabled');
ok(/X-DNS-Prefetch-Control\s+["']on["']/i.test(securityHeaders),'DNS prefetch policy is explicit');
ok(/X-Content-Type-Options\s+["']nosniff["']/i.test(securityHeaders),'MIME sniffing protection remains enabled');
ok(/X-Frame-Options\s+["']SAMEORIGIN["']/i.test(securityHeaders),'Clickjacking protection remains enabled');

// Sensitive page cache/indexing guards
const htaccessSensitive=read('.htaccess');
ok(/\^\(admin\.\*\|account\|checkout\|partner\)\\\.html\$/i.test(htaccessSensitive),'Sensitive HTML pages have dedicated server rules');
ok(/Cache-Control\s+["']no-store, no-cache, must-revalidate, max-age=0["']/i.test(htaccessSensitive),'Sensitive HTML disables browser/proxy caching');
ok(/X-Robots-Tag\s+["']noindex, nofollow, noarchive["']/i.test(htaccessSensitive),'Sensitive HTML is blocked from indexing and archiving');
ok(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(checkout),'Checkout keeps noindex meta');
ok(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(read('account.html')),'Account keeps noindex meta');
ok(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(partner),'Partner portal keeps noindex meta');

// Static delivery / cache guards
const htaccess=read('.htaccess');
ok(/mod_brotli\.c/i.test(htaccess),'Apache enables Brotli when available');
ok(/BROTLI_COMPRESS/i.test(htaccess),'Brotli compression covers text assets');
ok(/Vary\s+["']Accept-Encoding["']/i.test(htaccess),'Compression varies by Accept-Encoding');
ok(/image\/avif/i.test(htaccess),'AVIF cache policy is configured');
ok(/font\/woff2/i.test(htaccess),'WOFF2 cache policy is configured');
ok(/max-age=2592000/i.test(htaccess),'Long-lived static asset caching remains enabled');

// Blog moderation Admin guards
ok(/admin-blog\.js\?v=2/i.test(admin),'Admin loads Blog management module');
ok(/admin-blog-final\.js\?v=2/i.test(admin),'Admin loads Blog moderation module');
const adminBlogFinal=read('assets/js/admin-blog-final.js');
ok(/data-blog-tab=["']comments["']/i.test(adminBlogFinal),'Blog Admin exposes Comments tab');
ok(/status:'approved'/i.test(adminBlogFinal),'Blog Admin can approve comments');
ok(/status:'rejected'/i.test(adminBlogFinal),'Blog Admin can reject comments');

// Admin startup/performance guards
const adminHtml=read('admin.html');
const adminLazy=read('assets/js/admin-lazy-loader.js');
ok(/rel=["']preconnect["'][^>]*ysvtrhizgcioyycwlkrk\.supabase\.co/i.test(adminHtml),'Admin preconnects to Supabase');
ok(/rel=["']preload["'][^>]*admin-v2\.js\?v=22/i.test(adminHtml),'Admin preloads core runtime');
ok(/PRELOAD_AHEAD\s*=\s*5/i.test(adminLazy),'Admin lazy loader warms modules ahead');
ok(/requestIdleCallback/i.test(adminLazy),'Admin lazy loader yields during long module load');
ok(/zemzem:admin-lazy-ready/i.test(adminLazy),'Admin lazy loader preserves ready event');

// Connection startup and LCP guards
ok(/rel=["']preconnect["'][^>]*ysvtrhizgcioyycwlkrk\.supabase\.co/i.test(index),'Homepage preconnects to Supabase');
ok(/rel=["']preconnect["'][^>]*ysvtrhizgcioyycwlkrk\.supabase\.co/i.test(shop),'Shop preconnects to Supabase');
ok(/rel=["']preconnect["'][^>]*ysvtrhizgcioyycwlkrk\.supabase\.co/i.test(product),'Product preconnects to Supabase');
ok(/rel=["']preload["'][^>]*app-v5\.js\?v=\d+/i.test(shop),'Shop preloads core storefront runtime');
ok(/rel=["']preload["'][^>]*app-v5\.js\?v=\d+/i.test(product),'Product preloads core storefront runtime');
ok(/fetchpriority=["']high["']/i.test(product),'Product prioritizes main cover for LCP');
ok(/loading=["']lazy["'][^>]*decoding=["']async["']/i.test(product),'Product lazily decodes secondary images');

// Performance instrumentation must keep CWV thresholds and observers intact
const vitals=read('assets/js/performance-vitals.js');
ok(/largest-contentful-paint/i.test(vitals),'Performance monitor observes LCP');
ok(/layout-shift/i.test(vitals),'Performance monitor observes CLS');
ok(/type:['"]event['"]/i.test(vitals),'Performance monitor observes INP/event timing');
ok(/LCP.*2500|name===['"]LCP['"].*2500/s.test(vitals),'LCP good threshold is 2500ms');
ok(/INP.*200|name===['"]INP['"].*200/s.test(vitals),'INP good threshold is 200ms');
ok(/CLS.*\.1|name===['"]CLS['"].*\.1/s.test(vitals),'CLS good threshold is 0.1');
ok(/keepalive\s*:\s*true/i.test(vitals),'Vitals telemetry uses keepalive');
ok(/page_path/i.test(vitals),'Vitals telemetry records page path');

// Error monitoring / observability guards
const observability=read('assets/js/storefront-observability.js');
ok(/addEventListener\(['"]error['"]/i.test(observability),'Storefront observability captures window errors');
ok(/unhandledrejection/i.test(observability),'Storefront observability captures unhandled promise rejections');
ok(/client-error/i.test(observability),'Storefront observability sends client errors to telemetry');
ok(/keepalive\s*:\s*true/i.test(observability),'Storefront observability uses keepalive');

const runtimeOps=read('assets/js/runtime-ops.js');
ok(/runtime_boot/i.test(runtimeOps),'Runtime ops reports boot failures');
ok(/storefront-telemetry/i.test(runtimeOps),'Runtime ops sends telemetry');
ok(/unhandledrejection/i.test(runtimeOps),'Runtime ops captures promise failures');

// Checkout resilience guards
ok(/create_cod_order_public/i.test(checkoutJs),'Checkout supports direct COD order creation');
ok(/paypal-create/i.test(checkoutJs),'Checkout supports PayPal order creation');
ok(/quote_order_public/i.test(checkoutJs),'Checkout supports direct server-side quote');
ok(/quote-order/i.test(checkoutJs),'Checkout keeps quote Edge fallback');
ok(/create-order/i.test(checkoutJs),'Checkout keeps COD Edge fallback');
ok(/refreshCustomerSessionForCheckout/i.test(checkoutJs),'Checkout refreshes expired customer sessions');

// Partner settlement/invoice guards
const partnerFulfillment=read('assets/js/partner-fulfillment.js');
const partnerInvoice=read('assets/js/partner-invoice.js');
const adminPartners=read('assets/js/admin-partners.js');
ok(/partner_update_fulfillment/i.test(partnerFulfillment),'Partner fulfillment updates are wired to RPC');
ok(/partner_customer_invoice/i.test(partnerInvoice),'Partner invoice fetches customer invoice data');
ok(/JsBarcode/i.test(partnerInvoice),'Partner invoice includes barcode support');
ok(/QRious/i.test(partnerInvoice),'Partner invoice includes QR support');
ok(/admin_partner_create_settlement/i.test(adminPartners),'Admin can create partner settlements');
ok(/admin_partner_mark_paid/i.test(adminPartners),'Admin can mark partner settlements paid');
ok(/duplicate key|unique constraint/i.test(adminPartners),'Partner settlement duplicate guard exists');

// Service-worker/cache guard: keep the worker small and explicit
if(fs.existsSync('service-worker.js')){
  const sw=read('service-worker.js');
  if(Buffer.byteLength(sw,'utf8')>20000) warn.push('service-worker.js is larger than 20 KB; review cache scope for mobile startup cost.');
}

for(const w of warn) console.warn('WARN:',w);
if(fail.length){
  console.error('\nFINAL PRODUCTION AUDIT FAILED');
  for(const f of fail) console.error('✗',f);
  process.exit(1);
}
console.log('\nFINAL PRODUCTION AUDIT PASSED');
