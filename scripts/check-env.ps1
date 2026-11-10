# ==============================================================================
# UNNATI — Developer Environment Validation Script (PowerShell)
# Verifies all local prerequisites for frontend, backend, and infrastructure.
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   UNNATI (उन्नति) — Local Tooling & Environment Checker   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$AllPassed = $true

# 1. Node.js Check
Write-Host -NoNewline "Checking Node.js... "
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = (node -v).TrimStart('v')
    $major = [int]($nodeVer.Split('.')[0])
    if ($major -ge 20) {
        Write-Host "PASSED (v$nodeVer)" -ForegroundColor Green
    } else {
        Write-Host "WARNING (v$nodeVer found, recommended: v20.x or v22.x LTS)" -ForegroundColor Yellow
    }
} else {
    Write-Host "FAILED (Node.js not found. Please install Node.js v20+ LTS)" -ForegroundColor Red
    $AllPassed = $false
}

# 2. pnpm Check
Write-Host -NoNewline "Checking pnpm... "
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVer = pnpm -v
    Write-Host "PASSED (v$pnpmVer)" -ForegroundColor Green
} else {
    Write-Host "FAILED (pnpm not found. Run 'npm install -g pnpm@latest')" -ForegroundColor Red
    $AllPassed = $false
}

# 3. Python Check
Write-Host -NoNewline "Checking Python runtime... "
$pythonCmd = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } elseif (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { $null }

if ($pythonCmd) {
    $pyVer = (& $pythonCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')")
    $pyMajor = [int]($pyVer.Split('.')[0])
    $pyMinor = [int]($pyVer.Split('.')[1])
    if ($pyMajor -eq 3 -and $pyMinor -ge 11) {
        Write-Host "PASSED (v$pyVer)" -ForegroundColor Green
    } else {
        Write-Host "WARNING (v$pyVer found, recommended: Python 3.11.x or 3.12.x)" -ForegroundColor Yellow
    }
} else {
    Write-Host "FAILED (Python 3.11+ not found on PATH)" -ForegroundColor Red
    $AllPassed = $false
}

# 4. Git Check
Write-Host -NoNewline "Checking Git CLI... "
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVer = (git --version).Trim()
    Write-Host "PASSED ($gitVer)" -ForegroundColor Green
} else {
    Write-Host "FAILED (Git not found)" -ForegroundColor Red
    $AllPassed = $false
}

# 5. Docker Check (Optional for local containers)
Write-Host -NoNewline "Checking Docker Engine... "
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVer = (docker --version).Trim()
    Write-Host "AVAILABLE ($dockerVer)" -ForegroundColor Green
} else {
    Write-Host "OPTIONAL (Docker not installed; remote Neon + Upstash active)" -ForegroundColor Yellow
}

# 6. Check .env configuration
Write-Host -NoNewline "Checking local .env file... "
if (Test-Path ".env") {
    Write-Host "FOUND (Configured)" -ForegroundColor Green
} else {
    Write-Host "MISSING (Create by copying .env.example -> .env)" -ForegroundColor Yellow
}

Write-Host ""
if ($AllPassed) {
    Write-Host "All essential developer prerequisites are SATISFIED!" -ForegroundColor Green
    Write-Host "You are ready to run UNNATI locally." -ForegroundColor Cyan
} else {
    Write-Host "Some required tools are missing. Please install the marked items above." -ForegroundColor Red
}

