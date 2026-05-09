# Design System — {Project Name}

**Status**: DRAFT 📝
**Locked on**: (not yet locked)

---

## Brand Direction

{1-2 sentences describing the visual mood and what the design communicates}

---

## Colors

### Primary
| Token | Hex | Use |
|-------|-----|-----|
| primary-50 | #{hex} | Light background tints |
| primary-500 | #{hex} | Main brand color |
| primary-700 | #{hex} | Hover states |
| primary-900 | #{hex} | Text on light backgrounds |

### Secondary
| Token | Hex | Use |
|-------|-----|-----|
| secondary-500 | #{hex} | Supporting color |

### Accent
| Token | Hex | Use |
|-------|-----|-----|
| accent-500 | #{hex} | CTAs and highlights |

### Neutrals
| Token | Hex | Use |
|-------|-----|-----|
| neutral-50 | #{hex} | Page background |
| neutral-100 | #{hex} | Card background |
| neutral-300 | #{hex} | Dividers, borders |
| neutral-600 | #{hex} | Secondary text |
| neutral-900 | #{hex} | Primary text |

### Semantic
| Token | Hex | Use |
|-------|-----|-----|
| success | #{hex} | Success states |
| error | #{hex} | Error states |
| warning | #{hex} | Warning states |
| info | #{hex} | Info states |

### Dark Mode
| Token | Hex | Use |
|-------|-----|-----|
| dark-bg | #{hex} | Page background |
| dark-surface | #{hex} | Card background |
| dark-text | #{hex} | Primary text |

---

## Typography

**Font Family**: {font name}
**Google Fonts URL**: {url}

| Scale | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| xs | 12px | 400 | 1.4 | Captions |
| sm | 14px | 400 | 1.5 | Labels |
| base | 16px | 400 | 1.6 | Body text |
| lg | 18px | 500 | 1.5 | Emphasized body |
| xl | 20px | 600 | 1.4 | Section headings |
| 2xl | 24px | 700 | 1.3 | Page headings |
| 3xl | 30px | 700 | 1.2 | Hero headings |
| 4xl | 36px | 800 | 1.1 | Display |

---

## Spacing

Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Tight gaps |
| sm | 8px | Small gaps |
| md | 16px | Default padding |
| lg | 24px | Section gaps |
| xl | 32px | Large sections |
| 2xl | 48px | Page sections |
| 3xl | 64px | Hero padding |

---

## Component Styles

**Border Radius**: {value}px
**Shadow**: {description (e.g., "0 1px 3px rgba(0,0,0,0.1)")}
**Button style**: {filled / outlined / ghost}

---

## CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #{hex};
  --color-secondary: #{hex};
  --color-accent: #{hex};
  --bg-page: #{hex};
  --bg-surface: #{hex};
  --text-primary: #{hex};
  --text-secondary: #{hex};
  --color-success: #{hex};
  --color-error: #{hex};
  
  /* Typography */
  --font-sans: '{font}', sans-serif;
  --text-base: 16px;
  
  /* Spacing */
  --space-md: 16px;
  --space-lg: 24px;
  
  /* Shapes */
  --radius: {value}px;
  --radius-lg: {value*2}px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
}
```

---

## Change Policy

This document is locked after `/design` approval.
To change the design system: run `/design` and get explicit approval.
