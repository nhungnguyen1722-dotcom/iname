CREATE TABLE IF NOT EXISTS contact_ip_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_ip_attempts_ip_created_idx
  ON contact_ip_attempts (ip, created_at DESC);
