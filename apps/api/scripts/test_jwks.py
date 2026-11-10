import httpx
import json

url = "https://allowing-raptor-9178.clerk.accounts.dev/.well-known/jwks.json"
print(f"Testing JWKS URL: {url}")
try:
    response = httpx.get(url, timeout=10.0)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print("Response JSON:")
    print(json.dumps(data, indent=2))
    keys = data.get("keys", [])
    print(f"\nKeys found: {len(keys)}")
    for k in keys:
        print(f"  - kid: {k.get('kid')}")
        print(f"    kty: {k.get('kty')}")
        print(f"    alg: {k.get('alg')}")
        print(f"    use: {k.get('use')}")
except Exception as e:
    print(f"Error connecting to JWKS endpoint: {e}")

