/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [

  ],
  theme: {
    extend: {
    },
  },
  plugins: [require("daisyui")],
  variants: {
    extend: {
      opacity: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    },
  },
  daisyui: {
    themes: false,
    darkTheme: false,
  },
}

