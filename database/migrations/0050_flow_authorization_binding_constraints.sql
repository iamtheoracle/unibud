-- Tighten Flow authorization challenge references to the exact intent digest
-- and the exact account-owned persisted session.
BEGIN;

ALTER TABLE public.account_sessions
  ADD CONSTRAINT account_sessions_id_account_id_flow_uq UNIQUE(id,account_id);

ALTER TABLE public.flow_payment_intents
  ADD CONSTRAINT flow_payment_intents_intent_digest_uq
  UNIQUE(payment_intent_id,details_digest);

ALTER TABLE public.flow_authorization_challenges
  ADD CONSTRAINT flow_authorization_challenges_session_owner_fkey
  FOREIGN KEY(session_id,account_id)
  REFERENCES public.account_sessions(id,account_id) ON DELETE RESTRICT;

ALTER TABLE public.flow_authorization_challenges
  ADD CONSTRAINT flow_authorization_challenges_intent_digest_fkey
  FOREIGN KEY(payment_intent_id,details_digest)
  REFERENCES public.flow_payment_intents(payment_intent_id,details_digest) ON DELETE RESTRICT;

CREATE UNIQUE INDEX flow_payment_intents_external_instruction_ref_digest_uq
  ON public.flow_payment_intents(external_instruction_ref_digest)
  WHERE external_instruction_ref_digest IS NOT NULL;

COMMENT ON CONSTRAINT flow_authorization_challenges_session_owner_fkey
  ON public.flow_authorization_challenges IS
'An authorization challenge can only reference a persisted session owned by the same UNIBUD account as the payment intent.';
COMMENT ON CONSTRAINT flow_authorization_challenges_intent_digest_fkey
  ON public.flow_authorization_challenges IS
'An authorization challenge must bind to the exact immutable transaction details digest stored on its payment intent.';

COMMIT;
