-- Transactional, account-scoped in-app notifications for operator grant lifecycle events.
-- These notices are not external email/SMS delivery receipts or an outbox.
BEGIN;

CREATE TABLE public.unibud_operator_grant_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL REFERENCES public.unibud_operator_grant_requests(request_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'request_submitted','request_approved','request_rejected',
    'request_cancelled','request_expired'
  )),
  requested_action TEXT NOT NULL CHECK (requested_action IN ('grant','revoke')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  read_at TIMESTAMPTZ,
  UNIQUE(account_id,request_id,event_type)
);
CREATE INDEX unibud_operator_grant_notifications_inbox_idx
  ON public.unibud_operator_grant_notifications(account_id,created_at DESC,notification_id DESC);

ALTER TABLE public.unibud_operator_grant_notifications OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_grant_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unibud_operator_grant_notifications FORCE ROW LEVEL SECURITY;
CREATE POLICY unibud_operator_grant_notifications_account_scope
  ON public.unibud_operator_grant_notifications
  USING (account_id=unibud_private.current_account_id())
  WITH CHECK (account_id=unibud_private.current_account_id());
-- SECURITY DEFINER trigger/functions are owned by this restricted database role.
-- This permits system expiry maintenance to enqueue notices without a user session;
-- public read/mark functions still enforce the verified account identifier explicitly.
CREATE POLICY unibud_operator_grant_notifications_owner
  ON public.unibud_operator_grant_notifications
  TO unibud_ops_owner
  USING (true)
  WITH CHECK (true);
REVOKE ALL ON public.unibud_operator_grant_notifications
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

CREATE FUNCTION unibud_private.enqueue_operations_grant_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_event TEXT;
  v_recipient UUID;
  v_recipients UUID[];
BEGIN
  IF TG_OP='INSERT' THEN
    v_event:='request_submitted';
  ELSIF OLD.state IS DISTINCT FROM NEW.state THEN
    v_event:=CASE NEW.state
      WHEN 'approved' THEN 'request_approved'
      WHEN 'rejected' THEN 'request_rejected'
      WHEN 'cancelled' THEN 'request_cancelled'
      WHEN 'expired' THEN 'request_expired'
      ELSE NULL
    END;
  ELSE
    RETURN NEW;
  END IF;

  IF v_event IS NULL THEN RETURN NEW; END IF;
  v_recipients:=ARRAY[NEW.requester_account_id,NEW.target_account_id,NEW.approver_account_id];
  FOREACH v_recipient IN ARRAY v_recipients LOOP
    IF v_recipient IS NOT NULL THEN
      INSERT INTO public.unibud_operator_grant_notifications(
        account_id,request_id,event_type,requested_action
      ) VALUES(v_recipient,NEW.request_id,v_event,NEW.requested_action)
      ON CONFLICT(account_id,request_id,event_type) DO NOTHING;
    END IF;
  END LOOP;
  RETURN NEW;
END
$function$;
ALTER FUNCTION unibud_private.enqueue_operations_grant_notification() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.enqueue_operations_grant_notification() FROM PUBLIC;
CREATE TRIGGER unibud_operator_grant_notification_enqueue
AFTER INSERT OR UPDATE OF state ON public.unibud_operator_grant_requests
FOR EACH ROW EXECUTE FUNCTION unibud_private.enqueue_operations_grant_notification();

CREATE FUNCTION public.unibud_operator_list_grant_notifications(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  notification_id UUID,
  request_id UUID,
  event_type TEXT,
  requested_action TEXT,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_account UUID;
BEGIN
  v_account:=unibud_private.current_account_id();
  IF v_account IS NULL OR unibud_private.current_session_id() IS NULL
     OR p_limit IS NULL OR p_limit<1 OR p_limit>50
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('notification_read') THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT n.notification_id,n.request_id,n.event_type,n.requested_action,n.created_at,n.read_at
    FROM public.unibud_operator_grant_notifications n
    WHERE n.account_id=v_account
    ORDER BY n.created_at DESC,n.notification_id DESC
    LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_list_grant_notifications(INTEGER) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_list_grant_notifications(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_list_grant_notifications(INTEGER) TO unibud_app;

CREATE FUNCTION public.unibud_operator_mark_grant_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_account UUID;
BEGIN
  v_account:=unibud_private.current_account_id();
  IF v_account IS NULL OR unibud_private.current_session_id() IS NULL
     OR p_notification_id IS NULL
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('notification_read') THEN
    RETURN FALSE;
  END IF;
  UPDATE public.unibud_operator_grant_notifications
    SET read_at=COALESCE(read_at,clock_timestamp())
    WHERE notification_id=p_notification_id AND account_id=v_account;
  RETURN FOUND;
END
$function$;
ALTER FUNCTION public.unibud_operator_mark_grant_notification_read(UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mark_grant_notification_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mark_grant_notification_read(UUID) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_grant_notifications IS
'Account-scoped in-app notices generated in the same transaction as grant request lifecycle changes. Does not represent external email/SMS delivery.';
COMMENT ON FUNCTION public.unibud_operator_list_grant_notifications(INTEGER) IS
'Lists only grant lifecycle notices belonging to the account in the current verified signed session. Notification reads do not require MFA step-up so security notices remain visible.';
COMMENT ON FUNCTION public.unibud_operator_mark_grant_notification_read(UUID) IS
'Marks only a grant notification owned by the current verified account as read; caller cannot supply an account identifier.';

COMMIT;
