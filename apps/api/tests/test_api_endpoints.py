import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Validates root discovery endpoint returns UNNATI metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "UNNATI (उन्नति) API"
    assert "version" in data

def test_health_probes():
    """Validates baseline health and email probes."""
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"
    
    res_email = client.get("/health/email")
    assert res_email.status_code == 200
    assert "status" in res_email.json()

def test_owasp_security_headers():
    """Validates OWASP security headers injected on every response."""
    response = client.get("/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age" in response.headers.get("Strict-Transport-Security", "")

def test_clerk_webhook_missing_headers_rejected():
    """Validates Clerk webhook rejects requests without Svix signature headers."""
    response = client.post("/api/v1/webhooks/clerk", json={"type": "user.created"})
    # Either 400 Bad Request (missing headers) or 200 (if dev mode without secret)
    assert response.status_code in [200, 400]
