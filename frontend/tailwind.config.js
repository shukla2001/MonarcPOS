/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        monarc: {
          50: '#FDFBF7',
          100: '#FAF3E7',
          200: '#F5E6CC',
          300: '#EDD3A4',
          400: '#DFB870',
          500: '#C68A4C', // Rich Imperial Gold
          600: '#B45309', // Royal Amber
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
          peach: '#F7E2D8',
          cream: '#FFFDF9',
          surface: '#FFFBEB',
          dark: '#1E1B18',
          charcoal: '#262626',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        gold: '0 4px 20px -2px rgba(198, 138, 76, 0.25)',
        'gold-lg': '0 10px 25px -3px rgba(198, 138, 76, 0.35)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(198, 138, 76, 0.15)',
      },
    },
  },
  plugins: [],
};
