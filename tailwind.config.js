/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e94560',
        board: {
          light: '#d4a574',
          dark: '#c49464',
          line: '#8b6914',
        },
      },
      animation: {
        'pulse-slow': 'pulse 1s ease-in-out infinite',
        'bounce-dot': 'bounce 1.4s infinite ease-in-out both',
        'modal-in': 'modalIn 0.3s ease',
        'line-grow': 'lineGrow 0.5s ease',
      },
      keyframes: {
        modalIn: {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        lineGrow: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}
