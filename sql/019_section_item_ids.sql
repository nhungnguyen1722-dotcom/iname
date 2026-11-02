UPDATE page_sections AS section
SET items_json = (
  SELECT COALESCE(
    jsonb_agg(
      CASE
        WHEN jsonb_typeof(item) = 'object'
          AND COALESCE(item->>'id', '') = ''
          THEN item || jsonb_build_object('id', gen_random_uuid()::text)
        ELSE item
      END
      ORDER BY ordinal
    ),
    '[]'::jsonb
  )::text
  FROM jsonb_array_elements(COALESCE(NULLIF(section.items_json, '')::jsonb, '[]'::jsonb))
    WITH ORDINALITY AS section_items(item, ordinal)
)
WHERE section.items_json IS NOT NULL
  AND section.items_json <> ''
  AND jsonb_typeof(section.items_json::jsonb) = 'array';
