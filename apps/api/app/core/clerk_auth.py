import os
import jwt
from jwt import PyJWKClient, InvalidTokenError, PyJWKClientError
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

CLERK_ISSUER = os.getenv("CLERK_ISSUER", settings.clerk_issuer)
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", settings.resolved_jwks_url)
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE", settings.clerk_audience or "unnati-api")
CLOCK_SKEW = int(os.getenv("CLERK_CLOCK_SKEW_SECONDS", str(settings.clerk_clock_skew_seconds)))

bearer_scheme = HTTPBearer(auto_error=False)

# Reuse one JWKS client rather than creating one
# for every incoming API request. In-memory cache for 3600s (1 hr).
jwks_client = PyJWKClient(
    CLERK_JWKS_URL,
    cache_jwk_set=True,
    lifespan=3600,
)

def verify_clerk_token(token: str) -> dict:
    """
    Decodes and cryptographically validates a Clerk RS256 JWT token using JWKS.
    Enforces expiration, issuance time, subject claim, issuer, and clock skew.
    """
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Determine whether token specifies the custom audience or standard Clerk audience
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        token_aud = unverified_claims.get("aud")
        should_verify_aud = bool(CLERK_AUDIENCE and token_aud == CLERK_AUDIENCE)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            audience=CLERK_AUDIENCE if should_verify_aud else None,
            leeway=CLOCK_SKEW,
            options={
                "require": ["exp", "iat", "sub"],
                "verify_aud": should_verify_aud
            },
        )
        return payload
    except (InvalidTokenError, PyJWKClientError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the Bearer token.
    Returns canonical user identity and profile claims.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )
    payload = verify_clerk_token(credentials.credentials)
    return {
        "sub": payload["sub"],
        "clerk_user_id": payload["sub"],
        "email": payload.get("email"),
        "first_name": payload.get("first_name"),
        "last_name": payload.get("last_name"),
        "email_verified": payload.get("email_verified"),
        "two_factor_enabled": payload.get("two_factor_enabled"),
        "claims": payload,
    }

