/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B1A12',
          elevated: '#122A1C',
        },
        foreground: {
          DEFAULT: '#EAF5EE',
          muted: '#9FC6AC',
        },
        primary: {
          50: '#EAF9EF',
          100: '#CFF0DC',
          200: '#A0E0BA',
          300: '#6FCF94',
          400: '#3FBD70',
          500: '#22A559',
          600: '#188245',
          700: '#136336',
          800: '#0F4C2A',
          900: '#0A3A20',
        },
        danger: '#E5484D',
        warning: '#F5B544',
        border: '#1E3B29',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
