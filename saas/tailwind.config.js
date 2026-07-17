/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f3ff',
          100: '#ebe9fe',
          200: '#dad6fe',
          300: '#beb5fd',
          400: '#9d8bfb',
          500: '#7f5cf6',
          600: '#6d3cf0',
          700: '#5b26d8',
          800: '#4c1eb7',
          900: '#401b97',
          950: '#14083d',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e2e5',
          200: '#c3c5cb',
          300: '#9fa1ac',
          400: '#777987',
          500: '#5a5b67',
          600: '#454650',
          700: '#383840',
          800: '#2c2d33',
          900: '#202025',
          950: '#0e0e11',
        }
      },
    },
  },
  plugins: [],
};
