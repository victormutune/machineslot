# ─────────────────────────────────────────────
#  push.ps1  —  Gradiator quick GitHub pusher
#  Usage:
#    .\push.ps1                    (auto timestamp message)
#    .\push.ps1 "your message"     (custom commit message)
# ─────────────────────────────────────────────

param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Gradiator  →  GitHub Pusher" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Use custom message or auto-generate one with timestamp
if ($Message -eq "") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Message = "update: $timestamp"
}

Write-Host "📦  Staging all changes..." -ForegroundColor Yellow
git add -A

# Check if there's anything to commit
$status = git status --porcelain
if ($status -eq "") {
    Write-Host "✅  Nothing to commit — already up to date." -ForegroundColor Green
    exit 0
}

Write-Host "💬  Committing: `"$Message`"" -ForegroundColor Yellow
git commit -m $Message

Write-Host "🚀  Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "✅  Done! Code pushed to GitHub." -ForegroundColor Green
Write-Host ""
