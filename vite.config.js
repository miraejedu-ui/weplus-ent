import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { adminApi } from './server/apiPlugin.js'

function normalizeBase(value) {
  if (!value || value === '/') return '/'
  const withSlash = value.startsWith('/') ? value : `/${value}`
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE),
  plugins: [react(), adminApi()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
})
