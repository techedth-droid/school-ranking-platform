/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-prompt)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /** Primary surfaces — #3b3b3b and scale */
        main: {
          DEFAULT: '#3b3b3b',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#454545',
          800: '#3b3b3b',
          900: '#2d2d2d',
          950: '#1a1a1a',
        },
        /** Accent — #2563EB and blue scale for CTAs, links, focus */
        accent: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        /** Sub-accent — secondary text & subtle UI (#64748B family) */
        muted: {
          DEFAULT: '#475569',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#475569',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        contrast: '#ffffff',
        /** Medal / rank highlights (unchanged semantics) */
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c8a415',
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#5c3210',
        },
        bronze: {
          50: '#fdf4ef',
          100: '#fbe6d5',
          200: '#f5c9a9',
          300: '#efa473',
          400: '#e8813e',
          500: '#cd6f33',
          600: '#b45a28',
          700: '#964523',
          800: '#793921',
          900: '#63301e',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover':
          '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        elevated: '0 8px 30px rgb(0 0 0 / 0.06)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
