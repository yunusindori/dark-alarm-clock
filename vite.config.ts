import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 7000, // Change to your desired port number (e.g., 8080, 3000)
    host: true, // Set to true to listen on all addresses, including LAN and public addresses
  }
})
