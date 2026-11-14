import hmac
import os

from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel

from app.identity import ApplicationContext, require_application_scope

app = FastAPI(
    title="Oracle Arc API",
    version="0.3.0",
    description="Independent governed AI core API. Inference remains disabled until a provider is verified.",
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


class ApplicationIdentity(BaseModel):
    slug: str
    display_name: str
    environment: str
    scopes: list[str]
    requests_per_minute: int


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
    # real provider and all required durable dependencies are exercised.
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
    """Legacy integration probe retained for existing server-to-server clients."""
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


@app.get(
    "/v1/apps/me",
    response_model=ApplicationIdentity,
    tags=["application identity"],
)
async def application_identity(
    context: ApplicationContext = Depends(
        require_application_scope("identity.read")
    ),
) -> ApplicationIdentity:
    """Return only the authenticated calling application's public identity."""
    return ApplicationIdentity(
        slug=context.slug,
        display_name=context.display_name,
        environment=context.environment,
        scopes=list(context.scopes),
        requests_per_minute=context.requests_per_minute,
    )
