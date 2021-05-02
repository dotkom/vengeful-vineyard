module.exports = {
  purge: {
    enabled: !process.env.ROLLUP_WATCH,
    content: ['./public/index.html', './src/**/*.svelte'],
    options: {
      defaultExtractor: content => [
        ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
      ],
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      primary: {
        100: "#73A8CC",
        250: "#4C90BF",
        500: "#0060A3",
        750: "#00528B",
        1000:"#004372",
      },
      secondary: "#FAA21B",
      warning: "#FFC000",
      error: "#DF2020",
      success: "#09AA09",
      info: "#0A94C2",
      grey: "#E0E0E0",
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
  ],
}