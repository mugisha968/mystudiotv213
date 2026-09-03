alter table articles add column featured integer not null default 0 check (featured in (0, 1));

alter table articles add column views integer not null default 0 check (views >= 0);

alter table articles add column tags text not null default '[]';

create index if not exists articles_featured_idx on articles (featured);