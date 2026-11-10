import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app.main as main

routes = [r.path for r in main.app.routes]
print(f"Total routes: {len(routes)}")
target_route = "/api/v1/webhooks/clerk"
if target_route in routes:
    print(f"SUCCESS: Webhook route '{target_route}' is registered!")
else:
    print(f"ERROR: '{target_route}' NOT found in routes: {routes}")

