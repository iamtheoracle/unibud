BEGIN;
SET LOCAL ROLE unibud_auth;
DO $$
DECLARE
 digest_value BYTEA:=decode(repeat('ab',32),'hex');
 first_ok BOOLEAN;
 second_ok BOOLEAN;
 third_ok BOOLEAN;
 reset_ok BOOLEAN;
 other_action_ok BOOLEAN;
BEGIN
 first_ok:=public.auth_consume_rate_limit('login',digest_value,now(),60,2,1800);
 second_ok:=public.auth_consume_rate_limit('login',digest_value,now()+interval '1 second',60,2,1800);
 third_ok:=public.auth_consume_rate_limit('login',digest_value,now()+interval '2 seconds',60,2,1800);
 reset_ok:=public.auth_consume_rate_limit('login',digest_value,now()+interval '61 seconds',60,2,1800);
 other_action_ok:=public.auth_consume_rate_limit('recovery',digest_value,now(),60,2,1800);
 IF NOT first_ok OR NOT second_ok OR third_ok OR NOT reset_ok OR NOT other_action_ok THEN
  RAISE EXCEPTION 'Atomic rate-limit threshold, action separation or reset behavior failed';
 END IF;
END $$;
ROLLBACK;
