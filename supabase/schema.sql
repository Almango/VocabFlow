-- 启用匿名登录：Supabase Dashboard -> Authentication -> Providers -> Anonymous -> Enabled

-- 用户数据表，每个用户一行，整份数据以 JSON 存储
-- 适合纯客户端应用快速上云；如需服务端查询单词，可再拆分为关系表
create table if not exists user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  groups_json jsonb not null default '[]'::jsonb,
  review_state_json jsonb,
  updated_at timestamptz not null default now()
);

alter table user_data enable row level security;

create policy "Users can manage own data"
  on user_data
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 可选：公开读取策略（不推荐），如果希望未登录用户也能读取某份数据可开启
-- create policy "Public read"
--   on user_data
--   for select
--   to anon
--   using (true);
