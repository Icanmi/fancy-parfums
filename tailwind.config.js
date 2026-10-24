/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:     '#D4AF37',
        lemon:    '#D9F227',
        cream:    '#FBF8EF',
        charcoal: '#0A0A0A',
        muted:    '#6B6B88',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 24px rgba(212,175,55,0.25)',
        card: '0 8px 32px rgba(0,0,0,0.10)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
