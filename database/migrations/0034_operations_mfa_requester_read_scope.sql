-- Allow requesters to inspect only their own requests, while approvers retain
-- the bounded pending queue and detail access. This enables requester cancellation
-- without exposing other operators' requests.
BEGIN;

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_list_security_requests(
  p_request_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_before_created_at TIMESTAMPTZ DEFAULT NULL,
  p_before_request_id UUID DEFAULT NULL
)
RETURNS TABLE (
  request_id UUID,
  target_account_id UUID,
  requested_action TEXT,
  state TEXT,
  requester_account_id UUID,
  approver_account_id UUID,
  reason_code TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_can_approve BOOLEAN;
  v_can_request BOOLEAN;
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>100
     OR ((p_before_created_at IS NULL)<>(p_before_request_id IS NULL)) THEN
    RAISE EXCEPTION 'Invalid Operations MFA request query' USING ERRCODE='22023';
  END IF;
  v_actor:=unibud_private.current_account_id();
  IF v_actor IS NULL OR unibud_private.current_session_id() IS NULL THEN RETURN; END IF;
  v_can_approve:=public.unibud_operator_has_permission('operations.mfa.security.approve');
  v_can_request:=public.unibud_operator_has_permission('operations.mfa.security.request');
  IF NOT v_can_approve AND NOT v_can_request THEN RETURN; END IF;

  IF p_request_id IS NOT NULL THEN
    RETURN QUERY
      SELECT r.request_id,r.target_account_id,r.requested_action,r.state,
             r.requester_account_id,r.approver_account_id,r.reason_code,
             r.created_at,r.expires_at,r.decided_at,r.completed_at
      FROM public.unibud_operator_mfa_security_requests r
      WHERE r.request_id=p_request_id
        AND (v_can_approve OR r.requester_account_id=v_actor);
    RETURN;
  END IF;

  RETURN QUERY
    SELECT r.request_id,r.target_account_id,r.requested_action,r.state,
           r.requester_account_id,r.approver_account_id,r.reason_code,
           r.created_at,r.expires_at,r.decided_at,r.completed_at
    FROM public.unibud_operator_mfa_security_requests r
    WHERE r.state='pending'
      AND (v_can_approve OR r.requester_account_id=v_actor)
      AND (p_before_created_at IS NULL
        OR (r.created_at,r.request_id)<(p_before_created_at,p_before_request_id))
    ORDER BY r.created_at DESC,r.request_id DESC
    LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_list_security_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_list_security_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_list_security_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_mfa_list_security_requests(UUID,INTEGER,TIMESTAMPTZ,UUID) IS
'Returns bounded pending requests to current-MFA approvers and only the current requesters own pending requests to request-permission holders. Detail access is similarly restricted; persisted session IDs and credentials are never exposed.';

COMMIT;
