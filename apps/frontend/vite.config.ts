import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server: {
  host: true,
  // @ts-ignore
  allowedHosts: "all" // this might not work with domain, to make it work with domain name also add that specific domain also
}})