-- Run this SQL in your Supabase dashboard (SQL Editor) to set up all required tables.
-- Run each block in order.

-- ============================================================
-- 1. WORKSPACES
-- ============================================================
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default 'from-emerald-500 to-teal-600',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table workspaces enable row level security;
create policy "workspaces_authenticated" on workspaces
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 2. RELEASES
-- ============================================================
create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  date text default '',
  start_date text,
  end_date text,
  color text not null default '#3B82F6',
  created_at timestamptz not null default now()
);

alter table releases enable row level security;
create policy "releases_authenticated" on releases
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 3. FEATURES
-- ============================================================
create table if not exists features (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  product_id text not null,
  title text not null,
  status text not null default 'new',
  score numeric,
  comments_count int not null default 0,
  release_id uuid references releases(id) on delete set null,
  tags text[] default '{}',
  assignee text,
  okr_id uuid,
  blocked_by text[] default '{}',
  reach numeric,
  impact numeric,
  confidence numeric,
  effort numeric,
  labels text[] default '{}',
  description text,
  prd_generated boolean default false,
  prd_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table features enable row level security;
create policy "features_authenticated" on features
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 4. OBJECTIVES
-- ============================================================
create table if not exists objectives (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  target_metric text not null default '',
  created_at timestamptz not null default now()
);

alter table objectives enable row level security;
create policy "objectives_authenticated" on objectives
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 5. IDEAS
-- ============================================================
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  author text not null default '',
  created_at timestamptz not null default now()
);

alter table ideas enable row level security;
create policy "ideas_authenticated" on ideas
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 6. WORKSPACE INVITATIONS
-- ============================================================
create table if not exists workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  email text not null,
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  invite_code text not null unique,
  inviter_email text,
  created_at timestamptz not null default now()
);

alter table workspace_invitations enable row level security;
create policy "invitations_authenticated" on workspace_invitations
  for all to authenticated using (true) with check (true);

create index if not exists idx_workspace_invitations_workspace_id on workspace_invitations(workspace_id);
create index if not exists idx_workspace_invitations_invite_code on workspace_invitations(invite_code);
create index if not exists idx_workspace_invitations_status on workspace_invitations(status);

-- ============================================================
-- 7. WORKSPACE MEMBERS
-- ============================================================
create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  user_id uuid not null,
  user_email text not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint unique_workspace_user unique(workspace_id, user_id)
);

alter table workspace_members enable row level security;
create policy "members_authenticated" on workspace_members
  for all to authenticated using (true) with check (true);

create index if not exists idx_workspace_members_workspace_id on workspace_members(workspace_id);
create index if not exists idx_workspace_members_user_id on workspace_members(user_id);
create index if not exists idx_workspace_members_email on workspace_members(user_email);
