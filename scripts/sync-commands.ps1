# sync-commands.ps1
# Mirrors .claude/commands/ to .agent/workflows/ and .opencode/commands/.
# .claude/commands/ is the single source of truth.

$Root   = Resolve-Path (Join-Path $PSScriptRoot "..")
$Source = Join-Path $Root ".claude\commands"
$Targets = @(
    (Join-Path $Root ".agent\workflows"),
    (Join-Path $Root ".opencode\commands")
)

if (-not (Test-Path $Source)) {
    Write-Error "Source not found: $Source"
    exit 1
}

foreach ($target in $Targets) {
    if (Test-Path $target) {
        Remove-Item -Path (Join-Path $target "*") -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }

    Copy-Item -Path (Join-Path $Source "*") -Destination $target -Recurse -Force
    $count = (Get-ChildItem -Path $target -Filter "*.md" -File).Count
    Write-Host "synced -> $target ($count files)" -ForegroundColor Green
}

Write-Host "command tree synchronised." -ForegroundColor Cyan
