/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
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

