-- Durable in-app security notifications derived transactionally from the
-- append-only Operations MFA audit stream. No external delivery is attempted.
BEGIN;

CREATE TABLE public.unibud_operator_mfa_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES public.unibud_operator_mfa_events(event_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'enrollment_confirmed','locked_out','recovery_code_redeemed',
    'recovery_codes_regenerated','security_reset_requested',
    'security_reset_approved','security_reset_rejected',
    'security_credential_disabled','security_reset_cancelled',
    'security_reset_expired'
  )),
  security_request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  read_at TIMESTAMPTZ,
  UNIQUE(account_id,event_id)
);
CREATE INDEX unibud_operator_mfa_notifications_inbox_idx
  ON public.unibud_operator_mfa_notifications(account_id,created_at DESC,notification_id DESC)
  WHERE read_at IS NULL;

ALTER TABLE public.unibud_operator_mfa_notifications OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_mfa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unibud_operator_mfa_notifications FORCE ROW LEVEL SECURITY;
CREATE POLICY unibud_operator_mfa_notifications_account_scope
  ON public.unibud_operator_mfa_notifications
  USING (account_id=unibud_private.current_account_id())
  WITH CHECK (account_id=unibud_private.current_account_id());
REVOKE ALL ON public.unibud_operator_mfa_notifications
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

CREATE FUNCTION unibud_private.enqueue_operations_mfa_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_recipients UUID[]:=ARRAY[]::UUID[];
  v_requester UUID;
  v_recipient UUID;
BEGIN
  CASE NEW.event_type
    WHEN 'enrollment_confirmed' THEN
      v_recipients:=ARRAY[NEW.actor_account_id];
    WHEN 'locked_out' THEN
      v_recipients:=ARRAY[NEW.actor_account_id];
    WHEN 'recovery_code_redeemed' THEN
      v_recipients:=ARRAY[NEW.actor_account_id];
    WHEN 'recovery_codes_regenerated' THEN
      v_recipients:=ARRAY[NEW.actor_account_id];
    WHEN 'security_reset_requested' THEN
      v_recipients:=ARRAY[NEW.actor_account_id,NEW.target_account_id];
    WHEN 'security_reset_approved' THEN
      v_recipients:=ARRAY[NEW.actor_account_id,NEW.target_account_id];
    WHEN 'security_reset_rejected' THEN
      v_recipients:=ARRAY[NEW.actor_account_id,NEW.target_account_id];
    WHEN 'security_credential_disabled' THEN
      v_recipients:=ARRAY[NEW.actor_account_id,NEW.target_account_id];
    WHEN 'security_reset_cancelled' THEN
      v_recipients:=ARRAY[NEW.actor_account_id,NEW.target_account_id];
    WHEN 'security_reset_expired' THEN
      SELECT r.requester_account_id INTO v_requester
      FROM public.unibud_operator_mfa_security_requests r
      WHERE r.request_id=NEW.security_request_id;
      v_recipients:=ARRAY[NEW.target_account_id,v_requester];
    ELSE
      RETURN NEW;
  END CASE;

  FOREACH v_recipient IN ARRAY v_recipients LOOP
    IF v_recipient IS NOT NULL THEN
      INSERT INTO public.unibud_operator_mfa_notifications(
        account_id,event_id,event_type,security_request_id
      ) VALUES(
        v_recipient,NEW.event_id,NEW.event_type,NEW.security_request_id
      )
      ON CONFLICT(account_id,event_id) DO NOTHING;
    END IF;
  END LOOP;
  RETURN NEW;
END
$function$;
ALTER FUNCTION unibud_private.enqueue_operations_mfa_notification() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.enqueue_operations_mfa_notification() FROM PUBLIC;
CREATE TRIGGER unibud_operator_mfa_notification_enqueue
AFTER INSERT ON public.unibud_operator_mfa_events
FOR EACH ROW EXECUTE FUNCTION unibud_private.enqueue_operations_mfa_notification();

CREATE FUNCTION public.unibud_operator_mfa_list_notifications(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  notification_id UUID,
  event_type TEXT,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  security_request_id UUID
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_account UUID;
BEGIN
  v_account:=unibud_private.current_account_id();
  IF v_account IS NULL OR unibud_private.current_session_id() IS NULL THEN
    RETURN;
  END IF;
  IF p_limit IS NULL OR p_limit<1 OR p_limit>50 THEN
    RAISE EXCEPTION 'Invalid notification page size' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT n.notification_id,n.event_type,n.created_at,n.read_at,n.security_request_id
    FROM public.unibud_operator_mfa_notifications n
    WHERE n.account_id=v_account
    ORDER BY n.created_at DESC,n.notification_id DESC
    LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_list_notifications(INTEGER) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_list_notifications(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_list_notifications(INTEGER) TO unibud_app;

CREATE FUNCTION public.unibud_operator_mfa_mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_account UUID; v_found BOOLEAN;
BEGIN
  v_account:=unibud_private.current_account_id();
  IF v_account IS NULL OR unibud_private.current_session_id() IS NULL
     OR p_notification_id IS NULL THEN
    RETURN FALSE;
  END IF;
  UPDATE public.unibud_operator_mfa_notifications
    SET read_at=COALESCE(read_at,clock_timestamp())
    WHERE notification_id=p_notification_id AND account_id=v_account;
  v_found:=FOUND;
  RETURN v_found;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_mark_notification_read(UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_mark_notification_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_mark_notification_read(UUID) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_notifications IS
'Account-scoped in-app notices generated in the same transaction as append-only Operations MFA audit events. This table is not an external email/SMS delivery receipt or outbox.';
COMMENT ON FUNCTION public.unibud_operator_mfa_list_notifications(INTEGER) IS
'Returns only the current verified account session notification inbox; account identity is derived from signed database session context.';
COMMENT ON FUNCTION public.unibud_operator_mfa_mark_notification_read(UUID) IS
'Marks only a notification owned by the current verified account as read; no caller-supplied account identifier is accepted.';

COMMIT;
