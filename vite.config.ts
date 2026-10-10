import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"

// Plain Vite SPA. In dev, /api/* is proxied to the Express server so there are no CORS problems.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const target = env.VITE_PROXY_TARGET || "http://localhost:4000"
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { port: 5173, proxy: { "/api": { target, changeOrigin: true } } },
  }
})
