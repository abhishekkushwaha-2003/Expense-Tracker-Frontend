import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const devHeaders = {
  'Permissions-Policy': 'accelerometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai"), gyroscope=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai"), magnetometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai")',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
    const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://13.234.20.4:18080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      headers: devHeaders,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      headers: devHeaders,
    },
  }
})

