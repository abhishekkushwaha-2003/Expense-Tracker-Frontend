import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'node:http'
import https from 'node:https'

const devHeaders = {
  'Permissions-Policy': 'accelerometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai"), gyroscope=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai"), magnetometer=(self "https://checkout.razorpay.com" "https://checkout-static-next.razorpay.com" "https://api.sardine.ai")',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTargets = (env.VITE_API_PROXY_TARGETS || env.VITE_API_BASE_URLS || env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080,http://127.0.0.1:18080')
    .split(',')
    .map((target) => target.trim().replace(/\/$/, ''))
    .filter(Boolean)

  return {
    plugins: [localApiFallbackProxy(apiProxyTargets), react(), tailwindcss()],
    server: {
      headers: devHeaders,
    },
    preview: {
      headers: devHeaders,
    },
  }
})

function localApiFallbackProxy(apiProxyTargets) {
  return {
    name: 'local-api-fallback-proxy',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const chunks = []

        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          const body = Buffer.concat(chunks)
          const requestUrl = req.url || '/'
          const upstreamPath = requestUrl.replace(/^\/api(?=\/|$)/, '') || '/'

          for (const target of apiProxyTargets) {
            try {
              await proxyRequest(target, upstreamPath, req, res, body)
              return
            } catch {
              // Try the next local backend. The browser only sees the final result.
            }
          }

          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ message: 'Backend is unavailable. Start STS gateway on 8080 or Docker gateway on 18080.' }))
        })
      })
    },
  }
}

function proxyRequest(target, upstreamPath, clientReq, clientRes, body) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(upstreamPath, target)
    const transport = targetUrl.protocol === 'https:' ? https : http
    const headers = {
      ...clientReq.headers,
      host: targetUrl.host,
      'content-length': body.length,
    }

    const upstreamReq = transport.request(
      targetUrl,
      {
        method: clientReq.method,
        headers,
      },
      (upstreamRes) => {
        clientRes.writeHead(upstreamRes.statusCode || 500, upstreamRes.headers)
        upstreamRes.pipe(clientRes)
        upstreamRes.on('end', resolve)
      },
    )

    upstreamReq.on('error', reject)
    upstreamReq.write(body)
    upstreamReq.end()
  })
}

