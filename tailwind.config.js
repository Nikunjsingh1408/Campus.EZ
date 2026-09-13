/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3F4F6',
        ink: '#16213E',
        inkfaint: '#4B5670',
        line: '#DADFE8',
        accent: {
          academic: '#3A86FF',
          event: '#2D6A4F',
          deadline: '#D7263D',
          general: '#7C3AED',
          announcement: '#EA580C',
        },
        highlight: '#FFD23F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,33,62,0.06), 0 4px 10px rgba(22,33,62,0.05)',
      },
    },
  },
  plugins: [],
}
