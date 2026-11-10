#!/usr/bin/env bash
# ==============================================================================
# UNNATI — Developer Environment Validation Script (Bash)
# ==============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================================="
echo "   UNNATI (उन्नति) — Local Tooling & Environment Checker   "
echo "=========================================================="
echo ""

ALL_PASSED=true

# 1. Node.js Check
printf "Checking Node.js... "
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo -e "${GREEN}PASSED (v$NODE_VER)${NC}"
    else
        echo -e "${YELLOW}WARNING (v$NODE_VER found, recommend v20+ LTS)${NC}"
    fi
else
    echo -e "${RED}FAILED (Node.js not found)${NC}"
    ALL_PASSED=false
fi

# 2. pnpm Check
printf "Checking pnpm... "
if command -v pnpm >/dev/null 2>&1; then
    PNPM_VER=$(pnpm -v)
    echo -e "${GREEN}PASSED (v$PNPM_VER)${NC}"
else
    echo -e "${RED}FAILED (pnpm not found. Run 'npm install -g pnpm')${NC}"
    ALL_PASSED=false
fi

# 3. Python Check
printf "Checking Python runtime... "
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
fi

if [ -n "$PYTHON_BIN" ]; then
    PY_VER=$($PYTHON_BIN -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    echo -e "${GREEN}PASSED (v$PY_VER)${NC}"
else
    echo -e "${RED}FAILED (Python 3.11+ not found)${NC}"
    ALL_PASSED=false
fi

# 4. Git Check
printf "Checking Git CLI... "
if command -v git >/dev/null 2>&1; then
    GIT_VER=$(git --version)
    echo -e "${GREEN}PASSED ($GIT_VER)${NC}"
else
    echo -e "${RED}FAILED (Git not found)${NC}"
    ALL_PASSED=false
fi

# 5. Docker Check
printf "Checking Docker Engine... "
if command -v docker >/dev/null 2>&1; then
    DOCKER_VER=$(docker --version)
    echo -e "${GREEN}AVAILABLE ($DOCKER_VER)${NC}"
else
    echo -e "${YELLOW}OPTIONAL (Docker not installed; remote Neon + Upstash active)${NC}"
fi

echo ""
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}All essential developer prerequisites are SATISFIED!${NC}"
else
    echo -e "${RED}Some required tools are missing. Please review the output above.${NC}"
fi
