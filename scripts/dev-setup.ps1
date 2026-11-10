Write-Host "UNNATI local setup"
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "Install pnpm first: npm install -g pnpm"
  exit 1
}
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example. Review values before starting."
}
Write-Host "Start local services: docker compose -f infra/docker-compose.yml up -d"
Write-Host "Install JS dependencies: pnpm install"
