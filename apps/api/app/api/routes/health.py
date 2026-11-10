from fastapi import APIRouter, Depends
from sqlalchemy import text
import psycopg
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(tags=["system"])

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "unnati-api",
        "version": "0.1.0",
        "environment": settings.app_env
    }

@router.get("/health/db")
def health_db():
    try:
        # Connect using psycopg3 with the configured DATABASE_URL
        # Strip '+psycopg' if present for raw psycopg connection string
        conn_str = settings.database_url.replace("postgresql+psycopg://", "postgresql://")
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version();")
                pg_ver = cur.fetchone()[0]
                cur.execute("SELECT extname FROM pg_extension WHERE extname IN ('vector', 'pgcrypto');")
                extensions = [r[0] for r in cur.fetchall()]
        return {
            "status": "connected",
            "database": "Neon PostgreSQL",
            "version": pg_ver.split(",")[0],
            "extensions": extensions
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/health/auth-check")
async def health_auth_check(current_user: dict = Depends(get_current_user)):
    return {
        "status": "authenticated",
        "user_id": current_user.get("sub"),
        "org_id": current_user.get("org_id"),
        "claims": current_user
    }
