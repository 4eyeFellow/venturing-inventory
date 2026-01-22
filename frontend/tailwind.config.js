/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4472C4',
          dark: '#2D5AA6',
          light: '#6B93E0'
        },
        secondary: {
          DEFAULT: '#70AD47',
          dark: '#5A8C38',
          light: '#8BC76A'
        },
        accent: {
          DEFAULT: '#ED7D31',
          dark: '#D66525',
          light: '#F29A5C'
        },
        danger: {
          DEFAULT: '#C55A11',
          dark: '#A04A0E',
          light: '#DC7535'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
