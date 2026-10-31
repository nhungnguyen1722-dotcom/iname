CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip VARCHAR(64) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $idx$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'login_attempts_email_created_idx') THEN
    CREATE INDEX login_attempts_email_created_idx ON login_attempts (email, created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'login_attempts_ip_created_idx') THEN
    CREATE INDEX login_attempts_ip_created_idx ON login_attempts (ip, created_at DESC);
  END IF;
END
$idx$;
