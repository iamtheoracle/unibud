-- Cross-account RLS tests. Synthetic data and disposable PostgreSQL only.
BEGIN;

INSERT INTO accounts (id,status) VALUES
 ('10000000-0000-4000-8000-000000000001','active'),
 ('10000000-0000-4000-8000-000000000002','active');
INSERT INTO profiles (id,owner_account_id,kind,handle,handle_normalized,display_name) VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','personal','isolation-a','isolation-a','Isolation A'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','personal','isolation-b','isolation-b','Isolation B');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-test-key',decode(repeat('5a',32),'hex'));
-- Rotation permits exactly two active keys during the overlap window.
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('second-active-key',decode(repeat('6b',32),'hex'));
DO $key_invariant$
BEGIN
  BEGIN
    INSERT INTO unibud_private.context_signing_keys(key_id,secret)
    VALUES ('third-active-key',decode(repeat('7c',32),'hex'));
    RAISE EXCEPTION 'A third active context key was accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END;
$key_invariant$;

-- Sign account A context using the CI-only synthetic key before assuming app role.
WITH context AS (
  SELECT
    '10000000-0000-4000-8000-000000000001'::TEXT AS account_id,
    floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::TEXT AS nonce
)
SELECT
  set_config('unibud.account_id', account_id, true),
  set_config('unibud.context_expiry', expiry, true),
  set_config('unibud.context_nonce', nonce, true),
  set_config(
    'unibud.context_signature',
    encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
      decode(repeat('5a',32),'hex'),'sha256'),'hex'),
    true
  )
FROM context;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE visible_accounts INTEGER;
DECLARE visible_profiles INTEGER;
BEGIN
  SELECT count(*) INTO visible_accounts FROM accounts;
  SELECT count(*) INTO visible_profiles FROM profiles;
  IF visible_accounts <> 1 OR visible_profiles <> 1 THEN
    RAISE EXCEPTION 'Account A should see exactly its own account and profile; saw %, %',
      visible_accounts, visible_profiles;
  END IF;

  -- The app role can set arbitrary GUCs, but cannot forge a matching signature.
  PERFORM set_config('unibud.account_id',
    '10000000-0000-4000-8000-000000000002', true);
  IF unibud_private.current_account_id() IS NOT NULL THEN
    RAISE EXCEPTION 'Forged account context was accepted';
  END IF;
  SELECT count(*) INTO visible_accounts FROM accounts;
  IF visible_accounts <> 0 THEN
    RAISE EXCEPTION 'Forged account context exposed rows';
  END IF;

  -- A modified signature must deny all account-scoped reads.
  PERFORM set_config('unibud.account_id', '10000000-0000-4000-8000-000000000001', true);
  PERFORM set_config('unibud.context_signature', repeat('0', 64), true);
  IF unibud_private.current_account_id() IS NOT NULL OR (SELECT count(*) FROM accounts) <> 0 THEN
    RAISE EXCEPTION 'Tampered signature exposed account rows';
  END IF;

  -- Missing signature must also deny all account-scoped reads.
  PERFORM set_config('unibud.context_signature', '', true);
  IF (SELECT count(*) FROM profiles) <> 0 THEN
    RAISE EXCEPTION 'Unsigned context exposed profile rows';
  END IF;
END;
$test$;
RESET ROLE;

-- The runtime role cannot read the private key material.
SET LOCAL ROLE unibud_app;
DO $private$
BEGIN
  BEGIN
    PERFORM 1 FROM unibud_private.context_signing_keys;
    RAISE EXCEPTION 'Runtime role unexpectedly read signing keys';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$private$;
RESET ROLE;

ROLLBACK;
