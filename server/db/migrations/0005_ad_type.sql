alter table advertisements add column ad_type text not null default 'image' check (ad_type in ('image', 'html'));

alter table advertisements add column html_content text;
