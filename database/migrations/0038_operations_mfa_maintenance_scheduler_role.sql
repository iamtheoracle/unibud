-- Give a separately provisioned trusted scheduler a narrow execution path
-- to the existing bounded maintenance procedure. This does not create a login,
-- store credentials, or configure recurring execution.
BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='unibud_ops_scheduler'
  ) THEN
    CREATE ROLE unibud_ops_scheduler
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
      NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$roles$;

ALTER ROLE unibud_ops_scheduler
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS;

GRANT USAGE ON SCHEMA unibud_private TO unibud_ops_scheduler;
REVOKE ALL ON FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER)
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator,
       unibud_ops_scheduler;
GRANT EXECUTE ON FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER)
  TO unibud_ops_scheduler;

COMMENT ON ROLE unibud_ops_scheduler IS
'NOLOGIN least-privilege execution role for the bounded Operations MFA maintenance procedure only. A trusted scheduler login must be provisioned separately by an authorised DBA and granted membership with INHERIT FALSE, SET TRUE. This role has no direct table privileges and does not schedule work.';

COMMIT;
