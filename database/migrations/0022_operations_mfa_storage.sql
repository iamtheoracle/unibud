-- Protected storage foundation for Operations authenticator enrollment.
-- This migration deliberately exposes no MFA verification or activation API.
-- All application access remains denied until reviewed SECURITY DEFINER procedures
-- bind verified account/session context and cryptographic assertions.

BEGIN;

CREATE TABLE public.unibud_operator_mfa_credentials (
  account_id UUID PRIMARY KEY
    REFERENCES public.accounts(id) ON DELETE RESTRICT,
  encrypted_totp_secret TEXT NOT NULL
    CHECK (length(encrypted_totp_secret) BETWEEN 48 AND 512),
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending','active')),
  enrollment_expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  last_accepted_totp_step BIGINT,
  failed_attempt_count INTEGER NOT NULL DEFAULT 0
    CHECK (failed_attempt_count BETWEEN 0 AND 10),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    (state = 'pending' AND confirmed_at IS NULL AND last_accepted_totp_step IS NULL)
    OR
    (state = 'active' AND confirmed_at IS NOT NULL AND last_accepted_totp_step IS NOT NULL)
  ),
  CHECK (last_accepted_totp_step IS NULL OR last_accepted_totp_step >= 0)
);

CREATE INDEX unibud_operator_mfa_pending_expiry_idx
  ON public.unibud_operator_mfa_credentials(enrollment_expires_at)
  WHERE state = 'pending';

CREATE INDEX unibud_operator_mfa_locked_idx
  ON public.unibud_operator_mfa_credentials(locked_until)
  WHERE locked_until IS NOT NULL;

CREATE TABLE public.unibud_operator_mfa_recovery_codes (
  account_id UUID NOT NULL
    REFERENCES public.unibud_operator_mfa_credentials(account_id) ON DELETE CASCADE,
  code_digest BYTEA NOT NULL CHECK (octet_length(code_digest) = 32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  redeemed_at TIMESTAMPTZ,
  PRIMARY KEY (account_id, code_digest)
);

CREATE INDEX unibud_operator_mfa_recovery_unused_idx
  ON public.unibud_operator_mfa_recovery_codes(account_id, created_at)
  WHERE redeemed_at IS NULL;

ALTER TABLE public.unibud_operator_mfa_credentials OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_mfa_recovery_codes OWNER TO unibud_ops_owner;

REVOKE ALL ON public.unibud_operator_mfa_credentials,
              public.unibud_operator_mfa_recovery_codes
  FROM PUBLIC, unibud_app, unibud_readonly, unibud_auth;

COMMENT ON TABLE public.unibud_operator_mfa_credentials IS
'Protected Operations MFA storage. No application-role table access; use reviewed account-bound procedures only. Pending/active rows do not by themselves prove a session has completed MFA.';
COMMENT ON COLUMN public.unibud_operator_mfa_credentials.encrypted_totp_secret IS
'Versioned AES-256-GCM envelope produced by the server-side MFA cryptography service; never plaintext.';
COMMENT ON COLUMN public.unibud_operator_mfa_credentials.last_accepted_totp_step IS
'Reserved for an atomic monotonic compare-and-set by the future MFA verification procedure; NULL until activation.';
COMMENT ON TABLE public.unibud_operator_mfa_recovery_codes IS
'Stores account-bound keyed recovery-code digests only. Plaintext recovery codes must never be persisted.';

COMMIT;
