# UI & Design Engine

Ateschh Kit includes a built-in design engine with searchable databases of UI styles, color palettes, font pairings, UX guidelines, and chart types. Always use it during `/design` and `/build` phases.

## When to Use

**Must use:**
- Designing a new page or component
- Choosing colors, fonts, or UI style
- Reviewing UX or accessibility quality
- Implementing navigation or layout

**Skip for:** backend logic, API/DB design, infrastructure.

---

## Commands

Run from the **project root directory** (not from inside `design-engine/`):

```bash
# Generate full design system for the project (REQUIRED at /design phase)
python3 design-search.py "<product_type> <keywords>" --design-system -p "Project Name"

# Save design system to file (use --persist during /design)
python3 design-search.py "<query>" --design-system --persist -p "Project Name"

# Page-specific override
python3 design-search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"

# Domain search (use during /build for specific guidance)
python3 design-search.py "<keyword>" --domain <domain>

# Stack-specific guidelines
python3 design-search.py "<keyword>" --stack <stack>
```

**Domains:** `style` `color` `typography` `ux` `product` `landing` `chart`

**Stacks:** `react` `nextjs` `vue` `svelte` `astro` `react-native` `flutter` `swiftui` `shadcn` `jetpack-compose` `html-tailwind`

---

## Design System Files

When `--persist` is used, these files are created inside the project folder:

```
projects/{name}/design-system/
├── MASTER.md          ← Global design system (source of truth)
└── pages/
    ├── dashboard.md   ← Page-specific overrides
    └── landing.md
```

**Reading priority:** page override → MASTER.md fallback.

---

## /design Phase Integration

After DESIGN.md is drafted, run:

```bash
python3 design-search.py "<product_type> <style_keywords>" --design-system --persist -p "{Project Name}"
```

This generates `design-system/MASTER.md` alongside DESIGN.md. Both are locked together.

---

## /build Phase Integration

Before coding each page:

1. Check `design-system/pages/{page}.md` if it exists, else use `MASTER.md`
2. Run domain search for the specific component if needed:
   ```bash
   python3 design-search.py "<component type>" --domain ux
   ```
3. Apply rules from the checklist below before marking L2 done

---

## Pre-Delivery Checklist (L2 gate for UI tasks)

- [ ] Contrast ≥ 4.5:1 for text (light and dark mode)
- [ ] Touch targets ≥ 44×44pt / 48×48dp
- [ ] No emoji as icons — use SVG icon library (Phosphor, Lucide, Heroicons)
- [ ] 8pt/8dp spacing rhythm
- [ ] Mobile-first layout, no horizontal scroll
- [ ] Error messages placed near the related field
- [ ] Loading state on async buttons
- [ ] Animations use transform/opacity only (150–300ms, ease-out enter / ease-in exit)
- [ ] Dark mode contrast verified separately
- [ ] Navigation has both icon + label

---

## Priority Rules Reference

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Accessibility | CRITICAL |
| 2 | Touch & Interaction | CRITICAL |
| 3 | Performance | HIGH |
| 4 | Style Selection | HIGH |
| 5 | Layout & Responsive | HIGH |
| 6 | Typography & Color | MEDIUM |
| 7 | Animation | MEDIUM |
| 8 | Forms & Feedback | MEDIUM |
| 9 | Navigation Patterns | HIGH |
| 10 | Charts & Data | LOW |

For full rule details, run: `python3 design-search.py "<topic>" --domain ux`
