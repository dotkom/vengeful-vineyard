import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "AUTH0_"],
  server: {
    port: 3000,
  },
})
