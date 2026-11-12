-- PostgreSQL privilege-boundary checks for versioned recovery digest redemption.
BEGIN;
DO $test$
DECLARE
  v_oid REGPROCEDURE;
  v_definition TEXT;
BEGIN
  v_oid := to_regprocedure(
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'
  );
  IF v_oid IS NULL THEN
    RAISE EXCEPTION 'Bounded recovery candidate function is missing';
  END IF;

  IF has_function_privilege(
    'unibud_app',
    'public.unibud_operator_mfa_redeem_recovery_code(text,bigint,bigint,uuid,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Application role can bypass candidate validation';
  END IF;
  IF NOT has_function_privilege(
    'unibud_app',
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Application role cannot execute bounded recovery candidate function';
  END IF;

  IF has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','SELECT')
     OR has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','INSERT')
     OR has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','UPDATE') THEN
    RAISE EXCEPTION 'Application role has direct recovery digest table access';
  END IF;

  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid=v_oid) THEN
    RAISE EXCEPTION 'Candidate wrapper is not SECURITY DEFINER';
  END IF;
  IF (SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid=v_oid) <> 'unibud_ops_owner' THEN
    RAISE EXCEPTION 'Candidate wrapper has the wrong owner';
  END IF;
  IF NOT (SELECT proconfig @> ARRAY['search_path=pg_catalog, public, unibud_private']
          FROM pg_proc WHERE oid=v_oid) THEN
    RAISE EXCEPTION 'Candidate wrapper does not pin search_path';
  END IF;

  v_definition := pg_get_functiondef(v_oid);
  IF position('cardinality(p_digests) > 3' in v_definition)=0
     OR position('FOREACH v_digest IN ARRAY p_digests' in v_definition)=0 THEN
    RAISE EXCEPTION 'Candidate wrapper is not bounded or does not process the digest candidates';
  END IF;
END
$test$;
ROLLBACK;
