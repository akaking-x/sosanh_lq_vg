/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gaming theme dark mode
        'game': {
          'dark': '#0a0e27',
          'darker': '#050812',
          'card': '#1a1f3a',
          'accent': '#f4a131',
          'accent-dark': '#d48c1f',
          'red': '#d32f2f',
          'red-dark': '#b71c1c',
          'gold': '#ffd700',
          'gold-dark': '#daa520',
          'text': '#e0e0e0',
          'text-secondary': '#b0b0b0',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gaming': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(244, 161, 49, 0.3)' },
          '50%': { opacity: '.8', boxShadow: '0 0 20px rgba(244, 161, 49, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
