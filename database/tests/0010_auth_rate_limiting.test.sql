BEGIN;
SET LOCAL ROLE unibud_auth;
DO $$
DECLARE
 digest_value BYTEA:=decode(repeat('ab',32),'hex');
 first_ok BOOLEAN;
 second_ok BOOLEAN;
 third_ok BOOLEAN;
 reset_ok BOOLEAN;
BEGIN
 first_ok:=public.auth_consume_rate_limit(digest_value,2,60,now());
 second_ok:=public.auth_consume_rate_limit(digest_value,2,60,now()+interval '1 second');
 third_ok:=public.auth_consume_rate_limit(digest_value,2,60,now()+interval '2 seconds');
 reset_ok:=public.auth_consume_rate_limit(digest_value,2,60,now()+interval '61 seconds');
 IF NOT first_ok OR NOT second_ok OR third_ok OR NOT reset_ok THEN
  RAISE EXCEPTION 'Atomic rate-limit threshold or reset behavior failed';
 END IF;
END $$;
ROLLBACK;
