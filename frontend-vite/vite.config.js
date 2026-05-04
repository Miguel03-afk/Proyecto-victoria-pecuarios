import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,          //  este es el "true" que recordabas
    port: 5173,
    strictPort: true,
    allowedHosts: true,  //  también en true (equivale a permitir todos)
    hmr: {
      clientPort: 443
    }
  },
  plugins: [react(), tailwindcss()],
})