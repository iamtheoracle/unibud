-- Disposable PostgreSQL migration smoke tests; synthetic fixtures only.
BEGIN;
DO $$
DECLARE
  a UUID := '10000000-0000-4000-8000-000000000001';
  b UUID := '10000000-0000-4000-8000-000000000002';
  p UUID := '20000000-0000-4000-8000-000000000001';
  audit_id UUID := '60000000-0000-4000-8000-000000000001';
  rejected BOOLEAN := false;
BEGIN
  INSERT INTO accounts (id,status) VALUES (a,'active'),(b,'active');
  INSERT INTO profiles (id,owner_account_id,kind,handle,handle_normalized,display_name)
    VALUES (p,a,'personal','synthetic-a','synthetic-a','Synthetic A');
  INSERT INTO profile_memberships (id,profile_id,account_id,owner_account_id,relationship,role,status,can_switch_to_profile)
    VALUES ('30000000-0000-4000-8000-000000000001',p,a,a,'owner','owner','active',true);
  INSERT INTO account_sessions (id,account_id,credential_digest,issued_at,idle_expires_at,absolute_expires_at)
    VALUES ('40000000-0000-4000-8000-000000000001',a,decode(repeat('ab',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours');
  INSERT INTO resource_grants (id,subject_account_id,application_id,resource_type,resource_id,role,actions,issuer_account_id)
    VALUES ('50000000-0000-4000-8000-000000000001',a,'unibud','profile',p,'owner',ARRAY['read','update'],a);
  INSERT INTO security_audit_events (id,actor_account_id,application_id,action,outcome)
    VALUES (audit_id,a,'unibud','migration_smoke_test','success');

  BEGIN
    INSERT INTO profile_memberships (id,profile_id,account_id,owner_account_id,relationship,role,status,can_switch_to_profile)
      VALUES ('30000000-0000-4000-8000-000000000002',p,b,a,'delegated','admin','active',true);
  EXCEPTION WHEN check_violation OR foreign_key_violation THEN rejected := true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Invalid delegated membership was accepted'; END IF;

  rejected := false;
  BEGIN
    INSERT INTO resource_grants (id,subject_account_id,application_id,resource_type,resource_id,role,actions,issuer_account_id)
      VALUES ('50000000-0000-4000-8000-000000000002',a,'unibud','profile',p,'owner',ARRAY['read','impersonate'],a);
  EXCEPTION WHEN check_violation THEN rejected := true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Unknown resource-grant action was accepted'; END IF;

  rejected := false;
  BEGIN
    UPDATE security_audit_events SET action='tampered' WHERE id=audit_id;
  EXCEPTION WHEN raise_exception THEN rejected := true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Audit event mutation was accepted'; END IF;
  RAISE NOTICE 'Identity migration smoke tests passed';
END;
$$;
ROLLBACK;
