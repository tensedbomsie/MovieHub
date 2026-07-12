create table if not exists watch_entries (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_date text,
  overview text,
  status text not null default 'want' check (status in ('want', 'watching', 'watched')),
  rating smallint check (rating between 1 and 5),
  review text,
  watch_date date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists watch_entries_owner_idx on watch_entries(owner);
create index if not exists watch_entries_tmdb_id_idx on watch_entries(tmdb_id);

alter table watch_entries enable row level security;

drop policy if exists "select own entries" on watch_entries;
create policy "select own entries" on watch_entries
  for select using (owner = auth.uid());

drop policy if exists "insert own entries" on watch_entries;
create policy "insert own entries" on watch_entries
  for insert with check (owner = auth.uid());

drop policy if exists "update own entries" on watch_entries;
create policy "update own entries" on watch_entries
  for update using (owner = auth.uid());

drop policy if exists "delete own entries" on watch_entries;
create policy "delete own entries" on watch_entries
  for delete using (owner = auth.uid());
