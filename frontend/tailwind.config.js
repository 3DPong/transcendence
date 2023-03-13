/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html', './node_modules/tw-elements/dist/js/**/*.js'],
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require('tw-elements/dist/plugin'),
    require('tailwind-scrollbar')
  ]
}