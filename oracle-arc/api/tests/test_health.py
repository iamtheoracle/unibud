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


def test_integration_status_requires_a_configured_server_key(monkeypatch) -> None:
    monkeypatch.delenv("ORACLE_ARC_API_KEY", raising=False)
    response = client.get("/v1/integration/status")
    assert response.status_code == 503


def test_integration_status_rejects_invalid_credentials(monkeypatch) -> None:
    monkeypatch.setenv("ORACLE_ARC_API_KEY", "server-only-test-key")
    response = client.get(
        "/v1/integration/status",
        headers={"Authorization": "Bearer wrong-key"},
    )
    assert response.status_code == 401


def test_integration_status_reports_configuration_without_leaking_secrets(
    monkeypatch,
) -> None:
    monkeypatch.setenv("ORACLE_ARC_API_KEY", "server-only-test-key")
    monkeypatch.setenv("ORACLE_ARC_MODEL", "local/qwen2.5:7b")
    response = client.get(
        "/v1/integration/status",
        headers={"Authorization": "Bearer server-only-test-key"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "service": "oracle-arc",
        "authenticated": True,
        "model_configured": True,
        "inference": "not-configured",
    }
    assert "server-only-test-key" not in response.text
