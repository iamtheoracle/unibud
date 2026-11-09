BEGIN;
SET LOCAL ROLE unibud_auth;
DO $$
DECLARE
 a UUID := '10000000-0000-4000-8000-000000000001';
 b UUID := '10000000-0000-4000-8000-000000000002';
 ia UUID := '20000000-0000-4000-8000-000000000011';
 ib UUID := '20000000-0000-4000-8000-000000000012';
 ca UUID := '30000000-0000-4000-8000-000000000011';
 cb UUID := '30000000-0000-4000-8000-000000000012';
 s1 UUID := '40000000-0000-4000-8000-000000000011';
 s2 UUID := '40000000-0000-4000-8000-000000000012';
 hash_value TEXT := 'scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
 key_value BYTEA := decode(repeat('77',32),'hex');
 now_value TIMESTAMPTZ := clock_timestamp();
 code_a BYTEA;
 code_b BYTEA;
 touched BOOLEAN;
 revoked INTEGER;
 owner_row RECORD;
BEGIN
 PERFORM public.auth_create_pending_account(a,ia,'synthetic-subject-00000011','email',
  decode(repeat('33',48),'hex'),decode(repeat('44',32),'hex'),hash_value);
 PERFORM public.auth_create_pending_account(b,ib,'synthetic-subject-00000012','email',
  decode(repeat('34',48),'hex'),decode(repeat('45',32),'hex'),hash_value);
 code_a:=public.hmac(convert_to('challenge: '||ca::text||':email_verification:123456','UTF8'),key_value,'sha256');
 code_b:=public.hmac(convert_to('challenge: '||cb::text||':email_verification:123456','UTF8'),key_value,'sha256');
 PERFORM public.auth_create_verification_challenge(ca,a,ia,'email','email_verification',
  decode(repeat('55',32),'hex'),code_a,now_value,now_value+interval '5 minutes',5);
 PERFORM public.auth_create_verification_challenge(cb,b,ib,'email','email_verification',
  decode(repeat('56',32),'hex'),code_b,now_value,now_value+interval '5 minutes',5);
 IF public.auth_verify_challenge(ca,code_a,now_value+interval '1 second')<>'verified'
 OR public.auth_verify_challenge(cb,code_b,now_value+interval '1 second')<>'verified' THEN
  RAISE EXCEPTION 'Synthetic accounts failed verification';
 END IF;
 SELECT * INTO owner_row FROM public.auth_lookup_challenge_account(ca);
 IF owner_row.account_id<>a OR owner_row.identity_id<>ia OR owner_row.purpose<>'email_verification' THEN
  RAISE EXCEPTION 'Challenge owner lookup returned wrong identity';
 END IF;
 PERFORM public.auth_create_session(s1,a,decode(repeat('a1',32),'hex'),now_value,
  now_value+interval '30 minutes',now_value+interval '12 hours');
 PERFORM public.auth_create_session(s2,b,decode(repeat('a2',32),'hex'),now_value,
  now_value+interval '30 minutes',now_value+interval '12 hours');
 touched:=public.auth_touch_session(decode(repeat('a1',32),'hex'),now_value+interval '1 minute',now_value+interval '31 minutes');
 IF NOT touched THEN RAISE EXCEPTION 'Active session touch failed'; END IF;
 revoked:=public.auth_revoke_all_sessions(a,now_value+interval '2 minutes','test_revoke_all');
 IF revoked<>1 THEN RAISE EXCEPTION 'Account-wide session revocation count incorrect'; END IF;
 IF (SELECT session_status FROM public.auth_lookup_session(decode(repeat('a1',32),'hex'))) <> 'revoked' THEN
  RAISE EXCEPTION 'Target account session was not revoked';
 END IF;
 IF (SELECT session_status FROM public.auth_lookup_session(decode(repeat('a2',32),'hex'))) <> 'active' THEN
  RAISE EXCEPTION 'Session revocation crossed account boundary';
 END IF;
END $$;
ROLLBACK;
