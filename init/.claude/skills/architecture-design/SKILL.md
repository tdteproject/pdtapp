---
name: architecture-design
description: Creates STRUCTURE.md (pages/features) and DESIGN.md (visual system), and PLAN.md (task list)
---

# Skill: Architecture & Design

## Purpose

Produce three locked documents that define what will be built and how it will look.

## Outputs

1. **STRUCTURE.md** — App structure, pages, features, navigation (architect produces this)
2. **DESIGN.md** — Colors, typography, spacing, component style (designer produces this)
3. **PLAN.md** — Ordered task list derived from STRUCTURE.md (architect produces this)

## STRUCTURE.md Template

```markdown
# App Structure — {project name}

**Status**: APPROVED ✅
**Approved on**: {date}

## Golden Path
{start screen} → {core action} → {success state}

## Auth Boundary
- **Public**: {list of public pages}
- **Protected**: {list of protected pages}

## Pages

### {page-name}
**Route**: /{route} (or Screen: {name} for mobile)
**Purpose**: {one sentence}

**Must-have (MVP)**:
- {feature}
- {feature}

**Nice-to-have (v2)**:
- {feature}

**Data**:
- Reads: {data sources}
- Writes: {what is created/modified}

---
{repeat for each page}

## Navigation
{Describe how pages connect — list or diagram}

## API Routes (if applicable)
- `GET /api/{resource}` — {purpose}
- `POST /api/{resource}` — {purpose}
```

## PLAN.md Template

```markdown
# Build Plan — {project name}

**Status**: APPROVED ✅
**Approved on**: {date}

## Phase 4 — Build Tasks

### 🛠 Setup
- [ ] Initialize {framework} project
- [ ] Install all dependencies from REQUIREMENTS.md
- [ ] Configure environment variables
- [ ] Set up database schema

### 📄 {Page/Feature Name} — {S/M/L}
- [ ] {specific task}
- [ ] {specific task}

### 📄 {Page/Feature Name}
- [ ] {specific task}

### 🔗 Integration
- [ ] End-to-end auth flow
- [ ] API connections tested
- [ ] Final responsive pass

## Sizing Guide
S = ~15 min | M = ~30 min | L = ~1 hour
```
