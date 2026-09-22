-- ============================================================
-- Photo numbers — every upload gets a stable sequential #NN,
-- assigned in capture order, so polaroids can be referenced in
-- the thank-you mail merge ("attach #12 and #47 for the Dlaminis").
-- ============================================================

alter table uploads add column if not exists photo_no int;

-- Backfill existing photos in the order they landed on the wall
with numbered as (
  select id, row_number() over (order by created_at, id) as rn
  from uploads
)
update uploads u
set photo_no = n.rn
from numbered n
where u.id = n.id and u.photo_no is null;

-- New uploads keep counting from where the backfill left off
create sequence if not exists uploads_photo_no_seq;
select setval(
  'uploads_photo_no_seq',
  greatest(coalesce((select max(photo_no) from uploads), 0), 1),
  (select count(*) > 0 from uploads)
);
alter table uploads alter column photo_no set default nextval('uploads_photo_no_seq');

alter table uploads drop constraint if exists uploads_photo_no_key;
alter table uploads add constraint uploads_photo_no_key unique (photo_no);
