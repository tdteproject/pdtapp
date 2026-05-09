# sync-skills.ps1
# Pulls a whitelist of community skills from the user's global Claude skills directory
# into the kit at .claude/skills/community/. Run when refreshing community skill content.
#
# This is for kit maintainers updating the bundled skill set, not for end users.

$Source = Join-Path $env:USERPROFILE ".claude\skills"
$Dest   = Join-Path $PSScriptRoot "..\.claude\skills\community"

$whitelist = @(
    # Web & Frontend
    "nextjs-app-router-patterns",
    "nextjs-best-practices",
    "react-best-practices",
    "typescript-expert",
    "tailwind-design-system",
    "shadcn",

    # Mobile
    "react-native-architecture",
    "expo-deployment",
    "expo-api-routes",
    "flutter-expert",

    # Backend & DB
    "nodejs-backend-patterns",
    "fastapi-pro",
    "supabase-automation",
    "prisma-expert",
    "postgres-best-practices",

    # AI/ML
    "llm-app-patterns",
    "rag-implementation",
    "prompt-engineering",

    # DevOps & Deploy
    "docker-expert",
    "cloudflare-workers-expert",
    "vercel-deployment",
    "electron-development"
)

$copied  = 0
$missing = 0

if (-not (Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

Write-Host "Syncing community skills ($($whitelist.Count) requested)..." -ForegroundColor Cyan

foreach ($skill in $whitelist) {
    $sourceDir = Join-Path $Source $skill
    $skillMd   = Join-Path $sourceDir "SKILL.md"

    if (Test-Path $skillMd) {
        $targetDir = Join-Path $Dest $skill
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item -Path $skillMd -Destination (Join-Path $targetDir "SKILL.md") -Force
        $copied++
        Write-Host "  copied: $skill" -ForegroundColor Green
    } else {
        $missing++
        Write-Host "  missing: $skill" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done. Copied: $copied. Missing: $missing." -ForegroundColor Cyan
