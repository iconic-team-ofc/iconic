/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        primary:    '#A557F2',
        secondary:  '#BFBFBF',
        text:       '#FFFFFF',
        hover:      '#C17FF5',
      },
    },
  },
  plugins: [],
};
