const { mauve, violet } = require("@radix-ui/colors");

const blue = {
	1: "#0f1720",
	2: "#0f1b2d",
	3: "#10243e",
	4: "#102a4c",
	5: "#0f3058",
	6: "#0d3868",
	7: "#0a4481",
	8: "#0954a5",
	9: "#0091ff",
	10: "#369eff",
	11: "#52a9ff",
	12: "#eaf6ff",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class",
	safelist: [
		{
			pattern:
				/(text|bg|border|ring)-(indigo|slate|red|blue|green|yellow|orange)-([2-9]|1[0-2]?)/,
			variants: [
				"focus",
				"hover",
				"active",
				"dark",
				"dark:focus",
				"dark:hover",
				"dark:active",
			],
		},
	],
	theme: {
		extend: {
			colors: {
				...mauve,
				...violet,
				blue,
			},
			keyframes: {
				slideDown: {
					from: { height: 0, overflow: "hidden" },
					to: {
						height: "var(--radix-accordion-content-height)",
						overflow: "visible",
					},
				},
				slideUp: {
					from: {
						height: "var(--radix-accordion-content-height)",
						overflow: "visible",
					},
					to: { height: 0, overflow: "hidden" },
				},
				fadeIn: {
					"0%": { opacity: "0" },
					"20%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
			animation: {
				slideDown: "slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
				slideUp: "slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)",
				fadeIn: "fadeIn 800ms ease-out forwards",
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar-hide")],
};
