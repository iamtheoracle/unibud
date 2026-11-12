-- Flow financial-domain foundation.
-- Flow remains the UNIBUD customer experience. MoneyLead remains the intended
-- authoritative banking ledger and settlement boundary. Flow journal rows are
-- immutable, balanced settlement mirrors only; they never establish spendable
-- balances or authorize a payment.
BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='unibud_flow_owner') THEN
    CREATE ROLE unibud_flow_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='unibud_flow_ingest') THEN
    CREATE ROLE unibud_flow_ingest NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$roles$;

CREATE TABLE public.flow_customer_accounts (
  flow_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  moneylead_customer_ref_ciphertext BYTEA NOT NULL,
  moneylead_customer_ref_digest BYTEA NOT NULL CHECK (octet_length(moneylead_customer_ref_digest)=32),
  moneylead_account_ref_ciphertext BYTEA NOT NULL,
  moneylead_account_ref_digest BYTEA NOT NULL CHECK (octet_length(moneylead_account_ref_digest)=32),
  status TEXT NOT NULL DEFAULT 'pending_link'
    CHECK (status IN ('pending_link','active','restricted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(account_id,flow_account_id),
  UNIQUE(moneylead_account_ref_digest)
);
CREATE INDEX flow_customer_accounts_owner_idx
  ON public.flow_customer_accounts(account_id,created_at DESC);

CREATE TABLE public.flow_payment_intents (
  payment_intent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_account_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  idempotency_key_digest BYTEA NOT NULL CHECK (octet_length(idempotency_key_digest)=32),
  recipient_ref_ciphertext BYTEA NOT NULL,
  recipient_ref_digest BYTEA NOT NULL CHECK (octet_length(recipient_ref_digest)=32),
  amount NUMERIC(20,4) NOT NULL CHECK (amount>0),
  currency CHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  fee_amount NUMERIC(20,4) NOT NULL DEFAULT 0 CHECK (fee_amount>=0),
  details_digest BYTEA NOT NULL CHECK (octet_length(details_digest)=32),
  purpose_code TEXT NOT NULL CHECK (purpose_code ~ '^[a-z][a-z0-9_]{1,47}$'),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN (
      'created','awaiting_authorization','authorized','submitted','accepted',
      'settled','failed','cancelled','reversed'
    )),
  external_instruction_ref_ciphertext BYTEA,
  external_instruction_ref_digest BYTEA
    CHECK (external_instruction_ref_digest IS NULL OR octet_length(external_instruction_ref_digest)=32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  authorized_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  FOREIGN KEY(account_id,flow_account_id)
    REFERENCES public.flow_customer_accounts(account_id,flow_account_id) ON DELETE RESTRICT,
  UNIQUE(flow_account_id,idempotency_key_digest),
  UNIQUE(account_id,payment_intent_id),
  CHECK ((status='authorized')=(authorized_at IS NOT NULL)
      OR status IN ('submitted','accepted','settled','failed','cancelled','reversed')),
  CHECK (external_instruction_ref_ciphertext IS NULL OR external_instruction_ref_digest IS NOT NULL),
  CHECK (external_instruction_ref_digest IS NULL OR external_instruction_ref_ciphertext IS NOT NULL)
);
CREATE INDEX flow_payment_intents_owner_idx
  ON public.flow_payment_intents(account_id,created_at DESC);
CREATE INDEX flow_payment_intents_lifecycle_idx
  ON public.flow_payment_intents(status,created_at)
  WHERE status IN ('created','awaiting_authorization','authorized','submitted','accepted');

CREATE TABLE public.flow_transaction_credentials (
  account_id UUID PRIMARY KEY REFERENCES public.accounts(id) ON DELETE RESTRICT,
  pin_hash_phc TEXT NOT NULL CHECK (
    length(pin_hash_phc) BETWEEN 20 AND 512 AND pin_hash_phc LIKE '$argon2id$%'
  ),
  failed_attempts SMALLINT NOT NULL DEFAULT 0 CHECK (failed_attempts BETWEEN 0 AND 20),
  locked_until TIMESTAMPTZ,
  recovery_token_digest BYTEA CHECK (
    recovery_token_digest IS NULL OR octet_length(recovery_token_digest)=32
  ),
  recovery_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK ((recovery_token_digest IS NULL)=(recovery_expires_at IS NULL))
);

CREATE TABLE public.flow_biometric_credentials (
  credential_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  credential_id BYTEA NOT NULL UNIQUE,
  public_key_cose BYTEA NOT NULL,
  signature_counter BIGINT NOT NULL DEFAULT 0 CHECK (signature_counter>=0),
  transports TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  CHECK (array_position(transports,NULL) IS NULL),
  CHECK ((status='revoked')=(revoked_at IS NOT NULL))
);
CREATE INDEX flow_biometric_credentials_account_idx
  ON public.flow_biometric_credentials(account_id,created_at DESC);

CREATE TABLE public.flow_authorization_challenges (
  authorization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  challenge_digest BYTEA NOT NULL UNIQUE CHECK (octet_length(challenge_digest)=32),
  details_digest BYTEA NOT NULL CHECK (octet_length(details_digest)=32),
  auth_method TEXT NOT NULL CHECK (auth_method IN ('transaction_pin','webauthn')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY(account_id,payment_intent_id)
    REFERENCES public.flow_payment_intents(account_id,payment_intent_id) ON DELETE RESTRICT,
  CHECK (expires_at>created_at),
  CHECK (NOT (consumed_at IS NOT NULL AND failed_at IS NOT NULL))
);
CREATE INDEX flow_authorization_challenges_intent_idx
  ON public.flow_authorization_challenges(account_id,payment_intent_id,created_at DESC);
CREATE UNIQUE INDEX flow_authorization_one_unconsumed_challenge_idx
  ON public.flow_authorization_challenges(payment_intent_id)
  WHERE consumed_at IS NULL AND failed_at IS NULL;

CREATE TABLE public.flow_transaction_rate_limits (
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN (
    'pin_verify','pin_enroll','pin_recovery','webauthn_verify','authorization_create'
  )),
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count>=0),
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(account_id,action)
);

-- This is a MoneyLead settlement mirror/subledger, not a customer balance ledger.
-- Rows can be ingested only by a separately provisioned integration principal.
CREATE TABLE public.flow_journal_entries (
  journal_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  flow_account_id UUID NOT NULL,
  payment_intent_id UUID,
  source_system TEXT NOT NULL CHECK (source_system='moneylead'),
  source_event_ref_digest BYTEA NOT NULL CHECK (octet_length(source_event_ref_digest)=32),
  currency CHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  entry_kind TEXT NOT NULL CHECK (entry_kind IN ('settlement','fee','reversal','adjustment')),
  effective_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY(account_id,flow_account_id)
    REFERENCES public.flow_customer_accounts(account_id,flow_account_id) ON DELETE RESTRICT,
  FOREIGN KEY(account_id,payment_intent_id)
    REFERENCES public.flow_payment_intents(account_id,payment_intent_id) ON DELETE RESTRICT,
  UNIQUE(source_system,source_event_ref_digest),
  UNIQUE(journal_entry_id,currency)
);
CREATE INDEX flow_journal_entries_owner_idx
  ON public.flow_journal_entries(account_id,effective_at DESC);

CREATE TABLE public.flow_journal_postings (
  posting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL,
  currency CHAR(3) NOT NULL,
  account_code TEXT NOT NULL CHECK (account_code ~ '^[A-Z][A-Z0-9_]{1,63}$'),
  side TEXT NOT NULL CHECK (side IN ('debit','credit')),
  amount NUMERIC(20,4) NOT NULL CHECK (amount>0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY(journal_entry_id,currency)
    REFERENCES public.flow_journal_entries(journal_entry_id,currency) ON DELETE RESTRICT
);
CREATE INDEX flow_journal_postings_entry_idx
  ON public.flow_journal_postings(journal_entry_id,side);

CREATE FUNCTION public.flow_assert_journal_entry_balanced()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE
  v_entry UUID;
  v_count INTEGER;
  v_debits NUMERIC(24,4);
  v_credits NUMERIC(24,4);
BEGIN
  v_entry:=NEW.journal_entry_id;
  SELECT count(*),
         COALESCE(sum(amount) FILTER(WHERE side='debit'),0),
         COALESCE(sum(amount) FILTER(WHERE side='credit'),0)
    INTO v_count,v_debits,v_credits
    FROM public.flow_journal_postings
   WHERE journal_entry_id=v_entry;
  IF v_count<2 OR v_debits<>v_credits OR v_debits<=0 THEN
    RAISE EXCEPTION 'Flow settlement mirror journal entry % is not balanced',v_entry
      USING ERRCODE='23514';
  END IF;
  RETURN NULL;
END
$function$;
ALTER FUNCTION public.flow_assert_journal_entry_balanced() OWNER TO unibud_flow_owner;
CREATE CONSTRAINT TRIGGER flow_journal_entry_balance_check
  AFTER INSERT ON public.flow_journal_postings
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.flow_assert_journal_entry_balanced();

CREATE FUNCTION public.flow_reject_financial_record_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path=pg_catalog
AS $function$
BEGIN
  RAISE EXCEPTION 'Flow financial records are append-only; use a compensating record'
    USING ERRCODE='55000';
END
$function$;
ALTER FUNCTION public.flow_reject_financial_record_mutation() OWNER TO unibud_flow_owner;
CREATE TRIGGER flow_journal_entries_immutable
  BEFORE UPDATE OR DELETE ON public.flow_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.flow_reject_financial_record_mutation();
CREATE TRIGGER flow_journal_postings_immutable
  BEFORE UPDATE OR DELETE ON public.flow_journal_postings
  FOR EACH ROW EXECUTE FUNCTION public.flow_reject_financial_record_mutation();

CREATE FUNCTION public.flow_payment_intent_payload_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path=pg_catalog
AS $function$
BEGIN
  IF ROW(NEW.flow_account_id,NEW.account_id,NEW.idempotency_key_digest,
         NEW.recipient_ref_ciphertext,NEW.recipient_ref_digest,NEW.amount,NEW.currency,
         NEW.fee_amount,NEW.details_digest,NEW.purpose_code)
     IS DISTINCT FROM
     ROW(OLD.flow_account_id,OLD.account_id,OLD.idempotency_key_digest,
         OLD.recipient_ref_ciphertext,OLD.recipient_ref_digest,OLD.amount,OLD.currency,
         OLD.fee_amount,OLD.details_digest,OLD.purpose_code) THEN
    RAISE EXCEPTION 'A payment intent payload is immutable after creation'
      USING ERRCODE='55000';
  END IF;
  IF NOT (
    (OLD.status='created' AND NEW.status IN ('awaiting_authorization','cancelled','failed'))
    OR (OLD.status='awaiting_authorization' AND NEW.status IN ('authorized','cancelled','failed'))
    OR (OLD.status='authorized' AND NEW.status IN ('submitted','cancelled','failed'))
    OR (OLD.status='submitted' AND NEW.status IN ('accepted','settled','failed'))
    OR (OLD.status='accepted' AND NEW.status IN ('settled','failed'))
    OR (OLD.status='settled' AND NEW.status='reversed')
    OR OLD.status=NEW.status
  ) THEN
    RAISE EXCEPTION 'Invalid Flow payment intent lifecycle transition: % -> %',OLD.status,NEW.status
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END
$function$;
ALTER FUNCTION public.flow_payment_intent_payload_guard() OWNER TO unibud_flow_owner;
CREATE TRIGGER flow_payment_intent_payload_guard
  BEFORE UPDATE ON public.flow_payment_intents
  FOR EACH ROW EXECUTE FUNCTION public.flow_payment_intent_payload_guard();

-- Every Flow-owned table is isolated to the authenticated UNIBUD account.
DO $rls$
DECLARE v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'flow_customer_accounts','flow_payment_intents','flow_transaction_credentials',
    'flow_biometric_credentials','flow_authorization_challenges',
    'flow_transaction_rate_limits','flow_journal_entries','flow_journal_postings'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO unibud_flow_owner',v_table);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',v_table);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',v_table);
  END LOOP;
END
$rls$;

CREATE POLICY flow_customer_accounts_owner_scope ON public.flow_customer_accounts
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_payment_intents_owner_scope ON public.flow_payment_intents
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_transaction_credentials_owner_scope ON public.flow_transaction_credentials
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_biometric_credentials_owner_scope ON public.flow_biometric_credentials
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_authorization_challenges_owner_scope ON public.flow_authorization_challenges
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_transaction_rate_limits_owner_scope ON public.flow_transaction_rate_limits
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_journal_entries_owner_scope ON public.flow_journal_entries
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE POLICY flow_journal_postings_owner_check ON public.flow_journal_postings
  FOR SELECT TO unibud_flow_owner USING(true);
CREATE POLICY flow_journal_postings_owner_scope ON public.flow_journal_postings
  USING(EXISTS(
    SELECT 1 FROM public.flow_journal_entries e
     WHERE e.journal_entry_id=flow_journal_postings.journal_entry_id
       AND e.account_id=unibud_private.current_account_id()
  ))
  WITH CHECK(EXISTS(
    SELECT 1 FROM public.flow_journal_entries e
     WHERE e.journal_entry_id=flow_journal_postings.journal_entry_id
       AND e.account_id=unibud_private.current_account_id()
  ));

-- App access is intentionally read-only and column-limited. Writes must go
-- through future server-owned procedures that validate sessions and auth proofs.
REVOKE ALL ON public.flow_customer_accounts,public.flow_payment_intents,
  public.flow_transaction_credentials,public.flow_biometric_credentials,
  public.flow_authorization_challenges,public.flow_transaction_rate_limits,
  public.flow_journal_entries,public.flow_journal_postings
  FROM PUBLIC,unibud_app,unibud_readonly,unibud_migrator,unibud_flow_ingest;

GRANT SELECT(flow_account_id,account_id,status,created_at)
  ON public.flow_customer_accounts TO unibud_app;
GRANT SELECT(payment_intent_id,flow_account_id,account_id,amount,currency,fee_amount,
  purpose_code,status,created_at,authorized_at,submitted_at,settled_at,failed_at,cancelled_at,reversed_at)
  ON public.flow_payment_intents TO unibud_app;
GRANT SELECT(payment_intent_id,flow_account_id,account_id,amount,currency,fee_amount,
  purpose_code,status,created_at,authorized_at,submitted_at,settled_at,failed_at,cancelled_at,reversed_at)
  ON public.flow_payment_intents TO unibud_readonly;
GRANT SELECT ON public.flow_journal_entries,public.flow_journal_postings TO unibud_app,unibud_readonly;

-- Only the future MoneyLead settlement-ingestion principal may append mirrored
-- journal rows. It receives no UPDATE/DELETE rights and no credential access.
GRANT USAGE ON SCHEMA public TO unibud_flow_ingest;
GRANT SELECT,INSERT ON public.flow_journal_entries,public.flow_journal_postings TO unibud_flow_ingest;
GRANT SELECT ON public.flow_customer_accounts,public.flow_payment_intents TO unibud_flow_ingest;
CREATE POLICY flow_journal_entries_ingest ON public.flow_journal_entries
  FOR INSERT TO unibud_flow_ingest WITH CHECK(true);
CREATE POLICY flow_journal_postings_ingest ON public.flow_journal_postings
  FOR INSERT TO unibud_flow_ingest WITH CHECK(true);
CREATE POLICY flow_customer_accounts_ingest_read ON public.flow_customer_accounts
  FOR SELECT TO unibud_flow_ingest USING(true);
CREATE POLICY flow_payment_intents_ingest_read ON public.flow_payment_intents
  FOR SELECT TO unibud_flow_ingest USING(true);

REVOKE UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON
  public.flow_customer_accounts,public.flow_payment_intents,
  public.flow_transaction_credentials,public.flow_biometric_credentials,
  public.flow_authorization_challenges,public.flow_transaction_rate_limits,
  public.flow_journal_entries,public.flow_journal_postings
  FROM unibud_app,unibud_readonly,unibud_flow_ingest;

COMMENT ON TABLE public.flow_customer_accounts IS
  'Flow customer/account mapping. MoneyLead identifiers are encrypted and digest-indexed; no bank ledger is created here.';
COMMENT ON TABLE public.flow_payment_intents IS
  'Flow-originated payment instructions with immutable transaction payload and explicit lifecycle; not proof of processing or settlement.';
COMMENT ON TABLE public.flow_transaction_credentials IS
  'Argon2id PHC hash only; never store transaction PIN plaintext or reversible PIN material.';
COMMENT ON TABLE public.flow_biometric_credentials IS
  'WebAuthn credential public keys and counters only; biometric templates remain on the user device/platform.';
COMMENT ON TABLE public.flow_authorization_challenges IS
  'Single-use authorization challenge bound to an exact immutable payment intent digest and authenticated session.';
COMMENT ON TABLE public.flow_journal_entries IS
  'Immutable, balanced mirror of verified MoneyLead settlement events; not an authoritative balance ledger and never spendable balance source.';
COMMENT ON TABLE public.flow_journal_postings IS
  'Double-entry postings for MoneyLead settlement mirror events; each journal entry must balance per currency at transaction commit.';

COMMIT;
