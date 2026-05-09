# App Structure — {Project Name}

**Status**: DRAFT 📝
**Approved on**: (not yet approved)

---

## Golden Path

{start screen} → {core action} → {success state}

---

## Auth Boundary

**Public** (no login required):
- {page}
- {page}

**Protected** (login required):
- {page}
- {page}

---

## Pages / Screens

### {page-name}
**Route**: `/{route}` (or Screen name for mobile)
**Purpose**: {one sentence}

**Must-have (MVP)**:
- {feature}
- {feature}

**Nice-to-have (v2)**:
- {feature}

**Data**:
- Reads: {data sources}
- Writes: {what is created or modified}

---

### {page-name}
**Route**: `/{route}`
**Purpose**: {one sentence}

**Must-have (MVP)**:
- {feature}

---

## Navigation Map

{Describe how pages connect — text or simple diagram}

```
Home → Login → Dashboard → {Feature}
           ↓
        Register
```

---

## API Routes (if applicable)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/{resource} | {purpose} |
| POST | /api/{resource} | {purpose} |
| PUT | /api/{resource}/{id} | {purpose} |
| DELETE | /api/{resource}/{id} | {purpose} |

---

## Database Schema (high level)

```
{table_name}
├── id: uuid
├── {field}: {type}
└── created_at: timestamp

{table_name}
├── id: uuid
├── {field}: {type}
└── updated_at: timestamp
```
