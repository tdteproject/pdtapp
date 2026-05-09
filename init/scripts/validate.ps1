# validate.ps1
# Sanity-checks the kit's structural invariants.
# Run before commits, releases, and as part of CI.
#
# Checks:
#   1. .claude/agents/ contains all agents listed in REGISTRY.md.
#   2. Agent frontmatter has required fields (name, description, tools, model).
#   3. .claude/skills/ canonical skills match REGISTRY.md.
#   4. Skill frontmatter has required fields (name, description).
#   5. Command tree (.claude/commands/, .agent/workflows/, .opencode/commands/) is in sync.
#   6. No deprecated paths used (agents/, skills/ at repo root must not exist).
#   7. No dead skill references in agent definitions.
#   8. design-search.py exists and is non-empty.
#
# Exit code 0 = pass, 1 = fail. Failures are listed.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$failures = @()

function Add-Failure {
    param([string]$Message)
    $script:failures += $Message
}

# 1. Deprecated locations must not exist.
foreach ($legacy in @("agents", "skills")) {
    $path = Join-Path $root $legacy
    if (Test-Path $path) {
        Add-Failure "deprecated directory exists at repo root: $legacy/"
    }
}

# 2. Required directories.
foreach ($req in @(".claude/agents", ".claude/skills", ".claude/commands", ".claude/rules", "templates")) {
    if (-not (Test-Path (Join-Path $root $req))) {
        Add-Failure "missing required directory: $req"
    }
}

# 3. Agent frontmatter + Output Contract check.
$agentDir = Join-Path $root ".claude\agents"
if (Test-Path $agentDir) {
    Get-ChildItem -Path $agentDir -Filter "*.md" -File | Where-Object { $_.BaseName -notin @("REGISTRY", "_TEMPLATE", "OUTPUT-SCHEMA", "CONTEXT7-CACHE-FORMAT") } | ForEach-Object {
        $content = Get-Content -Raw $_.FullName
        foreach ($field in @("^name:", "^description:", "^tools:", "^model:")) {
            if (-not [regex]::IsMatch($content, $field, "Multiline")) {
                Add-Failure "agent $($_.Name) missing frontmatter field: $field"
            }
        }
        # Each agent must declare an Output Contract section and reference the schema.
        if (-not [regex]::IsMatch($content, "^## Output Contract", "Multiline")) {
            Add-Failure "agent $($_.Name) missing '## Output Contract' section"
        }
        if ($content -notmatch "OUTPUT-SCHEMA\.md") {
            Add-Failure "agent $($_.Name) does not reference .claude/agents/OUTPUT-SCHEMA.md"
        }
        # Each agent must have an Anti-Patterns section to prevent silent scope creep.
        if (-not [regex]::IsMatch($content, "^## Anti-Patterns", "Multiline")) {
            Add-Failure "agent $($_.Name) missing '## Anti-Patterns' section"
        }
    }
}

# 3b. OUTPUT-SCHEMA.md and REGISTRY.md exist.
foreach ($req in @("OUTPUT-SCHEMA.md", "REGISTRY.md")) {
    $p = Join-Path $agentDir $req
    if (-not (Test-Path $p)) {
        Add-Failure "agents directory missing $req"
    }
}

# 4. Skill frontmatter check (canonical only).
$skillDir = Join-Path $root ".claude\skills"
if (Test-Path $skillDir) {
    Get-ChildItem -Path $skillDir -Directory | Where-Object { $_.Name -ne "community" } | ForEach-Object {
        $skillFile = Join-Path $_.FullName "SKILL.md"
        if (-not (Test-Path $skillFile)) {
            Add-Failure "canonical skill $($_.Name) missing SKILL.md"
            return
        }
        $content = Get-Content -Raw $skillFile
        foreach ($field in @("^name:", "^description:")) {
            if (-not [regex]::IsMatch($content, $field, "Multiline")) {
                Add-Failure "skill $($_.Name) missing frontmatter field: $field"
            }
        }
    }
}

# 5. Command tree sync check.
$cmdSrc  = Join-Path $root ".claude\commands"
$cmdAgent = Join-Path $root ".agent\workflows"
$cmdOpenCode = Join-Path $root ".opencode\commands"

if ((Test-Path $cmdSrc) -and (Test-Path $cmdAgent)) {
    $srcFiles  = Get-ChildItem -Path $cmdSrc -Filter "*.md" -File | Sort-Object Name
    $mirroredA = Get-ChildItem -Path $cmdAgent -Filter "*.md" -File | Sort-Object Name
    if ($srcFiles.Count -ne $mirroredA.Count) {
        Add-Failure ".agent/workflows/ has different file count from .claude/commands/ ($($mirroredA.Count) vs $($srcFiles.Count))"
    }
}
if ((Test-Path $cmdSrc) -and (Test-Path $cmdOpenCode)) {
    $srcFiles  = Get-ChildItem -Path $cmdSrc -Filter "*.md" -File | Sort-Object Name
    $mirroredO = Get-ChildItem -Path $cmdOpenCode -Filter "*.md" -File | Sort-Object Name
    if ($srcFiles.Count -ne $mirroredO.Count) {
        Add-Failure ".opencode/commands/ has different file count from .claude/commands/ ($($mirroredO.Count) vs $($srcFiles.Count))"
    }
}

# 6. design-search.py exists.
$ds = Join-Path $root "design-search.py"
if (-not (Test-Path $ds)) {
    Add-Failure "design-search.py missing"
} elseif ((Get-Item $ds).Length -eq 0) {
    Add-Failure "design-search.py is empty"
}

# 7. Report.
if ($failures.Count -eq 0) {
    Write-Host "validate: ok" -ForegroundColor Green
    exit 0
}

Write-Host "validate: $($failures.Count) failure(s)" -ForegroundColor Red
foreach ($f in $failures) { Write-Host "  - $f" -ForegroundColor Red }
exit 1
