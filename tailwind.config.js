/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a2e4a',
        'navy-dark': '#0f1d2e',
        'navy-light': '#2a4a6b',
      },
    },
  },
  plugins: [],
}

