// ─── PDT Health App — Typography Tokens ───
// Aligned with prompt.txt Global Design Tokens (Section 5)

// Font family
export const fontFamily = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

// Font sizes — aligned to spec tokens
export const fontSize = {
    micro: 11,   // Micro
    xs: 12,      // ~Small helper
    sm: 13,      // Small
    base: 15,    // Body
    md: 17,      // H3
    lg: 20,      // H2
    xl: 22,      // Card title / OTP verify title
    '2xl': 24,   // H1
    '3xl': 28,   // Large value
    '4xl': 32,   // Splash name
    '5xl': 36,   // Score center
};

// Font weights — mapped to spec
export const fontWeight = {
    light: '300',
    normal: '400',  // Body, Small, Micro
    medium: '500',  // H1, H2, H3
    semibold: '600',
    bold: '700',
    extrabold: '800',
};

// Line heights
export const lineHeight = {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 28,
    spacious: 32,
};

// Letter spacing
export const letterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 0.2,
    wider: 0.5,
    widest: 1,
};
