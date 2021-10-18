const config = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
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
        secondary: "#FAA21B",
        warning: "#FFC000",
        error: "#DF2020",
        success: "#09AA09",
        info: "#0A94C2",
        grey: "#E0E0E0",
        white: "white",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")({strategy: 'class',})],
};

module.exports = config;
