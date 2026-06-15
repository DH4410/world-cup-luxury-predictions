/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBFBFA',
          100: '#F5F5F3',
          200: '#EAEAEA',
          300: '#D8D8D6',
        },
        charcoal: {
          900: '#1A1A1A',
          800: '#2D2D2D',
          700: '#3D3D3D',
          600: '#555555',
          400: '#888888',
        },
        gold: {
          400: '#E8C84A',
          500: '#D4AF37',
          600: '#B8941E',
          700: '#9A7A10',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

