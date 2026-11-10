from app.core.clerk_auth import (
    verify_clerk_token,
    get_current_user,
    jwks_client,
    bearer_scheme as security_bearer
)

def decode_clerk_jwt(token: str) -> dict:
    """Delegates to RS256 JWKS verification engine in clerk_auth."""
    return verify_clerk_token(token)

__all__ = [
    "verify_clerk_token",
    "decode_clerk_jwt",
    "get_current_user",
    "jwks_client",
    "security_bearer"
]

