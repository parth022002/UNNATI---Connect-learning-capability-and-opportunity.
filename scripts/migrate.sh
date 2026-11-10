#!/usr/bin/env bash
# ==============================================================================
# UNNATI — Database Migration Execution Step (Bash) (OPS-004)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../apps/api"

echo "Applying pending Alembic schema revisions to head..."
alembic upgrade head
echo "SUCCESS: Database migrations applied cleanly!"

