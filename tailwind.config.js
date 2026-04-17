// tailwind.config.js
import flowbite from "flowbite-react/tailwind";
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    colors: {
      'primary': '#2563EB',
      "secondary": "#1D4ED8",
    },
    screens: {
      'xs': '425px',

      'sm': '640px',

      'md': '768px',

      'lg': '1024px',

      'xl': '1280px',

      '2xl': '1636px',
    },
    extend: {
      boxShadow: {
        // Custom shadow named 'top-shadow'
        'top-shadow': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -4px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "lightGrey white"
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "1px"
          },
          "&::-webkit-scrollbar-track": {
            background: "white"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(31 41 55)",
            borderRadius: "20px",
            border: "1px solid white"
          },
        },
        // Add styles for other browsers if needed
      }

      addUtilities(newUtilities, ["responsive", "hover"])
    },
    require('flowbite/plugin'),
  ],
}

