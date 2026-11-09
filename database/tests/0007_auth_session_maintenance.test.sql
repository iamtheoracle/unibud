BEGIN;
SET LOCAL ROLE unibud_auth;
DO $$
DECLARE
 a UUID := '10000000-0000-4000-8000-000000000001';
 b UUID := '10000000-0000-4000-8000-000000000002';
 s1 UUID := '40000000-0000-4000-8000-000000000011';
 s2 UUID := '40000000-0000-4000-8000-000000000012';
 touched BOOLEAN;
 revoked INTEGER;
BEGIN
 PERFORM public.auth_create_pending_account(
  a,'20000000-0000-4000-8000-000000000011','synthetic-subject-00000011','email',
  decode(repeat('33',48),'hex'),decode(repeat('44',32),'hex'),
  'scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
 );
 -- Test-only activation follows the same verified-identity procedure contract.
 INSERT INTO public.accounts(id,status) VALUES(b,'active');
 PERFORM public.auth_create_session(s1,a,decode(repeat('a1',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours');
 PERFORM public.auth_create_session(s2,b,decode(repeat('a2',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours');
 touched:=public.auth_touch_session(decode(repeat('a1',32),'hex'),now()+interval '1 minute',now()+interval '31 minutes');
 IF NOT touched THEN RAISE EXCEPTION 'Active session touch failed'; END IF;
 revoked:=public.auth_revoke_all_sessions(a,now()+interval '2 minutes','test_revoke_all');
 IF revoked<>1 THEN RAISE EXCEPTION 'Account-wide session revocation count incorrect'; END IF;
 IF (SELECT session_status FROM public.auth_lookup_session(decode(repeat('a1',32),'hex'))) <> 'revoked' THEN
  RAISE EXCEPTION 'Target account session was not revoked';
 END IF;
 IF (SELECT session_status FROM public.auth_lookup_session(decode(repeat('a2',32),'hex'))) <> 'active' THEN
  RAISE EXCEPTION 'Session revocation crossed account boundary';
 END IF;
END $$;
ROLLBACK;
