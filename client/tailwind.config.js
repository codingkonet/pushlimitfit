/** @type {import('tailwindcss').Config} */
const rgb = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mapped to CSS variables so theme (dark/light) + accent can be
        // swapped at runtime without touching component classes.
        white: rgb('--c-white'),
        gray: {
          50: rgb('--c-gray-50'),
          100: rgb('--c-gray-100'),
          200: rgb('--c-gray-200'),
          300: rgb('--c-gray-300'),
          400: rgb('--c-gray-400'),
          500: rgb('--c-gray-500'),
          600: rgb('--c-gray-600'),
          700: rgb('--c-gray-700'),
          800: rgb('--c-gray-800'),
          900: rgb('--c-gray-900'),
          950: rgb('--c-gray-950'),
        },
        green: {
          400: rgb('--c-accent-400'),
          500: rgb('--c-accent-500'),
          600: rgb('--c-accent-600'),
          700: rgb('--c-accent-700'),
        },
      },
    },
  },
  plugins: [],
};
