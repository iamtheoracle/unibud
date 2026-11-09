-- UNIBUD first-party password credential and verification challenge persistence.
-- Apply after 0002_identity_access_control.sql. No raw password, OTP or destination is stored.

BEGIN;

CREATE TABLE password_credentials (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE RESTRICT,
  credential_hash TEXT NOT NULL CHECK (
    credential_hash ~ '^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$'
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  password_changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verification_challenges (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  channel TEXT NOT NULL CHECK (channel IN ('email','phone')),
  purpose TEXT NOT NULL CHECK (purpose IN (
    'email_verification','phone_verification','password_reset'
  )),
  target_digest BYTEA NOT NULL CHECK (octet_length(target_digest) = 32),
  code_digest BYTEA NOT NULL CHECK (octet_length(code_digest) = 32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 10),
  consumed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  CHECK (expires_at > created_at),
  CHECK (consumed_at IS NULL OR revoked_at IS NULL)
);

CREATE INDEX verification_challenges_account_idx
  ON verification_challenges(account_id, created_at DESC);
CREATE INDEX verification_challenges_active_idx
  ON verification_challenges(account_id, purpose, expires_at)
  WHERE consumed_at IS NULL AND revoked_at IS NULL;

ALTER TABLE password_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_credentials FORCE ROW LEVEL SECURITY;
CREATE POLICY password_credentials_account_isolation ON password_credentials
  USING (account_id = unibud_private.current_account_id())
  WITH CHECK (account_id = unibud_private.current_account_id());

ALTER TABLE verification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_challenges FORCE ROW LEVEL SECURITY;
CREATE POLICY verification_challenges_account_isolation ON verification_challenges
  USING (account_id = unibud_private.current_account_id())
  WITH CHECK (account_id = unibud_private.current_account_id());

GRANT SELECT, INSERT, UPDATE ON password_credentials, verification_challenges TO unibud_app;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON password_credentials, verification_challenges
  FROM unibud_app, unibud_readonly;

COMMENT ON TABLE password_credentials IS
  'Adaptive password verifiers only; raw passwords are never stored or logged.';
COMMENT ON TABLE verification_challenges IS
  'Short-lived one-time verification/reset challenges; stores keyed digests, never raw codes or destination addresses.';

COMMIT;
