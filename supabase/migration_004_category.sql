alter table watch_entries add column if not exists category text not null default 'movie'
  check (category in ('movie', 'series', 'anime'));

create index if not exists watch_entries_category_idx on watch_entries(category);
