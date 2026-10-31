UPDATE page_sections AS s
SET items_json = (
      SELECT COALESCE(
        jsonb_agg(
          CASE item.value->>'name'
            WHEN 'Next.js' THEN item.value || jsonb_build_object('logoUrl', 'https://cdn.simpleicons.org/nextdotjs/000000')
            WHEN 'React' THEN item.value || jsonb_build_object('logoUrl', 'https://cdn.simpleicons.org/react/61DAFB')
            WHEN 'Node.js' THEN item.value || jsonb_build_object('logoUrl', 'https://cdn.simpleicons.org/nodedotjs/339933')
            WHEN 'PostgreSQL' THEN item.value || jsonb_build_object('logoUrl', '/images/postgresql-logo.png')
            WHEN 'AWS' THEN item.value || jsonb_build_object('logoUrl', '/images/aws-logo.png')
            WHEN 'Docker' THEN item.value || jsonb_build_object('logoUrl', 'https://cdn.simpleicons.org/docker/2496ED')
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
