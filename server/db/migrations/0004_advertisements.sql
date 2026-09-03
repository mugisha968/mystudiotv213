create table if not exists advertisements (
  id integer primary key autoincrement,
  title text not null,
  image_url text not null,
  link_url text,
  slot text not null check (slot in (
    'top-banner',
    'sidebar-top',
    'sidebar-bottom',
    'in-feed-1',
    'in-feed-2',
    'article-top',
    'article-mid',
    'mobile-banner',
    'footer-above'
  )),
  is_active integer not null default 1 check (is_active in (0, 1)),
  sort_order integer not null default 0,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists advertisements_slot_idx on advertisements (slot);
create index if not exists advertisements_active_idx on advertisements (is_active);
