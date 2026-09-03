alter table articles add column breaking_news integer not null default 0 check (breaking_news in (0, 1));

create index if not exists articles_breaking_idx on articles (breaking_news);
