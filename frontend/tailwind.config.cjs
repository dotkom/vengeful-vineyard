const config = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#73A8CC",
          250: "#4C90BF",
          500: "#0060A3",
          750: "#00528B",
          1000: "#004372",
        },
        secondary: "#FBBF24",
        warning: "#FFC000",
        error: "#DF2020",
        success: "#09AA09",
        info: "#0A94C2",
        grey: "#E0E0E0",
        white: "white",
      },
      fontFamily: {
        sspro: ["Source Sans Pro", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("daisyui"),
    require("flowbite/plugin"),
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        mytheme: {
          primary: "#093B51",
          "primary-focus": "#8462f4",
          "primary-content": "#ffffff",

          secondary: "#FBBF24",
          "secondary-focus": "#d4a11e",
          "secondary-content": "#ffffff",
        },
      },
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
};

module.exports = config;
