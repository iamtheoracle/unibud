"""Signed, app-scoped authentication for Oracle Arc service clients."""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import time
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import psycopg
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from fastapi import Depends, HTTPException, Request, status
from psycopg.rows import dict_row

_KEY_ID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.I)
_NONCE = re.compile(r"^[A-Za-z0-9_-]{22,86}$")
_SIGNATURE = re.compile(r"^[A-Za-z0-9_-]{86}$")
_ALLOWED_ENVIRONMENTS = {"development", "staging", "production"}


@dataclass(frozen=True)
class ApplicationContext:
    app_id: uuid.UUID
    slug: str
    display_name: str
    environment: str
    scopes: tuple[str, ...]
    requests_per_minute: int
    credential_id: uuid.UUID


def _database_url() -> str:
    value = os.getenv("ORACLE_ARC_DATABASE_URL", "").strip()
    if not value:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Oracle Arc application identity storage is not configured.",
        )
    return value


def _decode_signature(value: str) -> bytes:
    if not _SIGNATURE.fullmatch(value):
        raise ValueError("Invalid signature encoding.")
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _canonical_request(request: Request, timestamp: str, nonce: str, body: bytes) -> bytes:
    raw_path = request.scope.get("raw_path", request.url.path.encode("ascii"))
    target = raw_path.decode("ascii")
    raw_query = request.scope.get("query_string", b"")
    if raw_query:
        target += "?" + raw_query.decode("ascii")
    body_digest = hashlib.sha256(body).hexdigest()
    return "\n".join(
        ("v1", request.method.upper(), target, timestamp, nonce, body_digest)
    ).encode("utf-8")


async def _record_event(
    app_id: uuid.UUID,
    event_type: str,
    outcome: str,
    request_id: uuid.UUID,
    event_data: dict[str, str],
) -> None:
    try:
        async with await psycopg.AsyncConnection.connect(_database_url()) as conn:
            await conn.execute(
                "SELECT oracle_arc.record_app_event(%s,%s,%s,%s,%s::jsonb)",
                (app_id, event_type, outcome, request_id, json.dumps(event_data)),
            )
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Oracle Arc audit storage is unavailable.",
        ) from exc


async def authenticate_application(request: Request) -> ApplicationContext:
    credential_text = request.headers.get("x-oracle-arc-key-id", "")
    timestamp_text = request.headers.get("x-oracle-arc-timestamp", "")
    nonce = request.headers.get("x-oracle-arc-nonce", "")
    signature_text = request.headers.get("x-oracle-arc-signature", "")

    if not _KEY_ID.fullmatch(credential_text) or not timestamp_text.isdigit() or len(timestamp_text) > 12:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid application credentials.")
    if not _NONCE.fullmatch(nonce) or not _SIGNATURE.fullmatch(signature_text):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signed request.")

    timestamp = int(timestamp_text)
    if abs(int(time.time()) - timestamp) > 60:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Signed request has expired.")

    try:
        credential_id = uuid.UUID(credential_text)
        signature = _decode_signature(signature_text)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signed request.") from exc

    environment = os.getenv("ORACLE_ARC_ENVIRONMENT", "development").strip()
    if environment not in _ALLOWED_ENVIRONMENTS:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Oracle Arc environment is not configured.",
        )

    body = await request.body()
    canonical = _canonical_request(request, timestamp_text, nonce, body)
    request_id = uuid.uuid4()
    replayed = False
    rate_limited = False

    try:
        async with await psycopg.AsyncConnection.connect(
            _database_url(), row_factory=dict_row
        ) as conn:
            result = await conn.execute(
                "SELECT * FROM oracle_arc.authenticate_application(%s,%s)",
                (credential_id, environment),
            )
            row = await result.fetchone()
            if row is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Application credentials are not active for this environment.",
                )

            try:
                Ed25519PublicKey.from_public_bytes(bytes(row["public_key"])).verify(
                    signature, canonical
                )
            except (InvalidSignature, ValueError) as exc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid signed request.",
                ) from exc

            expires_at = datetime.fromtimestamp(timestamp, UTC) + timedelta(minutes=5)
            nonce_result = await conn.execute(
                "SELECT oracle_arc.consume_request_nonce(%s,%s,%s) AS accepted",
                (row["app_id"], nonce, expires_at),
            )
            nonce_row = await nonce_result.fetchone()
            if not nonce_row["accepted"]:
                replayed = True
                await conn.execute(
                    "SELECT oracle_arc.record_app_event(%s,%s,%s,%s,%s::jsonb)",
                    (row["app_id"], "request.replay_rejected", "rejected", request_id, "{}"),
                )
            else:
                limit_result = await conn.execute(
                    "SELECT oracle_arc.consume_app_rate_limit(%s) AS allowed",
                    (row["app_id"],),
                )
                limit_row = await limit_result.fetchone()
                if not limit_row["allowed"]:
                    rate_limited = True
                    await conn.execute(
                        "SELECT oracle_arc.record_app_event(%s,%s,%s,%s,%s::jsonb)",
                        (row["app_id"], "request.rate_limited", "denied", request_id, "{}"),
                    )
                else:
                    await conn.execute(
                        "SELECT oracle_arc.record_app_event(%s,%s,%s,%s,%s::jsonb)",
                        (
                            row["app_id"],
                            "request.authenticated",
                            "allowed",
                            request_id,
                            json.dumps({"method": request.method.upper(), "path": request.url.path}),
                        ),
                    )
    except HTTPException:
        raise
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Oracle Arc application identity storage is unavailable.",
        ) from exc

    if replayed:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Request replay rejected.")
    if rate_limited:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Application request quota exceeded.")

    context = ApplicationContext(
        app_id=row["app_id"],
        slug=row["slug"],
        display_name=row["display_name"],
        environment=row["environment"],
        scopes=tuple(row["scopes"]),
        requests_per_minute=row["requests_per_minute"],
        credential_id=credential_id,
    )
    request.state.oracle_arc_request_id = request_id
    return context


def require_application_scope(scope: str):
    async def dependency(
        request: Request,
        context: ApplicationContext = Depends(authenticate_application),
    ) -> ApplicationContext:
        if scope not in context.scopes:
            request_id = getattr(request.state, "oracle_arc_request_id", uuid.uuid4())
            await _record_event(
                context.app_id,
                "request.scope_denied",
                "denied",
                request_id,
                {"required_scope": scope, "path": request.url.path},
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Application scope is not granted.",
            )
        return context

    return dependency
