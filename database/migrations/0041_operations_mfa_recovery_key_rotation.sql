-- Backwards-compatible recovery HMAC rotation without invalidating issued codes.
-- The database still stores only 32-byte keyed digests; the server supplies at most
-- one legacy and two versioned candidates. The original single-digest primitive
-- remains owner-only and is wrapped by this bounded candidate procedure.
BEGIN;

CREATE FUNCTION public.unibud_operator_mfa_redeem_recovery_code_candidates(
  p_digests TEXT[],
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_digest TEXT;
BEGIN
  IF p_digests IS NULL OR cardinality(p_digests) < 1
     OR cardinality(p_digests) > 3
     OR EXISTS (
       SELECT 1 FROM unnest(p_digests) AS d(value)
       WHERE value IS NULL OR value !~ '^[0-9a-f]{64}$'
     )
     OR (SELECT count(DISTINCT value) FROM unnest(p_digests) AS d(value))
        <> cardinality(p_digests) THEN
    RETURN FALSE;
  END IF;

  FOREACH v_digest IN ARRAY p_digests LOOP
    IF public.unibud_operator_mfa_redeem_recovery_code(
      v_digest,p_issued_at,p_expires_at,p_nonce,p_signature
    ) THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_redeem_recovery_code_candidates(TEXT[],BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code_candidates(TEXT[],BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code_candidates(TEXT[],BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

-- Prevent bypassing the bounded candidate validation through the legacy entry point.
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code(TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC, unibud_app;

COMMENT ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code_candidates(TEXT[],BIGINT,BIGINT,UUID,TEXT) IS
'Validates at most three account-bound recovery digest candidates (legacy plus two keyring versions), then delegates to the original atomic one-time redemption procedure. Only the wrapper is executable by the application role.';

COMMIT;
