-- Secure PayPal Business configuration managed from ZemZem Admin.
-- Applied to Supabase on 2026-09-18.
create or replace function public.paypal_runtime_config()
returns table(configured boolean, enabled boolean, mode text, client_id text, client_secret text)
language sql security definer stable
set search_path = pg_catalog, public, vault
as $$
  with values_by_name as (
    select name, decrypted_secret from vault.decrypted_secrets
    where name in ('zemzem_paypal_enabled','zemzem_paypal_mode','zemzem_paypal_client_id','zemzem_paypal_client_secret')
  )
  select
    coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_client_id'),'') <> '' and coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_client_secret'),'') <> '',
    coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_enabled'),'false') = 'true',
    case when lower(coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_mode'),'sandbox'))='live' then 'live' else 'sandbox' end,
    coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_client_id'),''),
    coalesce(max(decrypted_secret) filter (where name='zemzem_paypal_client_secret'),'')
  from values_by_name;
$$;
revoke all on function public.paypal_runtime_config() from public, anon, authenticated;
grant execute on function public.paypal_runtime_config() to service_role;

create or replace function public.paypal_config_save(p_mode text,p_client_id text default null,p_client_secret text default null,p_enabled boolean default false)
returns void language plpgsql security definer
set search_path = pg_catalog, public, vault
as $$
declare v_mode text := case when lower(coalesce(p_mode,''))='live' then 'live' else 'sandbox' end; v_id uuid;
begin
  if p_client_id is not null and length(trim(p_client_id)) > 5 then
    select id into v_id from vault.secrets where name='zemzem_paypal_client_id';
    if v_id is null then perform vault.create_secret(trim(p_client_id),'zemzem_paypal_client_id','ZemZem PayPal REST client ID');
    else perform vault.update_secret(v_id,trim(p_client_id),'zemzem_paypal_client_id','ZemZem PayPal REST client ID'); end if;
  end if;
  v_id := null;
  if p_client_secret is not null and length(trim(p_client_secret)) > 5 then
    select id into v_id from vault.secrets where name='zemzem_paypal_client_secret';
    if v_id is null then perform vault.create_secret(trim(p_client_secret),'zemzem_paypal_client_secret','ZemZem PayPal REST client secret');
    else perform vault.update_secret(v_id,trim(p_client_secret),'zemzem_paypal_client_secret','ZemZem PayPal REST client secret'); end if;
  end if;
  v_id := null; select id into v_id from vault.secrets where name='zemzem_paypal_mode';
  if v_id is null then perform vault.create_secret(v_mode,'zemzem_paypal_mode','ZemZem PayPal environment');
  else perform vault.update_secret(v_id,v_mode,'zemzem_paypal_mode','ZemZem PayPal environment'); end if;
  v_id := null; select id into v_id from vault.secrets where name='zemzem_paypal_enabled';
  if v_id is null then perform vault.create_secret(case when p_enabled then 'true' else 'false' end,'zemzem_paypal_enabled','ZemZem PayPal checkout switch');
  else perform vault.update_secret(v_id,case when p_enabled then 'true' else 'false' end,'zemzem_paypal_enabled','ZemZem PayPal checkout switch'); end if;
end;
$$;
revoke all on function public.paypal_config_save(text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.paypal_config_save(text,text,text,boolean) to service_role;
