from __future__ import annotations

import base64
import hashlib
import os
import secrets
import time
import uuid
from datetime import UTC, datetime, timedelta

import psycopg
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def register_application(
    *,
    scopes: list[str] | None = None,
    credential_scopes: list[str] | None = None,
    quota: int = 60,
    environment: str = "development",
) -> tuple[uuid.UUID, uuid.UUID, Ed25519PrivateKey]:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    app_id = uuid.uuid4()
    credential_id = uuid.uuid4()
    slug = "test-app-" + uuid.uuid4().hex[:12]
    granted_scopes = scopes or ["identity.read"]
    key_scopes = credential_scopes or granted_scopes

    with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
        connection.execute(
            """
            INSERT INTO oracle_arc.application_clients(
                app_id,slug,display_name,environment,scopes,requests_per_minute
            ) VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (app_id, slug, "Oracle Arc Identity Test", environment, granted_scopes, quota),
        )
        connection.execute(
            """
            INSERT INTO oracle_arc.application_credentials(
                credential_id,app_id,public_key,scopes
            ) VALUES (%s,%s,%s,%s)
            """,
            (credential_id, app_id, public_key, key_scopes),
        )
    return app_id, credential_id, private_key


def signed_headers(
    credential_id: uuid.UUID,
    private_key: Ed25519PrivateKey,
    *,
    timestamp: int | None = None,
    nonce: str | None = None,
    path: str = "/v1/apps/me",
) -> dict[str, str]:
    timestamp_text = str(timestamp if timestamp is not None else int(time.time()))
    nonce_text = nonce or secrets.token_urlsafe(24)
    canonical = "\n".join(
        (
            "v1",
            "GET",
            path,
            timestamp_text,
            nonce_text,
            hashlib.sha256(b"").hexdigest(),
        )
    ).encode("utf-8")
    signature = base64.urlsafe_b64encode(private_key.sign(canonical)).rstrip(b"=").decode()
    return {
        "X-Oracle-Arc-Key-Id": str(credential_id),
        "X-Oracle-Arc-Timestamp": timestamp_text,
        "X-Oracle-Arc-Nonce": nonce_text,
        "X-Oracle-Arc-Signature": signature,
    }


def test_signed_request_returns_only_the_calling_application_identity() -> None:
    _, credential_id, private_key = register_application()
    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["slug"].startswith("test-app-")
    assert payload["display_name"] == "Oracle Arc Identity Test"
    assert payload["environment"] == "development"
    assert payload["scopes"] == ["identity.read"]
    assert payload["requests_per_minute"] == 60
    assert "app_id" not in payload
    assert "credential_id" not in payload
    assert "public_key" not in response.text


def test_credential_scopes_cannot_expand_application_grants() -> None:
    _, credential_id, private_key = register_application(
        scopes=["identity.read", "identity.admin"],
        credential_scopes=["identity.read"],
    )

    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )

    assert response.status_code == 200
    assert response.json()["scopes"] == ["identity.read"]


def test_invalid_ed25519_signature_is_rejected() -> None:
    _, credential_id, private_key = register_application()
    headers = signed_headers(credential_id, private_key)
    headers["X-Oracle-Arc-Signature"] = base64.urlsafe_b64encode(
        secrets.token_bytes(64)
    ).rstrip(b"=").decode()

    response = client.get("/v1/apps/me", headers=headers)
    assert response.status_code == 401


def test_signed_request_nonce_cannot_be_replayed() -> None:
    _, credential_id, private_key = register_application()
    headers = signed_headers(credential_id, private_key)

    first = client.get("/v1/apps/me", headers=headers)
    replay = client.get("/v1/apps/me", headers=headers)

    assert first.status_code == 200
    assert replay.status_code == 401
    assert replay.json()["detail"] == "Request replay rejected."


def test_expired_signed_request_is_rejected_before_database_access() -> None:
    _, credential_id, private_key = register_application()
    headers = signed_headers(
        credential_id,
        private_key,
        timestamp=int(time.time()) - 120,
    )

    response = client.get("/v1/apps/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Signed request has expired."


def test_revoked_application_credential_is_rejected() -> None:
    _, credential_id, private_key = register_application()
    with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
        connection.execute(
            """
            UPDATE oracle_arc.application_credentials
            SET status='revoked',revoked_at=clock_timestamp()
            WHERE credential_id=%s
            """,
            (credential_id,),
        )

    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )
    assert response.status_code == 401


def test_application_credential_cannot_cross_environment(monkeypatch) -> None:
    _, credential_id, private_key = register_application(environment="development")
    monkeypatch.setenv("ORACLE_ARC_ENVIRONMENT", "staging")

    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )
    assert response.status_code == 401


def test_missing_application_scope_is_denied_and_audited() -> None:
    app_id, credential_id, private_key = register_application(
        scopes=["integration.status.read"]
    )

    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )
    assert response.status_code == 403

    with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
        event = connection.execute(
            """
            SELECT event_type,outcome
            FROM oracle_arc.audit_events
            WHERE app_id=%s AND event_type='request.scope_denied'
            ORDER BY created_at DESC LIMIT 1
            """,
            (app_id,),
        ).fetchone()
    assert event == ("request.scope_denied", "denied")


def test_database_enforces_per_application_request_quota() -> None:
    _, credential_id, private_key = register_application(quota=1)

    first = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )
    second = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )

    assert first.status_code == 200
    assert second.status_code == 429


def test_audit_events_are_immutable() -> None:
    app_id, credential_id, private_key = register_application()
    response = client.get(
        "/v1/apps/me",
        headers=signed_headers(credential_id, private_key),
    )
    assert response.status_code == 200

    with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
        event_id = connection.execute(
            """
            SELECT event_id FROM oracle_arc.audit_events
            WHERE app_id=%s AND event_type='request.authenticated'
            ORDER BY created_at DESC LIMIT 1
            """,
            (app_id,),
        ).fetchone()[0]

    with pytest.raises(psycopg.errors.ObjectNotInPrerequisiteState):
        with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
            connection.execute(
                "UPDATE oracle_arc.audit_events SET outcome='denied' WHERE event_id=%s",
                (event_id,),
            )


def test_bounded_maintenance_purges_expired_state_without_a_scheduler() -> None:
    app_id, _, _ = register_application()
    old_time = datetime.now(UTC) - timedelta(days=2)
    with psycopg.connect(os.environ["ORACLE_ARC_TEST_ADMIN_DATABASE_URL"]) as connection:
        connection.execute(
            """
            INSERT INTO oracle_arc.request_nonces(app_id,nonce,expires_at)
            VALUES (%s,%s,%s),(%s,%s,%s)
            """,
            (
                app_id,
                secrets.token_urlsafe(24),
                datetime.now(UTC) - timedelta(minutes=1),
                app_id,
                secrets.token_urlsafe(24),
                datetime.now(UTC) - timedelta(minutes=2),
            ),
        )
        connection.execute(
            """
            INSERT INTO oracle_arc.rate_limit_buckets(app_id,window_started_at,request_count)
            VALUES (%s,%s,1),(%s,%s,1)
            """,
            (app_id, old_time, app_id, old_time - timedelta(minutes=1)),
        )
        connection.execute("SET ROLE oracle_arc_maintenance")
        result = connection.execute(
            "SELECT * FROM oracle_arc.purge_expired_runtime_state(1)"
        ).fetchone()
        connection.execute("RESET ROLE")

        remaining_nonces = connection.execute(
            "SELECT count(*) FROM oracle_arc.request_nonces WHERE app_id=%s",
            (app_id,),
        ).fetchone()[0]
        remaining_buckets = connection.execute(
            "SELECT count(*) FROM oracle_arc.rate_limit_buckets WHERE app_id=%s",
            (app_id,),
        ).fetchone()[0]

    assert result == (1, 1)
    assert remaining_nonces == 1
    assert remaining_buckets == 1


def test_runtime_database_role_has_only_narrow_procedure_access() -> None:
    with psycopg.connect(os.environ["ORACLE_ARC_DATABASE_URL"]) as connection:
        privileges = connection.execute(
            """
            SELECT
              has_table_privilege(current_user,'oracle_arc.application_clients','SELECT'),
              has_table_privilege(current_user,'oracle_arc.application_credentials','SELECT'),
              has_table_privilege(current_user,'oracle_arc.audit_events','SELECT'),
              has_table_privilege(current_user,'oracle_arc.audit_events','UPDATE'),
              has_function_privilege(current_user,
                'oracle_arc.authenticate_application(uuid,text)','EXECUTE'),
              has_function_privilege(current_user,
                'oracle_arc.purge_expired_runtime_state(integer)','EXECUTE'),
              has_function_privilege('oracle_arc_maintenance',
                'oracle_arc.purge_expired_runtime_state(integer)','EXECUTE')
            """
        ).fetchone()

    assert privileges == (False, False, False, False, True, False, True)
