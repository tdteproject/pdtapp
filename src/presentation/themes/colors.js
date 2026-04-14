// ─── PDT Health App — Global Color Tokens ───
// Aligned with prompt.txt design specification
// Palette: Blue (#2962FF), Green (#00C853), White (#FFFFFF)

export const colors = {
    // Primary — vibrant blue
    primary: {
        main: '#2962FF',
        dark: '#0039CB',
        light: '#768FFF',
        glow: 'rgba(41, 98, 255, 0.25)',
        subtle: 'rgba(41, 98, 255, 0.10)',
        focusRing: 'rgba(41, 98, 255, 0.12)',
        disabled: '#B3CCFF',
    },
    // Accent — fresh green
    accent: {
        main: '#00C853',
        light: '#5EFC82',
        glow: 'rgba(0, 200, 83, 0.25)',
    },
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    cardAlt: '#F5F7FA',
    cardElevated: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.85)',
    halo: 'rgba(235, 243, 255, 0.40)', // #EBF3FF at 40% opacity
    // Borders
    border: '#EEF2FF',
    borderIdle: '#E2EEFF',
    borderFocus: '#2962FF',
    borderFilled: '#00C853',
    borderLight: '#F0F2F5',
    borderAccent: 'rgba(41, 98, 255, 0.4)',
    // Text
    text: {
        primary: '#1A1D20',
        secondary: '#495057',
        muted: '#AAAAAA',
        subtle: '#888888',
        inverse: '#FFFFFF',
        accent: '#2962FF',
    },
    // Health metric colors
    health: {
        steps: '#2962FF',
        calories: '#FFC107',
        workout: '#00C853',
        heartRate: '#FF375F',
        bloodOxygen: '#40C8E0',
        sleep: '#5E5CE6',
        stress: '#BF5AF2',
        weight: '#AC8E68',
        hrv: '#FF9F0A',
        hydration: '#40C8E0',
    },
    // Semantic
    success: '#00C853',
    warning: '#FFC107',
    error: '#E53935',
    info: '#40C8E0',
    // Logout / destructive
    logout: {
        bg: '#FFF0F0',
        border: '#FFCCCC',
        text: '#E53935',
    },
    // Notification
    notification: {
        on: '#00C853',
    },
    // Gradient tokens
    gradient: {
        primary: ['#2962FF', '#0039CB'],
        hero: ['#F8F9FA', '#FFFFFF'],
        card: ['#FFFFFF', '#F8F9FA'],
        success: ['#00C853', '#00A844'],
        night: ['#E9ECEF', '#F8F9FA'],
    },
    // Skeleton / Shimmer
    skeleton: '#F0F2F5',
    // Settings row tap state
    tapState: '#F5F7FA',
    // Edit button bg
    editBg: '#EEF4FF',
};
