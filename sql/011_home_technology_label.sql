-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE page_sections
SET items_json = replace(
  items_json,
  'Giải pháp Công nghệ (Website, Phần mềm, AI Agent)',
  'Giải pháp Công nghệ'
),
updated_at = NOW()
WHERE section_key = 'home-pillars'
  AND deleted_at IS NULL
  AND items_json LIKE '%Giải pháp Công nghệ (Website, Phần mềm, AI Agent)%'
;
