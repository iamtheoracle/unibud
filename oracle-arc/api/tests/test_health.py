from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_reports_process_status_without_claiming_inference() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "service": "oracle-arc",
        "status": "ok",
        "inference": "not-configured",
    }


def test_readiness_is_degraded_until_dependencies_are_configured() -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "degraded"
    assert response.json()["inference"] == "not-configured"
