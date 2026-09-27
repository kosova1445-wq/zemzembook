# ZemZem Go-Live Checklist

## Storefront & Mobile
- [x] Ballina ka mobile viewport dhe performance monitoring.
- [x] Shop ka mobile containment dhe filter UI responsive.
- [x] Shop category filter crash u rregullua.
- [x] Product page ka mobile layout, sticky buy dock dhe Product/Book structured data.
- [x] Checkout ka COD, PayPal, shipping, coupons, totals dhe server-side quote.
- [x] Account, Blog, eBook dhe Partner portal kanë mobile viewport.
- [x] PWA manifest është lidhur në faqet kryesore.
- [x] PWA shortcuts: Shop, eBook, Blog.
- [x] Service worker mbetet network-first pa fetch cache agresiv.

## Checkout & Payments
- [x] COD server-side flow.
- [x] PayPal server-side create/capture flow.
- [x] payment_discount = 0 për PayPal.
- [x] Shipping KS/AL/MK verifikuar.
- [x] Kuponët aplikohen vetëm kur lejohen.
- [x] Totali i porosive pa mospërputhje në auditin e databazës.

## Partner Marketplace
- [x] Partner RPC kërkojnë authenticated user.
- [x] Fulfillment ndahet sipas partnerit.
- [x] Shipped/Delivered flow.
- [x] Settlement flow.
- [x] Invoice data.
- [x] 0 partner books me stok negativ.
- [x] 0 shipped fulfillment pa tracking.
- [x] 0 duplicate settlement periods.

## Admin
- [x] 39 module të rënda janë lazy-loaded.
- [x] 0 script-e të dyfishta.
- [x] Business Center syntax error u rregullua.
- [x] Blog Admin, Partner Center, Invoices dhe Security modules janë aktive.
- [x] Admin mobile layout guards ekzistojnë.

## Orders & Invoices
- [x] 0 orphan order items.
- [x] 0 orphan partner fulfillments.
- [x] 0 orphan invoices.
- [x] 0 invoice total mismatches.
- [x] 0 duplicate invoice numbers.

## SEO
- [x] Canonical për Ballinë/Shop/Product.
- [x] Product + Book structured data.
- [x] Breadcrumb structured data.
- [x] Blog Article structured data.
- [x] Dynamic sitemap për artikuj dhe libra të publikuar.
- [x] robots.txt tregon sitemap.

## Security
- [x] RLS aktiv në tabelat publike.
- [x] Tabelat administrative pa policy u kufizuan për admin.
- [x] Partner internal RPC nuk janë të ekzekutueshme nga anon.
- [x] Partner RLS auth.uid() u optimizua.
- [ ] Enable Supabase Auth leaked-password protection nga dashboard-i i Supabase.

## Performance
- [x] Core Web Vitals telemetry aktive.
- [x] Mobile INP p75 nën 200 ms në auditin e fundit.
- [x] Mobile LCP p75 nën 1 s në auditin e fundit.
- [x] CLS mobile 0.0 në auditin e fundit.
- [x] Partner RLS performance warnings u hoqën.

## Final release
- [ ] Production Final Audit = success.
- [ ] Validate Storefront SEO = success.
- [ ] Validate ZemZem Frontend = success.
- [ ] Deploy ZemZem to cPanel = success.
- [ ] Live Mobile Smoke = success ose skipped vetëm kur kushtet nuk kërkojnë run.
- [ ] Krijo branch/tag Production Stable pas deploy-it green.
