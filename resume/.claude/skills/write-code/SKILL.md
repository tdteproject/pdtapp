---
name: write-code
description: Implements a single PLAN.md task following locked requirements and design system
---

# Skill: Write Code

## Purpose

Implement exactly one task from PLAN.md — completely and correctly.

## Pre-Coding Checklist

Before writing a single line:
- [ ] REQUIREMENTS.md read — know allowed libraries
- [ ] DESIGN.md read — know design tokens to use
- [ ] Task description clear — know exact scope
- [ ] Library API verified — use Context7 MCP if uncertain

## Implementation Rules

| Rule | Detail |
|------|--------|
| Scope | Exactly the task. Nothing more. |
| Dependencies | Only from REQUIREMENTS.md |
| Types | TypeScript strict mode. No `any`. |
| Error handling | All async operations must handle failure |
| Design | Use exact values from DESIGN.md |
| Env vars | Never hardcode. Use process.env. |

## Code Patterns

### React/Next.js Component

```typescript
// Named export, functional, typed props
export function ComponentName({ prop }: { prop: string }) {
  return (
    <div className="...">
      {prop}
    </div>
  )
}
```

### Supabase Query

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', userId)

if (error) {
  console.error('Failed to fetch:', error.message)
  throw new Error(error.message)
}
```

### API Route (Next.js)

```typescript
export async function GET(request: Request) {
  try {
    // ... logic
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## After Coding

Run L1 verification:
```bash
npm run build && npm run typecheck && npm run lint
```

If any fail → fix before reporting done.

## Completion Report

```
✅ {task name} implemented

Files:
- {file}: {change description}

L1: ✅ Build • TypeScript • Lint all clean
```
