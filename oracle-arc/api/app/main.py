import hmac
import os

from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel

app = FastAPI(
    title="Oracle Arc API",
    version="0.2.0",
    description="Independent AI core API. Inference remains disabled until a provider is configured.",
)


class ServiceStatus(BaseModel):
    service: str
    status: str
    inference: str


class IntegrationStatus(BaseModel):
    service: str
    authenticated: bool
    model_configured: bool
    inference: str


@app.get("/health", response_model=ServiceStatus, tags=["operations"])
async def health() -> ServiceStatus:
    return ServiceStatus(
        service="oracle-arc",
        status="ok",
        inference="not-configured",
    )


@app.get("/ready", response_model=ServiceStatus, tags=["operations"])
async def readiness() -> ServiceStatus:
    # Process health is not inference readiness. Keep this degraded until a
    # real provider, app registry, and durable store have been implemented.
    return ServiceStatus(
        service="oracle-arc",
        status="degraded",
        inference="not-configured",
    )


@app.get(
    "/v1/integration/status",
    response_model=IntegrationStatus,
    tags=["integration"],
)
async def integration_status(
    authorization: str | None = Header(default=None),
) -> IntegrationStatus:
    """Authenticated, non-secret connection check for registered server clients."""
    expected_key = os.getenv("ORACLE_ARC_API_KEY", "")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Oracle Arc service authentication is not configured.",
        )

    scheme, separator, supplied_key = (authorization or "").partition(" ")
    if (
        not separator
        or scheme.lower() != "bearer"
        or not hmac.compare_digest(supplied_key, expected_key)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return IntegrationStatus(
        service="oracle-arc",
        authenticated=True,
        model_configured=bool(os.getenv("ORACLE_ARC_MODEL", "").strip()),
        inference="not-configured",
    )
