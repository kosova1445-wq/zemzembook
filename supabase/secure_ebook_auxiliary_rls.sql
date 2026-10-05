-- ZemZem eBook auxiliary RLS hardening
-- Safe for current architecture: public catalog data stays readable;
-- sensitive writes/reads remain behind Edge Functions using service role.

alter table public.ebook_series enable row level security;
alter table public.ebook_series_items enable row level security;
alter table public.ebook_gift_codes enable row level security;
alter table public.ebook_bundles enable row level security;
alter table public.ebook_bundle_items enable row level security;
alter table public.ebook_funnel_events enable row level security;
alter table public.ebook_abandoned_carts enable row level security;
alter table public.ebook_recommendations enable row level security;
alter table public.ebook_subscription_plans enable row level security;

-- Public catalog reads
drop policy if exists "Public can read ebook series" on public.ebook_series;
create policy "Public can read ebook series"
on public.ebook_series for select
to anon, authenticated
using (true);

drop policy if exists "Public can read ebook series items" on public.ebook_series_items;
create policy "Public can read ebook series items"
on public.ebook_series_items for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active ebook bundles" on public.ebook_bundles;
create policy "Public can read active ebook bundles"
on public.ebook_bundles for select
to anon, authenticated
using (
  coalesce(is_active, false) = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

drop policy if exists "Public can read ebook bundle items" on public.ebook_bundle_items;
create policy "Public can read ebook bundle items"
on public.ebook_bundle_items for select
to anon, authenticated
using (true);

drop policy if exists "Public can read ebook recommendations" on public.ebook_recommendations;
create policy "Public can read ebook recommendations"
on public.ebook_recommendations for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active ebook subscription plans" on public.ebook_subscription_plans;
create policy "Public can read active ebook subscription plans"
on public.ebook_subscription_plans for select
to anon, authenticated
using (coalesce(is_active, false) = true);

-- Sensitive tables intentionally have no anon/auth policies.
-- Current Edge Functions use the service role and continue to work:
-- ebook_gift_codes
-- ebook_funnel_events
-- ebook_abandoned_carts
