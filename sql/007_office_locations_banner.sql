ALTER TABLE office_locations ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE office_locations ADD COLUMN IF NOT EXISTS banner_alt VARCHAR(300);
