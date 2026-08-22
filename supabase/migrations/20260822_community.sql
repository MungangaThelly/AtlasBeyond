-- Atlas Beyond community aggregation. Stores no names, locations, or journal text.
create table if not exists public.community_explorers (
  device_id uuid primary key,
  iceland smallint not null default 0 check (iceland between 0 and 3),
  patagonia smallint not null default 0 check (patagonia between 0 and 3),
  east_africa smallint not null default 0 check (east_africa between 0 and 3),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.community_explorers enable row level security;
revoke all on table public.community_explorers from public, anon, authenticated;

create or replace function public.sync_explorer(p_device uuid,p_iceland integer,p_patagonia integer,p_east_africa integer)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if p_device is null or p_iceland not between 0 and 3 or p_patagonia not between 0 and 3 or p_east_africa not between 0 and 3 then raise exception 'invalid progress'; end if;
  insert into public.community_explorers(device_id,iceland,patagonia,east_africa)
  values(p_device,p_iceland,p_patagonia,p_east_africa)
  on conflict(device_id) do update set
    iceland=greatest(community_explorers.iceland,excluded.iceland),
    patagonia=greatest(community_explorers.patagonia,excluded.patagonia),
    east_africa=greatest(community_explorers.east_africa,excluded.east_africa),last_seen=now();
end $$;

create or replace function public.community_stats()
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
  select jsonb_build_object('explorers',count(*),'discoveries',coalesce(sum(iceland+patagonia+east_africa),0),'completions',coalesce(sum((iceland=3)::int+(patagonia=3)::int+(east_africa=3)::int),0),'iceland',coalesce(sum(iceland),0),'patagonia',coalesce(sum(patagonia),0),'east_africa',coalesce(sum(east_africa),0)) from public.community_explorers;
$$;

revoke all on function public.sync_explorer(uuid,integer,integer,integer) from public;
revoke all on function public.community_stats() from public;
grant execute on function public.sync_explorer(uuid,integer,integer,integer) to anon,authenticated;
grant execute on function public.community_stats() to anon,authenticated;
