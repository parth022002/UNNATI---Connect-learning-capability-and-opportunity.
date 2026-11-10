import logging
from pathlib import Path
from typing import Optional
import boto3
from botocore.client import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

_s3_client = None

def get_s3_client():
    """Singleton Cloudflare R2 / S3 client."""
    global _s3_client
    if _s3_client is not None:
        return _s3_client

    if not settings.s3_access_key_id or not settings.s3_secret_access_key or not settings.s3_endpoint_url:
        logger.warning("Cloudflare R2 / S3 credentials not fully configured; falling back to local filesystem.")
        return None

    try:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
            region_name=settings.s3_region,
            config=Config(
                signature_version="s3v4",
                s3={"addressing_style": "virtual" if "r2.cloudflarestorage.com" not in settings.s3_endpoint_url else "path"}
            )
        )
        return _s3_client
    except Exception as e:
        logger.error(f"Failed to initialize S3/R2 client: {e}")
        return None

def upload_document_bytes(file_bytes: bytes, key: str, content_type: str = "application/pdf") -> str:
    """
    Uploads file bytes to Cloudflare R2 bucket (or local filesystem if S3 is unavailable).
    Returns the storage location URI (e.g. s3://bucket/key or local path).
    """
    client = get_s3_client()
    if settings.storage_backend == "s3" and client:
        try:
            client.put_object(
                Bucket=settings.s3_bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
            storage_uri = f"s3://{settings.s3_bucket}/{key}"
            logger.info(f"Uploaded file to Cloudflare R2: {storage_uri} ({len(file_bytes)} bytes)")
            return storage_uri
        except Exception as e:
            logger.error(f"Cloudflare R2 upload failed for key {key}: {e}. Falling back to local storage.")

    # Local fallback
    local_path = Path(settings.upload_dir) / key
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(file_bytes)
    logger.info(f"Saved file to local storage: {local_path}")
    return str(local_path)

def generate_presigned_download_url(key: str, ttl: Optional[int] = None) -> Optional[str]:
    """Generates a secure presigned GET URL for private candidate document access."""
    client = get_s3_client()
    if not client:
        return None
    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": key},
            ExpiresIn=ttl or settings.s3_presigned_download_ttl
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate presigned download URL for key {key}: {e}")
        return None

def generate_presigned_upload_url(key: str, content_type: str = "application/pdf", ttl: Optional[int] = None) -> Optional[str]:
    """Generates a secure presigned PUT URL allowing frontend to upload directly to R2."""
    client = get_s3_client()
    if not client:
        return None
    try:
        url = client.generate_presigned_url(
            "put_object",
            Params={"Bucket": settings.s3_bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=ttl or settings.s3_presigned_upload_ttl
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate presigned upload URL for key {key}: {e}")
        return None

def delete_file_from_storage(key: str) -> bool:
    """Permanently deletes a candidate file from Cloudflare R2 or local storage (DPDP Right-to-Erasure)."""
    client = get_s3_client()
    if client and settings.storage_backend == "s3":
        try:
            client.delete_object(Bucket=settings.s3_bucket, Key=key)
            logger.info(f"Permanently shredded object from R2: {key}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete object from R2 {key}: {e}")
            return False
    else:
        try:
            local_path = Path(settings.upload_dir) / key
            if local_path.exists():
                local_path.unlink()
                logger.info(f"Shredded local file: {local_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to shred local file {key}: {e}")
            return False

