/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080808',
          900: '#0F0F0F',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#3D3D3D',
          400: '#777777',
          200: '#BBBBBB',
        },
        lime: {
          400: '#D4FF00',
          500: '#CAFF03',
          600: '#B3E000',
        },
        pitch: {
          900: '#0D2B0D',
          800: '#153515',
          700: '#1E4A1E',
          600: '#2A6030',
        },
        surface: {
          100: '#F4F4F2',
          200: '#EBEBEB',
          300: '#DEDEDE',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        condensed: ['"Barlow Condensed"', '"Barlow"', 'sans-serif'],
        sans: ['"Barlow"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}

