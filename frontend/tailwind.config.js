/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Single color
        'brand': '#3b82f6',

        'body': '#030712',
        'icon': '#1E429F',
        'icon-hover': '#1C64F2',
        'nav-shadow': '#00ffff',
        
        // Color with shades
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Custom named colors
        'ocean': '#006994',
        'sunset': '#ff6b35',
        'forest': '#2d5016',
      },
      fontFamily: {
        'arcade': ['Arcade', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

