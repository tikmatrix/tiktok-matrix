/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [

  ],
  theme: {
    extend: {
    },
  },
  variants: {
    extend: {
      opacity: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    },
  },

}

