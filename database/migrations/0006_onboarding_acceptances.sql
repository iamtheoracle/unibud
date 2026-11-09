-- Persist versioned terms and privacy acceptance for onboarding.
BEGIN;
CREATE TABLE account_policy_acceptances (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('terms','privacy')),
  policy_version TEXT NOT NULL CHECK (length(policy_version) BETWEEN 1 AND 64),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id,policy_type,policy_version)
);
ALTER TABLE account_policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_policy_acceptances FORCE ROW LEVEL SECURITY;
CREATE POLICY account_policy_acceptances_account_isolation
  ON account_policy_acceptances
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
GRANT SELECT,INSERT ON account_policy_acceptances TO unibud_app;
REVOKE UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER
  ON account_policy_acceptances FROM unibud_app,unibud_readonly;
COMMENT ON TABLE account_policy_acceptances IS
  'Versioned, account-scoped terms and privacy acceptance evidence; immutable to app roles.';
COMMIT;
