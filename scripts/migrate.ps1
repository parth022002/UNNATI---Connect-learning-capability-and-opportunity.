# ==============================================================================
# UNNATI — Database Migration Execution Step (PowerShell) (OPS-004)
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   UNNATI (उन्नति) — Running Database Migrations         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location (Join-Path $PSScriptRoot "..\apps\api")

$pyCmd = if (Test-Path ".\.venv\Scripts\alembic.exe") { ".\.venv\Scripts\alembic.exe" } elseif (Get-Command alembic -ErrorAction SilentlyContinue) { "alembic" } else { $null }

if (-not $pyCmd) {
    Write-Host "ERROR: Alembic CLI not found. Please activate your virtual environment." -ForegroundColor Red
    exit 1
}

Write-Host "Applying pending Alembic schema revisions to head..." -ForegroundColor Yellow
& $pyCmd upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database migrations applied cleanly!" -ForegroundColor Green
} else {
    Write-Host "FAILURE: Database migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
