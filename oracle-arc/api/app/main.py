from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Oracle Arc API",
    version="0.1.0",
    description="Independent AI core API. No inference provider is configured yet.",
)


class ServiceStatus(BaseModel):
    service: str
    status: str
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
    # Readiness is deliberately explicit: the API can start, but no model
    # provider, app registry, or durable store is configured at this stage.
    return ServiceStatus(
        service="oracle-arc",
        status="degraded",
        inference="not-configured",
    )
