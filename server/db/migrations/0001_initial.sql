create table if not exists profiles (
  id integer primary key autoincrement,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'journalist' check (role in ('admin', 'manager', 'journalist')),
  password_hash text not null,
  avatar_path text,
  bio text,
  verified integer not null default 0 check (verified in (0, 1)),
  blue_badge integer not null default 0 check (blue_badge in (0, 1)),
  preferred_language text not null default 'en' check (preferred_language in ('rw', 'en', 'fr')),
  status text not null default 'pending' check (status in ('active', 'inactive', 'pending')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists profiles_role_idx on profiles (role);

create index if not exists profiles_status_idx on profiles (status);

create table if not exists sessions (
  id integer primary key autoincrement,
  user_id integer not null references profiles (id) on delete cascade,
  token_hash text not null unique,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at text not null,
  last_seen_at text
);

create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists password_reset_tokens (
  id integer primary key autoincrement,
  user_id integer not null references profiles (id) on delete cascade,
  token_hash text not null unique,
  expires_at text not null,
  used integer not null default 0 check (used in (0, 1)),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists categories (
  id integer primary key autoincrement,
  slug text not null unique,
  name_key text not null unique,
  description_key text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists articles (
  id integer primary key autoincrement,
  author_id integer not null references profiles (id) on delete cascade,
  category_id integer references categories (id) on delete set null,
  title text not null,
  slug text not null unique,
  content text not null default '',
  featured_image text,
  images text not null default '[]',
  youtube_url text,
  article_language text not null default 'en' check (article_language in ('rw', 'en', 'fr')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  constraint articles_slug_unique unique (slug)
);

create index if not exists articles_author_idx on articles (author_id);

create index if not exists articles_category_idx on articles (category_id);

create index if not exists articles_status_idx on articles (status);

create index if not exists articles_published_at_idx on articles (published_at desc);

create index if not exists articles_language_idx on articles (article_language);

insert into categories (slug, name_key, description_key) values
  ('rwanda', 'rwanda', 'rwanda'),
  ('politics', 'politics', 'politics'),
  ('business', 'business', 'business'),
  ('sports', 'sports', 'sports'),
  ('technology', 'technology', 'technology'),
  ('entertainment', 'entertainment', 'entertainment'),
  ('education', 'education', 'education'),
  ('health', 'health', 'health'),
  ('international', 'international', 'international')
on conflict (slug) do nothing;