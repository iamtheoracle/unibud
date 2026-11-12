BEGIN;
SELECT plan(8);

SELECT has_function(
  'public','unibud_operator_mfa_redeem_recovery_code_candidates',
  ARRAY['text[]','bigint','bigint','uuid','text'],
  'bounded recovery candidate procedure exists'
);
SELECT ok(
  NOT has_function_privilege(
    'unibud_app',
    'public.unibud_operator_mfa_redeem_recovery_code(text,bigint,bigint,uuid,text)',
    'EXECUTE'
  ),
  'application role cannot bypass candidate validation'
);
SELECT ok(
  has_function_privilege(
    'unibud_app',
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)',
    'EXECUTE'
  ),
  'application role can call only bounded candidate wrapper'
);
SELECT ok(
  has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','SELECT') = false
  AND has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','INSERT') = false
  AND has_table_privilege('unibud_app','public.unibud_operator_mfa_recovery_codes','UPDATE') = false,
  'application role retains no direct recovery digest table access'
);
SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid =
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'::regprocedure),
  'candidate wrapper is SECURITY DEFINER'
);
SELECT ok(
  (SELECT pg_get_userbyid(proowner)='unibud_ops_owner' FROM pg_proc WHERE oid =
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'::regprocedure),
  'candidate wrapper is owned by Operations owner'
);
SELECT ok(
  (SELECT proconfig @> ARRAY['search_path=pg_catalog, public, unibud_private']
   FROM pg_proc WHERE oid =
    'public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'::regprocedure),
  'candidate wrapper pins search_path'
);
SELECT ok(
  (SELECT pg_get_functiondef('public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'::regprocedure)
    LIKE '%cardinality(p_digests) > 3%'
   AND pg_get_functiondef('public.unibud_operator_mfa_redeem_recovery_code_candidates(text[],bigint,bigint,uuid,text)'::regprocedure)
    LIKE '%FOREACH v_digest IN ARRAY p_digests%'),
  'candidate count is bounded and processed through the atomic legacy primitive'
);

SELECT * FROM finish();
ROLLBACK;
