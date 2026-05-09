# Design System — {workspace-name}

**Status**: DRAFT (locked after /design phase)

> This is the shared design system for the entire workspace.
> Individual app DESIGN.md files extend this — do not duplicate tokens, reference this file.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | | Main brand color |
| `--color-primary-hover` | | Hover state |
| `--color-secondary` | | Secondary brand |
| `--color-accent` | | CTA, highlights |
| `--color-background` | | Page background |
| `--color-surface` | | Card/panel background |
| `--color-foreground` | | Primary text |
| `--color-muted` | | Secondary text |
| `--color-border` | | Borders, dividers |
| `--color-error` | | Errors, destructive |
| `--color-success` | | Success states |
| `--color-warning` | | Warnings |

### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--color-background-dark` | | |
| `--color-surface-dark` | | |
| `--color-foreground-dark` | | |

---

## Typography

**Heading font**: {font-name}
**Body font**: {font-name}

```css
/* Google Fonts import */
{import-url}
```

| Scale | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `xs` | 12px | 400 | 1.5 | Labels, captions |
| `sm` | 14px | 400 | 1.5 | Secondary text |
| `base` | 16px | 400 | 1.5 | Body text |
| `lg` | 18px | 500 | 1.4 | Subheadings |
| `xl` | 20px | 600 | 1.3 | Section titles |
| `2xl` | 24px | 600 | 1.2 | Page headings |
| `3xl` | 32px | 700 | 1.1 | Hero headings |
| `4xl` | 48px | 700 | 1.0 | Display |

---

## Spacing Scale

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Compact elements |
| `space-3` | 12px | Inner padding |
| `space-4` | 16px | Standard padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large gaps |
| `space-12` | 48px | Section spacing |
| `space-16` | 64px | Page sections |

---

## Border Radius & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Buttons, inputs |
| `radius-md` | 8px | Cards, panels |
| `radius-lg` | 12px | Modals, drawers |
| `radius-full` | 9999px | Pills, avatars |

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | | Subtle elevation |
| `shadow-md` | | Cards, dropdowns |
| `shadow-lg` | | Modals, sheets |

---

## Shared Components

> Describe shared component patterns — don't implement code here.

### Button
- Primary: filled, `--color-primary` background
- Secondary: outlined, `--color-border` border
- Destructive: filled, `--color-error` background
- All: 44px min height, `radius-sm`, 150ms transition

### Input
- Height: 44px, `radius-sm`, `--color-border` border
- Focus: 2px ring, `--color-primary`
- Error: `--color-error` border + helper text below

### Card
- Background: `--color-surface`, `radius-md`, `shadow-sm`
- Padding: `space-6`

---

## CSS Variables (starter)

```css
:root {
  /* Colors */
  --color-primary: ;
  --color-secondary: ;
  --color-accent: ;
  --color-background: ;
  --color-surface: ;
  --color-foreground: ;
  --color-muted: ;
  --color-border: ;
  --color-error: ;
  --color-success: ;

  /* Typography */
  --font-heading: ;
  --font-body: ;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```
