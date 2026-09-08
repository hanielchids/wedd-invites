-- Harden the photos bucket: 15MB cap, images only (heic allowed for iOS camera-roll uploads)
update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif']
where id = 'photos';
