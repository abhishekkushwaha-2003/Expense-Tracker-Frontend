import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devHeaders = {
  'Permissions-Policy': 'accelerometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com"), gyroscope=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com"), magnetometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com")',
}

export default defineConfig({
  plugins: [react()],
  server: {
    headers: devHeaders,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    headers: devHeaders,
  },
})
