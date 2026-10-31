UPDATE page_sections AS s
SET items_json = (
      SELECT COALESCE(
        jsonb_agg(
          CASE item.value->>'name'
            WHEN 'PostgreSQL' THEN item.value || jsonb_build_object('logoUrl', '/images/postgresql-logo.png')
            WHEN 'AWS' THEN item.value || jsonb_build_object('logoUrl', '/images/aws-logo.png')
            ELSE item.value
          END
          ORDER BY item.ordinality
        ),
        '[]'::jsonb
      )::text
      FROM jsonb_array_elements(COALESCE(NULLIF(s.items_json, '')::jsonb, '[]'::jsonb))
        WITH ORDINALITY AS item(value, ordinality)
    ),
    updated_at = NOW()
FROM pages AS p
WHERE s.page_id = p.id
  AND p.path = '/giai-phap-cong-nghe'
  AND s.section_key = 'tech-stack'
  AND s.deleted_at IS NULL;
