-- ZemZem AI & Automation foundation (Kosovo)
-- Additive only: no existing commerce table is altered.

insert into public.enterprise_modules(key,name,area,status,admin_enabled,customer_enabled,config) values
 ('ai_catalog','AI për përshkrime & SEO','admin','testing',true,false,'{"provider":"not_configured","language":"sq","require_review":true}'::jsonb),
 ('stock_forecasting','Parashikimi i stokut','admin','testing',true,false,'{"forecast_days":90,"history_months":12,"minimum_confidence":0.6}'::jsonb),
 ('publisher_ads','Reklamat e botuesve','admin','testing',true,false,'{"currency":"EUR","manual_approval":true}'::jsonb),
 ('kosovo_fiscalization','Fiskalizimi — Kosovë','admin','testing',true,false,'{"country":"XK","currency":"EUR","tax_authority":"ATK","mode":"sandbox","vat_rate":18,"provider":"not_configured","business_nui":"","fiscal_device_id":""}'::jsonb),
 ('smart_librarian','Librariani virtual','customer','testing',true,false,'{"mode":"catalog_only","language":"sq","max_results":6}'::jsonb),
 ('book_summaries','Përmbledhje 15-minutëshe','customer','testing',true,false,'{"preview_seconds":60,"default_access":"customer"}'::jsonb),
 ('book_clubs','Grup-librat privatë','customer','testing',true,false,'{"max_members":30,"messages_enabled":true}'::jsonb),
 ('rewards','Monedhat e leximit','customer','testing',true,false,'{"currency_name":"Monedha leximi","review_points":10,"referral_points":50}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.ai_catalog_jobs (
 id uuid primary key default gen_random_uuid(), book_id uuid references public.books(id) on delete cascade,
 requested_by uuid references auth.users(id) on delete set null, status text not null default 'queued',
 input jsonb not null default '{}'::jsonb, output jsonb not null default '{}'::jsonb,
 provider text, error_message text, created_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.stock_forecasts (
 id uuid primary key default gen_random_uuid(), book_id uuid not null references public.books(id) on delete cascade,
 forecast_from date not null default current_date, forecast_to date not null,
 predicted_demand integer not null default 0, suggested_reorder integer not null default 0,
 confidence numeric(5,4) not null default 0, factors jsonb not null default '{}'::jsonb,
 generated_at timestamptz not null default now(), unique(book_id,forecast_from,forecast_to)
);
create table if not exists public.publisher_ad_campaigns (
 id uuid primary key default gen_random_uuid(), publisher_id uuid references public.publishers(id) on delete set null,
 book_id uuid references public.books(id) on delete set null, name text not null,
 placement text not null default 'homepage', budget numeric(12,2) not null default 0,
 daily_budget numeric(12,2), starts_at timestamptz, ends_at timestamptz,
 status text not null default 'draft', impressions bigint not null default 0, clicks bigint not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.fiscal_invoices (
 id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete restrict,
 invoice_number text unique, country_code text not null default 'XK', currency text not null default 'EUR',
 subtotal numeric(12,2) not null default 0, tax_amount numeric(12,2) not null default 0,
 total numeric(12,2) not null default 0, business_nui text, customer_tax_number text,
 status text not null default 'draft', fiscal_reference text, provider text,
 request_payload jsonb not null default '{}'::jsonb, response_payload jsonb not null default '{}'::jsonb,
 error_message text, issued_at timestamptz, submitted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.book_summaries (
 id uuid primary key default gen_random_uuid(), book_id uuid not null references public.books(id) on delete cascade,
 title text not null, text_summary text, audio_url text, duration_seconds integer not null default 0,
 access_level text not null default 'customer', status text not null default 'draft',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(book_id)
);
create table if not exists public.book_clubs (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null, description text, book_id uuid references public.books(id) on delete set null,
 privacy text not null default 'private', invite_code text unique default encode(gen_random_bytes(8),'hex'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.book_club_members (
 club_id uuid not null references public.book_clubs(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, role text not null default 'member',
 joined_at timestamptz not null default now(), primary key(club_id,user_id)
);
create table if not exists public.book_club_messages (
 id uuid primary key default gen_random_uuid(), club_id uuid not null references public.book_clubs(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, body text not null check(length(body) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table if not exists public.reward_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade, balance integer not null default 0 check(balance >= 0),
 lifetime_earned integer not null default 0 check(lifetime_earned >= 0), updated_at timestamptz not null default now()
);
create table if not exists public.reward_transactions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 points integer not null, reason text not null, reference_type text, reference_id uuid,
 created_at timestamptz not null default now()
);
create table if not exists public.reward_catalog (
 id uuid primary key default gen_random_uuid(), name text not null, description text, points_cost integer not null check(points_cost > 0),
 stock integer check(stock is null or stock >= 0), image_url text, status text not null default 'draft', created_at timestamptz not null default now()
);
create table if not exists public.reward_redemptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 reward_id uuid not null references public.reward_catalog(id) on delete restrict, points_spent integer not null check(points_spent > 0),
 status text not null default 'requested', shipping_address jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

do $$ declare t text; begin
 foreach t in array array['ai_catalog_jobs','stock_forecasts','publisher_ad_campaigns','fiscal_invoices','book_summaries','book_clubs','book_club_members','book_club_messages','reward_accounts','reward_transactions','reward_catalog','reward_redemptions'] loop
  execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;

-- Admin-owned tables. External AI and fiscal submissions must run server-side, never from the browser.
do $$ declare t text; begin
 foreach t in array array['ai_catalog_jobs','stock_forecasts','publisher_ad_campaigns','fiscal_invoices','book_summaries','reward_catalog'] loop
  execute format('drop policy if exists %I on public.%I','ai_auto_admin_'||t,t);
  execute format('create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))','ai_auto_admin_'||t,t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;

drop policy if exists summaries_customer_read on public.book_summaries;
create policy summaries_customer_read on public.book_summaries for select to authenticated using(status='published');
drop policy if exists clubs_owner_read on public.book_clubs;
create policy clubs_owner_read on public.book_clubs for select to authenticated using(owner_id=(select auth.uid()) or exists(select 1 from public.book_club_members m where m.club_id=id and m.user_id=(select auth.uid())) or (select private.is_admin()));
drop policy if exists clubs_owner_insert on public.book_clubs;
create policy clubs_owner_insert on public.book_clubs for insert to authenticated with check(owner_id=(select auth.uid()));
drop policy if exists clubs_owner_update on public.book_clubs;
create policy clubs_owner_update on public.book_clubs for update to authenticated using(owner_id=(select auth.uid()) or (select private.is_admin())) with check(owner_id=(select auth.uid()) or (select private.is_admin()));
drop policy if exists club_members_read on public.book_club_members;
create policy club_members_read on public.book_club_members for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.book_clubs c where c.id=club_id and c.owner_id=(select auth.uid())) or (select private.is_admin()));
drop policy if exists club_messages_member_read on public.book_club_messages;
create policy club_messages_member_read on public.book_club_messages for select to authenticated using(exists(select 1 from public.book_club_members m where m.club_id=book_club_messages.club_id and m.user_id=(select auth.uid())) or exists(select 1 from public.book_clubs c where c.id=book_club_messages.club_id and c.owner_id=(select auth.uid())) or (select private.is_admin()));
drop policy if exists club_messages_member_insert on public.book_club_messages;
create policy club_messages_member_insert on public.book_club_messages for insert to authenticated with check(user_id=(select auth.uid()) and (exists(select 1 from public.book_club_members m where m.club_id=book_club_messages.club_id and m.user_id=(select auth.uid())) or exists(select 1 from public.book_clubs c where c.id=book_club_messages.club_id and c.owner_id=(select auth.uid()))));

do $$ declare t text; begin
 foreach t in array array['reward_accounts','reward_transactions','reward_redemptions'] loop
  execute format('drop policy if exists %I on public.%I','rewards_owner_read_'||t,t);
  execute format('create policy %I on public.%I for select to authenticated using (user_id=(select auth.uid()) or (select private.is_admin()))','rewards_owner_read_'||t,t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
drop policy if exists rewards_catalog_read on public.reward_catalog;
create policy rewards_catalog_read on public.reward_catalog for select to authenticated using(status='active' or (select private.is_admin()));

create index if not exists ai_catalog_jobs_book_idx on public.ai_catalog_jobs(book_id);
create index if not exists stock_forecasts_book_idx on public.stock_forecasts(book_id);
create index if not exists fiscal_invoices_order_idx on public.fiscal_invoices(order_id);
create index if not exists club_messages_club_created_idx on public.book_club_messages(club_id,created_at);
create index if not exists reward_transactions_user_idx on public.reward_transactions(user_id,created_at desc);
create index if not exists ai_catalog_jobs_requested_by_idx on public.ai_catalog_jobs(requested_by);
create index if not exists publisher_ad_campaigns_publisher_idx on public.publisher_ad_campaigns(publisher_id);
create index if not exists publisher_ad_campaigns_book_idx on public.publisher_ad_campaigns(book_id);
create index if not exists book_clubs_owner_idx on public.book_clubs(owner_id);
create index if not exists book_clubs_book_idx on public.book_clubs(book_id);
create index if not exists book_club_members_user_idx on public.book_club_members(user_id);
create index if not exists book_club_messages_user_idx on public.book_club_messages(user_id);
create index if not exists reward_redemptions_user_idx on public.reward_redemptions(user_id);
create index if not exists reward_redemptions_reward_idx on public.reward_redemptions(reward_id);

-- Membership checks live outside the exposed API schema and avoid recursive RLS evaluation.
create or replace function private.is_book_club_member(p_club_id uuid)
returns boolean language sql stable security definer
set search_path=pg_catalog,public,private
as $$ select exists(select 1 from public.book_club_members where club_id=p_club_id and user_id=auth.uid()) $$;
revoke all on function private.is_book_club_member(uuid) from public,anon;
grant execute on function private.is_book_club_member(uuid) to authenticated;

drop policy if exists clubs_owner_read on public.book_clubs;
create policy clubs_owner_read on public.book_clubs for select to authenticated
using(owner_id=(select auth.uid()) or (select private.is_book_club_member(id)) or (select private.is_admin()));
drop policy if exists club_members_read on public.book_club_members;
create policy club_members_read on public.book_club_members for select to authenticated
using(user_id=(select auth.uid()) or (select private.is_admin()));
drop policy if exists club_messages_member_read on public.book_club_messages;
create policy club_messages_member_read on public.book_club_messages for select to authenticated
using((select private.is_book_club_member(club_id)) or exists(select 1 from public.book_clubs c where c.id=club_id and c.owner_id=(select auth.uid())) or (select private.is_admin()));

-- One SELECT policy per role for mixed admin/customer catalogues.
drop policy if exists ai_auto_admin_book_summaries on public.book_summaries;
drop policy if exists summaries_customer_read on public.book_summaries;
drop policy if exists summaries_read on public.book_summaries;
drop policy if exists summaries_insert_admin on public.book_summaries;
drop policy if exists summaries_update_admin on public.book_summaries;
drop policy if exists summaries_delete_admin on public.book_summaries;
create policy summaries_read on public.book_summaries for select to authenticated
using(status='published' or (select private.is_admin()));
create policy summaries_insert_admin on public.book_summaries for insert to authenticated with check((select private.is_admin()));
create policy summaries_update_admin on public.book_summaries for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy summaries_delete_admin on public.book_summaries for delete to authenticated using((select private.is_admin()));
drop policy if exists ai_auto_admin_reward_catalog on public.reward_catalog;
drop policy if exists rewards_catalog_read on public.reward_catalog;
drop policy if exists rewards_catalog_insert_admin on public.reward_catalog;
drop policy if exists rewards_catalog_update_admin on public.reward_catalog;
drop policy if exists rewards_catalog_delete_admin on public.reward_catalog;
create policy rewards_catalog_read on public.reward_catalog for select to authenticated
using(status='active' or (select private.is_admin()));
create policy rewards_catalog_insert_admin on public.reward_catalog for insert to authenticated with check((select private.is_admin()));
create policy rewards_catalog_update_admin on public.reward_catalog for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy rewards_catalog_delete_admin on public.reward_catalog for delete to authenticated using((select private.is_admin()));
