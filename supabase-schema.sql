-- ================================================
-- PORTFOLIO OS — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ================================================

-- PROFILE
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  tagline text not null default '',
  bio text not null default '',
  avatar_url text,
  email text not null default '',
  github_url text,
  linkedin_url text,
  location text not null default '',
  available boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Insert a default profile row
insert into profile (name, tagline, bio, email, location)
values ('Your Name', 'Full Stack Developer', 'Write your bio here...', 'you@gmail.com', 'Bengaluru, IN')
on conflict do nothing;

-- SKILLS
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Frontend',
  proficiency integer not null default 80 check (proficiency between 0 and 100),
  sort_order integer not null default 0
);

-- PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tech_stack text[] not null default '{}',
  github_url text,
  live_url text,
  featured boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- CONTACTS
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ================================================
-- RLS POLICIES
-- ================================================

alter table profile enable row level security;
alter table skills enable row level security;
alter table projects enable row level security;
alter table contacts enable row level security;

-- Profile: anyone can read, only service role can write
create policy "Public can read profile" on profile for select using (true);
create policy "Service role can update profile" on profile for all using (auth.role() = 'service_role');

-- Skills: anyone can read
create policy "Public can read skills" on skills for select using (true);
create policy "Service role can manage skills" on skills for all using (auth.role() = 'service_role');

-- Projects: anyone can read, only service role can write
create policy "Public can read projects" on projects for select using (true);
create policy "Service role can manage projects" on projects for all using (auth.role() = 'service_role');

-- Contacts: only service role can read/write (private)
create policy "Service role can manage contacts" on contacts for all using (auth.role() = 'service_role');

-- ================================================
-- AUTHENTICATED USER POLICIES (for admin dashboard)
-- ================================================

create policy "Auth users can update profile" on profile for all using (auth.role() = 'authenticated');
create policy "Auth users can manage skills" on skills for all using (auth.role() = 'authenticated');
create policy "Auth users can manage projects" on projects for all using (auth.role() = 'authenticated');
create policy "Auth users can manage contacts" on contacts for all using (auth.role() = 'authenticated');

-- ================================================
-- HELPER FUNCTION: increment view count
-- ================================================

create or replace function increment_view_count(project_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update projects set view_count = view_count + 1 where id = project_id;
end;
$$;

-- ================================================
-- STORAGE BUCKET FOR RESUME
-- ================================================

insert into storage.buckets (id, name, public)
values ('resume', 'resume', true)
on conflict do nothing;

create policy "Public can read resume" on storage.objects
  for select using (bucket_id = 'resume');

create policy "Auth users can upload resume" on storage.objects
  for insert with check (bucket_id = 'resume' and auth.role() = 'authenticated');

create policy "Auth users can update resume" on storage.objects
  for update using (bucket_id = 'resume' and auth.role() = 'authenticated');
