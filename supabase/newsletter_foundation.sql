-- ZemZem newsletter subscriptions: public write-only, Admin read/manage.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'active' check(status in ('active','unsubscribed')),
  source text not null default 'homepage',
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_email_format check(email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);
create unique index if not exists newsletter_email_unique_ci on public.newsletter_subscribers(lower(email));
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon,authenticated;
grant insert on public.newsletter_subscribers to anon,authenticated;
grant select,update,delete on public.newsletter_subscribers to authenticated;
drop policy if exists newsletter_public_insert on public.newsletter_subscribers;
create policy newsletter_public_insert on public.newsletter_subscribers for insert to anon,authenticated
with check(status='active' and source in ('homepage','checkout','account'));
drop policy if exists newsletter_admin_select on public.newsletter_subscribers;
create policy newsletter_admin_select on public.newsletter_subscribers for select to authenticated
using((select private.is_admin()));
drop policy if exists newsletter_admin_update on public.newsletter_subscribers;
create policy newsletter_admin_update on public.newsletter_subscribers for update to authenticated
using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers for delete to authenticated
using((select private.is_admin()));

