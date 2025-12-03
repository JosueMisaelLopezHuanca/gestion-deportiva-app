/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pb6: "#FFFFFF",
        pb5: "#41bfb2",
        pb3: "#f28627",
        pb1: "#d61727",
        pb4: "#f2efeb",

        // modo oscuro
        darkBase: "#0f1213",
        p11: "#2C7366",
        p2: "#f35734",
        p8: "#8a2628",
      },
      fontFamily: {
        oswald: "Oswald",
        alumni: "Alumni",
        balo: "Baloo",
        josefin: "Josefin",
      },
    },
  },
  plugins: [],
};
