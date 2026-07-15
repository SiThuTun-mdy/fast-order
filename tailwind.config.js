/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Deep tomato-red accent for the login hero — used sparingly
        // alongside brand orange, not a site-wide color.
        appetite: {
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
