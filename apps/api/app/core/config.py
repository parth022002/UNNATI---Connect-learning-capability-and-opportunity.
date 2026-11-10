from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    app_env: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    api_secret_key: str = "unnati_dev_secret_key"

    # Database (Neon PostgreSQL + pgvector)
    database_url: str = "postgresql+psycopg://neondb_owner:npg_tTIr9EWL6dZM@ep-soft-union-a1ht3bcc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    database_direct_url: Optional[str] = "postgresql+psycopg://neondb_owner:npg_tTIr9EWL6dZM@ep-soft-union-a1ht3bcc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Redis Caching (Upstash Serverless Redis)
    redis_url: str = "redis://localhost:6379/0"
    redis_enabled: bool = True
    redis_default_ttl: int = 3600
    redis_taxonomy_cache_ttl: int = 86400

    # API Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_ip_per_minute: int = 60
    rate_limit_user_per_minute: int = 120

    # Authentication (Clerk)
    next_public_clerk_publishable_key: Optional[str] = None
    clerk_secret_key: Optional[str] = None
    clerk_issuer: str = "https://allowing-raptor-9178.clerk.accounts.dev"
    clerk_frontend_api_url: str = "https://allowing-raptor-9178.clerk.accounts.dev"
    clerk_backend_api_url: str = "https://api.clerk.com"
    clerk_jwks_url: Optional[str] = "https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json"
    jwks_url: Optional[str] = None
    jwks_endpoint: Optional[str] = None
    clerk_audience: Optional[str] = "unnati-api"
    clerk_clock_skew_seconds: int = 5
    clerk_pem_public_key_path: Optional[str] = "keys/clerk_public_key.pem"
    clerk_webhook_secret: Optional[str] = None
    clerk_webhook_signing_secret: Optional[str] = None

    @property
    def resolved_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def resolved_database_direct_url(self) -> str:
        url = self.database_direct_url or self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def resolved_webhook_secret(self) -> Optional[str]:
        return self.clerk_webhook_secret or self.clerk_webhook_signing_secret

    @property
    def resolved_jwks_url(self) -> str:
        return self.clerk_jwks_url or self.jwks_url or self.jwks_endpoint or "https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json"

    @property
    def clerk_public_key_pem(self) -> Optional[str]:
        """Reads the Clerk RSA public key PEM for fast offline token verification."""
        if self.clerk_pem_public_key_path:
            p = Path(self.clerk_pem_public_key_path)
            if not p.is_absolute():
                # Resolve relative to apps/api directory
                base_dir = Path(__file__).resolve().parent.parent.parent
                p = base_dir / self.clerk_pem_public_key_path
            if p.exists():
                return p.read_text(encoding="utf-8")
        return None

    # AI Providers
    ai_provider: str = "gemini"
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Storage (Cloudflare R2 / AWS S3 / Local)
    storage_backend: str = "s3"
    upload_dir: str = "storage/uploads"
    s3_endpoint_url: Optional[str] = "https://fff51884b9fbf78df9303e2c5952d621.r2.cloudflarestorage.com"
    s3_region: str = "auto"
    s3_bucket: str = "unnati-private-documents"
    s3_access_key_id: Optional[str] = None
    s3_secret_access_key: Optional[str] = None
    s3_presigned_upload_ttl: int = 900
    s3_presigned_download_ttl: int = 900
    s3_public_access: bool = False

    # Transactional Email (Resend)
    resend_api_key: Optional[str] = None
    email_from: str = "UNNATI <onboarding@resend.dev>"

    # Logging
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        extra="ignore",
        env_file_encoding="utf-8"
    )

settings = Settings()
