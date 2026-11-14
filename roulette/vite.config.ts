import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // clipfriends.club/huddling 아래에 배포한다. wrangler.jsonc의 assets.base_path와 맞춘다.
  base: '/huddling/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})


