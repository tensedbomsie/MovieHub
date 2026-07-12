alter table watch_entries drop constraint if exists watch_entries_rating_check;
alter table watch_entries alter column rating type numeric(3, 1) using rating::numeric(3, 1);
alter table watch_entries add constraint watch_entries_rating_check check (rating between 0 and 10);

alter table watch_entries add column if not exists reflections jsonb not null default '[]'::jsonb;
