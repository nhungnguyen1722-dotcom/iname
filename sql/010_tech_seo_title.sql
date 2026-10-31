-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE pages
SET seo_title = 'Giải pháp công nghệ',
    updated_at = NOW()
WHERE path = '/giai-phap-cong-nghe'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM pages existing
    WHERE existing.path = '/giai-phap-cong-nghe' AND existing.deleted_at IS NULL
  )
;