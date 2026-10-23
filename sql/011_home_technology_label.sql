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
