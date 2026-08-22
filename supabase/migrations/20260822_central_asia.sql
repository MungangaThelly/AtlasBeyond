-- Extend privacy-safe community totals for expedition 004.
alter table public.community_explorers add column if not exists central_asia smallint not null default 0 check (central_asia between 0 and 3);

create or replace function public.sync_explorer_v2(p_device uuid,p_iceland integer,p_patagonia integer,p_east_africa integer,p_central_asia integer)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if p_device is null or p_iceland not between 0 and 3 or p_patagonia not between 0 and 3 or p_east_africa not between 0 and 3 or p_central_asia not between 0 and 3 then raise exception 'invalid progress'; end if;
  insert into public.community_explorers(device_id,iceland,patagonia,east_africa,central_asia)
  values(p_device,p_iceland,p_patagonia,p_east_africa,p_central_asia)
  on conflict(device_id) do update set iceland=greatest(community_explorers.iceland,excluded.iceland),patagonia=greatest(community_explorers.patagonia,excluded.patagonia),east_africa=greatest(community_explorers.east_africa,excluded.east_africa),central_asia=greatest(community_explorers.central_asia,excluded.central_asia),last_seen=now();
end $$;

create or replace function public.community_stats_v2()
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
  select jsonb_build_object('explorers',count(*),'discoveries',coalesce(sum(iceland+patagonia+east_africa+central_asia),0),'completions',coalesce(sum((iceland=3)::int+(patagonia=3)::int+(east_africa=3)::int+(central_asia=3)::int),0),'iceland',coalesce(sum(iceland),0),'patagonia',coalesce(sum(patagonia),0),'east_africa',coalesce(sum(east_africa),0),'central_asia',coalesce(sum(central_asia),0)) from public.community_explorers;
$$;

revoke all on function public.sync_explorer_v2(uuid,integer,integer,integer,integer) from public;
revoke all on function public.community_stats_v2() from public;
grant execute on function public.sync_explorer_v2(uuid,integer,integer,integer,integer) to anon,authenticated;
grant execute on function public.community_stats_v2() to anon,authenticated;
