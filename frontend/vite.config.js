import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   build: {
//     outDir:'buildStaticReactVite' //default build directory for react-vite is dist but this overwrites build directoty as buildStaticReactVite
//   }
// })

export default {
  build: {
    outDir: 'dist'
  }
}
