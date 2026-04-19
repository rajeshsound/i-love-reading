/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        katha: {
          50: '#fef7ee',
          100: '#fdecd3',
          200: '#fad5a6',
          300: '#f6b86e',
          400: '#f19234',
          500: '#ee7512',
          600: '#df5b09',
          700: '#b9430a',
          800: '#943510',
          900: '#782e11',
          950: '#411406',
        },
      },
    },
  },
  plugins: [],
}
