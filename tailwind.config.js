/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      colors: {
        kawaii: {
          pink: '#FFE4E9',
          blue: '#E0F2FE',
          purple: '#F3E8FF',
          dark: '#4A4A4A'
        }
      }
    },
  },
  plugins: [],
}