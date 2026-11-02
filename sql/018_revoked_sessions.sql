CREATE TABLE IF NOT EXISTS revoked_sessions (
  token_hash VARCHAR(64) PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS revoked_sessions_expires_at_idx
  ON revoked_sessions (expires_at);
