import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        health: {
          green: '#10b981',
        },
        bgGradient: '#f8fafc',
      },
      fontFamily: {
        'sf-pro': ['System'],
      },
    },
  },
  plugins: [],
};

export default config;
