-- ZemZem Enterprise foundation: isolated modules, RLS-first, no changes to existing commerce tables.

create table if not exists public.enterprise_modules (
  key text primary key,
  name text not null,
  area text not null check (area in ('admin','customer','shared')),
  status text not null default 'foundation' check (status in ('foundation','testing','active','paused')),
  admin_enabled boolean not null default true,
  customer_enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.enterprise_modules(key,name,area) values
 ('copyright','Të drejtat & përkthimet','admin'),
 ('dynamic_pricing','Çmimet dinamike','admin'),
 ('b2b','B2B institucione','shared'),
 ('moderation','Moderimi i përmbajtjes','admin'),
 ('logistics','Optimizimi i korrierëve','admin'),
 ('gifting','Gift Cards & dhurata','shared'),
 ('used_marketplace','Tregu i librave të përdorur','customer'),
 ('reading_analytics','Ditari i leximit','customer'),
 ('self_publishing','Vetë-publikimi','customer'),
 ('audio','Audio-libra & podkaste','customer')
on conflict (key) do nothing;

create table if not exists public.copyright_licenses (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete set null,
  translated_title text not null,
  original_publisher text,
  rights_holder text,
  translator_name text,
  territory text,
  language_code text default 'sq',
  contract_reference text,
  license_start date,
  license_end date,
  royalty_type text default 'percentage',
  royalty_rate numeric(8,3),
  next_royalty_due date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule_type text not null default 'aged_stock',
  category_id uuid references public.categories(id) on delete set null,
  book_id uuid references public.books(id) on delete cascade,
  min_inventory_age_days integer not null default 0 check (min_inventory_age_days >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer not null default 100,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.b2b_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  organization_name text not null,
  organization_type text not null default 'school',
  tax_number text,
  contact_name text,
  email text,
  phone text,
  billing_address jsonb not null default '{}'::jsonb,
  annual_budget numeric(12,2) not null default 0,
  budget_used numeric(12,2) not null default 0,
  discount_percent numeric(5,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.b2b_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.b2b_accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  request_type text not null default 'quote',
  items jsonb not null default '[]'::jsonb,
  requested_total numeric(12,2),
  status text not null default 'submitted',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  content_excerpt text,
  risk_score numeric(5,2) not null default 0,
  flags text[] not null default '{}',
  decision text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.courier_services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  service_name text not null default 'Standard',
  countries text[] not null default '{}',
  base_price numeric(10,2) not null default 0,
  price_per_kg numeric(10,2) not null default 0,
  estimated_days_min integer,
  estimated_days_max integer,
  tracking_url_template text,
  is_active boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  purchaser_id uuid references auth.users(id) on delete set null,
  recipient_email text,
  recipient_name text,
  message text,
  initial_value numeric(10,2) not null check (initial_value > 0),
  balance numeric(10,2) not null check (balance >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.used_book_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author_name text,
  isbn text,
  description text,
  condition text not null default 'good',
  listing_type text not null default 'sale',
  price numeric(10,2),
  credit_value integer,
  city text,
  image_urls text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  target_books integer not null default 12 check (target_books > 0),
  target_pages integer check (target_pages is null or target_pages > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,year)
);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  book_title text,
  genre text,
  pages_read integer not null default 0 check (pages_read >= 0),
  minutes_read integer not null default 0 check (minutes_read >= 0),
  finished boolean not null default false,
  read_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.author_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  pen_name text,
  biography text,
  payout_method text,
  payout_details jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manuscripts (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.author_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  synopsis text,
  genre text,
  language_code text not null default 'sq',
  file_path text,
  cover_path text,
  status text not null default 'draft',
  sales_count integer not null default 0,
  earnings numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_titles (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete set null,
  title text not null,
  creator text,
  audio_type text not null default 'audiobook',
  cover_url text,
  duration_seconds integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.audio_titles add column if not exists audio_url text;

create table if not exists public.audio_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_title_id uuid not null references public.audio_titles(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id,audio_title_id)
);

alter table public.enterprise_modules enable row level security;
alter table public.copyright_licenses enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.b2b_accounts enable row level security;
alter table public.b2b_requests enable row level security;
alter table public.content_moderation_queue enable row level security;
alter table public.courier_services enable row level security;
alter table public.gift_cards enable row level security;
alter table public.used_book_listings enable row level security;
alter table public.reading_goals enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.author_profiles enable row level security;
alter table public.manuscripts enable row level security;
alter table public.audio_titles enable row level security;
alter table public.audio_progress enable row level security;

do $$
declare t text;
begin
  foreach t in array array['enterprise_modules','copyright_licenses','pricing_rules','b2b_accounts','b2b_requests','content_moderation_queue','courier_services','gift_cards','used_book_listings','reading_goals','reading_sessions','author_profiles','manuscripts','audio_titles','audio_progress'] loop
    execute format('drop policy if exists %I on public.%I', 'enterprise_admin_all_'||t, t);
    execute format('create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', 'enterprise_admin_all_'||t, t);
  end loop;
end $$;

drop policy if exists enterprise_customer_b2b_accounts on public.b2b_accounts;
create policy enterprise_customer_b2b_accounts on public.b2b_accounts for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_b2b_requests on public.b2b_requests;
create policy enterprise_customer_b2b_requests on public.b2b_requests for select to authenticated using ((select auth.uid())=user_id);

drop policy if exists enterprise_customer_used_listings on public.used_book_listings;
create policy enterprise_customer_used_listings on public.used_book_listings for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_reading_goals on public.reading_goals;
create policy enterprise_customer_reading_goals on public.reading_goals for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_reading_sessions on public.reading_sessions;
create policy enterprise_customer_reading_sessions on public.reading_sessions for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_author_profiles on public.author_profiles;
create policy enterprise_customer_author_profiles on public.author_profiles for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_manuscripts on public.manuscripts;
create policy enterprise_customer_manuscripts on public.manuscripts for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_audio_progress on public.audio_progress;
create policy enterprise_customer_audio_progress on public.audio_progress for all to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists enterprise_customer_gift_cards on public.gift_cards;
create policy enterprise_customer_gift_cards on public.gift_cards for select to authenticated
using ((select auth.uid())=purchaser_id);
drop policy if exists enterprise_public_audio_titles on public.audio_titles;
create policy enterprise_public_audio_titles on public.audio_titles for select to anon, authenticated
using (status='published');

grant select,insert,update,delete on public.used_book_listings,public.reading_goals,public.reading_sessions,public.author_profiles,public.manuscripts,public.audio_progress to authenticated;
grant select on public.b2b_accounts,public.b2b_requests,public.gift_cards,public.audio_titles to authenticated;
grant select on public.audio_titles to anon;
grant select,insert,update,delete on public.enterprise_modules,public.copyright_licenses,public.pricing_rules,public.b2b_accounts,public.b2b_requests,public.content_moderation_queue,public.courier_services,public.gift_cards,public.audio_titles to authenticated;

create index if not exists copyright_licenses_expiry_idx on public.copyright_licenses(license_end,next_royalty_due);
create index if not exists pricing_rules_active_idx on public.pricing_rules(is_active,starts_at,ends_at);
create index if not exists b2b_accounts_user_idx on public.b2b_accounts(user_id,status);
create index if not exists moderation_decision_idx on public.content_moderation_queue(decision,risk_score desc);
create index if not exists used_listings_user_idx on public.used_book_listings(user_id,status);
create index if not exists reading_sessions_user_date_idx on public.reading_sessions(user_id,read_on desc);
create index if not exists manuscripts_user_idx on public.manuscripts(user_id,status);
create index if not exists audio_progress_user_idx on public.audio_progress(user_id,updated_at desc);

-- Consolidate owner/admin access to avoid duplicate permissive policies.
drop policy if exists enterprise_customer_used_listings on public.used_book_listings;
do $$
declare t text;
begin
  foreach t in array array['used_book_listings','reading_goals','reading_sessions','author_profiles','manuscripts','audio_progress'] loop
    execute format('drop policy if exists %I on public.%I', 'enterprise_admin_all_'||t, t);
    execute format('drop policy if exists %I on public.%I', 'enterprise_customer_'||t, t);
    execute format('drop policy if exists %I on public.%I', 'enterprise_admin_or_owner_'||t, t);
    execute format('create policy %I on public.%I for all to authenticated using ((select private.is_admin()) or (select auth.uid())=user_id) with check ((select private.is_admin()) or (select auth.uid())=user_id)', 'enterprise_admin_or_owner_'||t, t);
  end loop;
end $$;

drop policy if exists enterprise_admin_all_b2b_accounts on public.b2b_accounts;
drop policy if exists enterprise_customer_b2b_accounts on public.b2b_accounts;
drop policy if exists enterprise_b2b_accounts_select on public.b2b_accounts;
drop policy if exists enterprise_b2b_accounts_insert_admin on public.b2b_accounts;
drop policy if exists enterprise_b2b_accounts_insert_admin_or_owner on public.b2b_accounts;
drop policy if exists enterprise_b2b_accounts_update_admin on public.b2b_accounts;
drop policy if exists enterprise_b2b_accounts_delete_admin on public.b2b_accounts;
create policy enterprise_b2b_accounts_select on public.b2b_accounts for select to authenticated using ((select private.is_admin()) or (select auth.uid())=user_id);
create policy enterprise_b2b_accounts_insert_admin on public.b2b_accounts for insert to authenticated with check ((select private.is_admin()));
create policy enterprise_b2b_accounts_update_admin on public.b2b_accounts for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy enterprise_b2b_accounts_delete_admin on public.b2b_accounts for delete to authenticated using ((select private.is_admin()));

drop policy if exists enterprise_admin_all_b2b_requests on public.b2b_requests;
drop policy if exists enterprise_customer_b2b_requests on public.b2b_requests;
drop policy if exists enterprise_b2b_requests_select on public.b2b_requests;
drop policy if exists enterprise_b2b_requests_insert_admin on public.b2b_requests;
drop policy if exists enterprise_b2b_requests_insert_admin_or_owner on public.b2b_requests;
drop policy if exists enterprise_b2b_requests_update_admin on public.b2b_requests;
drop policy if exists enterprise_b2b_requests_delete_admin on public.b2b_requests;
create policy enterprise_b2b_requests_select on public.b2b_requests for select to authenticated using ((select private.is_admin()) or (select auth.uid())=user_id);
create policy enterprise_b2b_requests_insert_admin on public.b2b_requests for insert to authenticated with check ((select private.is_admin()));
create policy enterprise_b2b_requests_update_admin on public.b2b_requests for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy enterprise_b2b_requests_delete_admin on public.b2b_requests for delete to authenticated using ((select private.is_admin()));

drop policy if exists enterprise_admin_all_gift_cards on public.gift_cards;
drop policy if exists enterprise_customer_gift_cards on public.gift_cards;
drop policy if exists enterprise_gift_cards_select on public.gift_cards;
drop policy if exists enterprise_gift_cards_insert_admin on public.gift_cards;
drop policy if exists enterprise_gift_cards_update_admin on public.gift_cards;
drop policy if exists enterprise_gift_cards_delete_admin on public.gift_cards;
create policy enterprise_gift_cards_select on public.gift_cards for select to authenticated using ((select private.is_admin()) or (select auth.uid())=purchaser_id);
create policy enterprise_gift_cards_insert_admin on public.gift_cards for insert to authenticated with check ((select private.is_admin()));
create policy enterprise_gift_cards_update_admin on public.gift_cards for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy enterprise_gift_cards_delete_admin on public.gift_cards for delete to authenticated using ((select private.is_admin()));

drop policy if exists enterprise_admin_all_audio_titles on public.audio_titles;
drop policy if exists enterprise_public_audio_titles on public.audio_titles;
drop policy if exists enterprise_audio_titles_anon_select on public.audio_titles;
drop policy if exists enterprise_audio_titles_auth_select on public.audio_titles;
drop policy if exists enterprise_audio_titles_insert_admin on public.audio_titles;
drop policy if exists enterprise_audio_titles_update_admin on public.audio_titles;
drop policy if exists enterprise_audio_titles_delete_admin on public.audio_titles;
create policy enterprise_audio_titles_anon_select on public.audio_titles for select to anon using (status='published');
create policy enterprise_audio_titles_auth_select on public.audio_titles for select to authenticated using (status='published' or (select private.is_admin()));
create policy enterprise_audio_titles_insert_admin on public.audio_titles for insert to authenticated with check ((select private.is_admin()));
create policy enterprise_audio_titles_update_admin on public.audio_titles for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy enterprise_audio_titles_delete_admin on public.audio_titles for delete to authenticated using ((select private.is_admin()));

create index if not exists audio_progress_audio_idx on public.audio_progress(audio_title_id);
create index if not exists audio_titles_book_idx on public.audio_titles(book_id);
create index if not exists b2b_requests_account_idx on public.b2b_requests(account_id);
create index if not exists b2b_requests_user_idx on public.b2b_requests(user_id);
create index if not exists moderation_reviewer_idx on public.content_moderation_queue(reviewed_by);
create index if not exists moderation_user_idx on public.content_moderation_queue(user_id);
create index if not exists copyright_licenses_book_idx on public.copyright_licenses(book_id);
create index if not exists gift_cards_purchaser_idx on public.gift_cards(purchaser_id);
create index if not exists manuscripts_author_idx on public.manuscripts(author_profile_id);
create index if not exists pricing_rules_book_idx on public.pricing_rules(book_id);
create index if not exists pricing_rules_category_idx on public.pricing_rules(category_id);
create index if not exists reading_sessions_book_idx on public.reading_sessions(book_id);

-- Customer module discovery and safe self-service onboarding.
drop policy if exists enterprise_admin_all_enterprise_modules on public.enterprise_modules;
drop policy if exists enterprise_modules_anon_read_active on public.enterprise_modules;
drop policy if exists enterprise_modules_auth_read on public.enterprise_modules;
drop policy if exists enterprise_modules_insert_admin on public.enterprise_modules;
drop policy if exists enterprise_modules_update_admin on public.enterprise_modules;
drop policy if exists enterprise_modules_delete_admin on public.enterprise_modules;
create policy enterprise_modules_anon_read_active on public.enterprise_modules for select to anon
using (status='active' and customer_enabled);
create policy enterprise_modules_auth_read on public.enterprise_modules for select to authenticated
using ((status='active' and customer_enabled) or (select private.is_admin()));
create policy enterprise_modules_insert_admin on public.enterprise_modules for insert to authenticated with check ((select private.is_admin()));
create policy enterprise_modules_update_admin on public.enterprise_modules for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy enterprise_modules_delete_admin on public.enterprise_modules for delete to authenticated using ((select private.is_admin()));
grant select on public.enterprise_modules to anon,authenticated;

drop policy if exists enterprise_b2b_accounts_insert_admin on public.b2b_accounts;
create policy enterprise_b2b_accounts_insert_admin_or_owner on public.b2b_accounts for insert to authenticated
with check ((select private.is_admin()) or ((select auth.uid())=user_id and status='pending'));
drop policy if exists enterprise_b2b_requests_insert_admin on public.b2b_requests;
create policy enterprise_b2b_requests_insert_admin_or_owner on public.b2b_requests for insert to authenticated
with check ((select private.is_admin()) or ((select auth.uid())=user_id and status='submitted'));
grant insert on public.b2b_accounts,public.b2b_requests to authenticated;

-- Automatic first-pass moderation for new/edited reviews. Human approval remains authoritative.
create or replace function private.queue_review_moderation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  body_text text := lower(coalesce(new.title,'') || ' ' || coalesce(new.body,''));
  found_flags text[] := '{}';
  score numeric(5,2) := 0;
begin
  if body_text ~ '(https?://|www\.)' then found_flags := array_append(found_flags,'link'); score := score + 35; end if;
  if body_text ~ '(.)\1{7,}' then found_flags := array_append(found_flags,'spam'); score := score + 30; end if;
  if length(body_text) > 2500 then found_flags := array_append(found_flags,'very_long'); score := score + 20; end if;
  if new.rating <= 1 and length(trim(body_text)) < 8 then found_flags := array_append(found_flags,'low_context'); score := score + 15; end if;
  if cardinality(found_flags) > 0 then
    insert into public.content_moderation_queue(source_type,source_id,user_id,content_excerpt,risk_score,flags,decision)
    values('review',new.id,new.user_id,left(body_text,500),least(score,100),found_flags,'pending');
  end if;
  return new;
end;
$$;
revoke all on function private.queue_review_moderation() from public,anon,authenticated;
drop trigger if exists reviews_enterprise_moderation on public.reviews;
create trigger reviews_enterprise_moderation after insert or update of title,body,rating on public.reviews
for each row execute function private.queue_review_moderation();
