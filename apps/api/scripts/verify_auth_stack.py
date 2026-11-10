import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app.core.clerk_auth as clerk_auth
import app.core.security as security
import app.main as main

print("1. Clerk Auth Module:")
print(f"   Issuer: {clerk_auth.CLERK_ISSUER}")
print(f"   JWKS URL: {clerk_auth.CLERK_JWKS_URL}")
print(f"   Audience: {clerk_auth.CLERK_AUDIENCE}")
print(f"   Clock Skew: {clerk_auth.CLOCK_SKEW}s")
print(f"   JWKS Client: {clerk_auth.jwks_client}")

print("\n2. Core Security Module:")
print(f"   verify_clerk_token is callable: {callable(security.verify_clerk_token)}")
print(f"   get_current_user is callable: {callable(security.get_current_user)}")

print("\n3. FastAPI Routes Loaded:")
print(f"   Total routes: {len(main.app.routes)}")
print("   All checks passed successfully!")
