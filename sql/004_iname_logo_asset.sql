INSERT INTO site_settings (key, value) VALUES ('logo_url', '/logo-iname.png')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO site_settings (key, value) VALUES ('logo_alt', 'Iname')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
