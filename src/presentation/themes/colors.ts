export const colors = {
  // Primary — vibrant blue (icons, primary actions, focus elements)
  primary: {
    main: '#0066FF',
    dark: '#0052CC',
    light: '#3385FF',
    glow: 'rgba(0, 102, 255, 0.25)',
    subtle: 'rgba(0, 102, 255, 0.10)',
  },

  // Accent — fresh green (highlights, success states, active elements)
  accent: {
    main: '#05A660',
    light: '#12C27A',
    glow: 'rgba(5, 166, 96, 0.25)',
  },

  // Backgrounds — white & clarity
  background: '#FAFAFA',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  cardAlt: '#F1F3F5',
  cardElevated: '#FFFFFF',
  glass: 'rgba(0, 0, 0, 0.04)',

  // Borders
  border: '#E9ECEF',
  borderLight: '#F1F3F5',
  borderAccent: 'rgba(0, 102, 255, 0.4)',

  // Text
  text: {
    primary: '#1A1D20',
    secondary: '#495057',
    muted: '#868E96',
    inverse: '#FFFFFF',
    accent: '#0066FF',
  },

  // Health metric colors
  health: {
    steps: '#0066FF',       // Blue
    calories: '#FFD60A',    // Yellow
    workout: '#05A660',     // Green
    heartRate: '#FF375F',   // Red
    bloodOxygen: '#40C8E0', // Cyan
    sleep: '#5E5CE6',       // Indigo
    stress: '#BF5AF2',      // Purple
    weight: '#AC8E68',      // Brown
    hrv: '#FF9F0A',         // Amber
    hydration: '#40C8E0',   // Cyan
  },

  // Semantic
  success: '#05A660',
  warning: '#FFD60A',
  error: '#FF375F',
  info: '#40C8E0',

  // Gradient tokens (for LinearGradient or manual styling)
  gradient: {
    primary: ['#0066FF', '#0052CC'] as string[],
    hero: ['#F8F9FA', '#FFFFFF'] as string[],
    card: ['#FFFFFF', '#F8F9FA'] as string[],
    success: ['#05A660', '#04854D'] as string[],
    night: ['#E9ECEF', '#F8F9FA'] as string[],
  },
} as const;
