-- Expand the article workflow to support a newsroom pipeline:
-- DRAFT -> PENDING_REVIEW -> APPROVED -> (PUBLISHED | SCHEDULED -> PUBLISHED)
-- plus REJECTED and ARCHIVED, scheduled publishing, and a review audit trail.
--
-- SQLite cannot alter a CHECK constraint in place, so we rebuild the table
-- using the standard 12-step move, preserving all existing rows and indexes.

create table articles_new (
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
  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published', 'archived'
  )),
  published_at text,
  scheduled_at text,
  submitted_at text,
  reviewed_by integer references profiles (id) on delete set null,
  reviewed_at text,
  reject_reason text,
  featured integer not null default 0 check (featured in (0, 1)),
  views integer not null default 0 check (views >= 0),
  tags text not null default '[]',
  breaking_news integer not null default 0 check (breaking_news in (0, 1)),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

insert into articles_new (
  id, author_id, category_id, title, slug, content, featured_image, images,
  youtube_url, article_language, status, published_at, featured, views, tags,
  breaking_news, created_at, updated_at
)
select
  id, author_id, category_id, title, slug, content, featured_image, images,
  youtube_url, article_language, status, published_at, featured, views, tags,
  breaking_news, created_at, updated_at
from articles;

drop table articles;

alter table articles_new rename to articles;

create index if not exists articles_author_idx on articles (author_id);
create index if not exists articles_category_idx on articles (category_id);
create index if not exists articles_status_idx on articles (status);
create index if not exists articles_published_at_idx on articles (published_at desc);
create index if not exists articles_language_idx on articles (article_language);
create index if not exists articles_featured_idx on articles (featured);
create index if not exists articles_breaking_idx on articles (breaking_news);
create index if not exists articles_reviewed_by_idx on articles (reviewed_by);
create index if not exists articles_scheduled_at_idx on articles (scheduled_at);
