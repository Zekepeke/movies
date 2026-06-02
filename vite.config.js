import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Expose dev server on the LAN so iPhone on the same Wi-Fi can hit it.
    // Vite will print both http://localhost:5173 and http://<your-mac-ip>:5173
    host: true,
    port: 5173,
  },
})