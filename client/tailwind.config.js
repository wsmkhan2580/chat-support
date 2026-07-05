/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Strict monochromatic corporate palette — a single neutral ramp
        // plus one accent (ink) used sparingly for primary actions/focus.
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b7b8c0',
          400: '#8f8f9a',
          500: '#6b6b76',
          600: '#4f4f59',
          700: '#3a3a42',
          800: '#26262c',
          900: '#161619',
          950: '#0b0b0d',
        },
        success: '#2f6d4c',
        danger: '#8f2d2d',
        warning: '#8a6a1c',
      },
      spacing: {
        4.5: '18px',
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgba(11, 11, 13, 0.06), 0 1px 3px 0 rgba(11, 11, 13, 0.08)',
        raised: '0 4px 12px -2px rgba(11, 11, 13, 0.12)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
