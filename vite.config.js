import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const scriptUrl = env.VITE_GOOGLE_SCRIPT_URL || env.VITE_GOOGLE_APPS_SCRIPT_URL || env.VITE_GOOGLE_SHEET_URL || 'https://script.google.com/macros/s/AKfycbx7QpI9dcyzvPNHaO8pObxUDTNV5MRcR_6LeRWMD7yCVtThJTbwP1_WQsnsoUdmZUCC/exec'

  const googleScriptProxy = {
    name: 'google-script-proxy',
    configureServer(server) {
      server.middlewares.use('/api/google-script', async (req, res, next) => {
        if (!scriptUrl) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end(JSON.stringify({ success: false, error: 'Google Apps Script URL is not configured.' }))
          return
        }

        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const upstreamResponse = await fetch(scriptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body,
            })

            const text = await upstreamResponse.text()
            res.writeHead(upstreamResponse.status, {
              'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:5173',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            })
            res.end(text)
          } catch (error) {
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:5173',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            })
            res.end(JSON.stringify({ success: false, error: error.message }))
          }
        })
      })
    },
  }

  return {
    plugins: [react(), googleScriptProxy],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      hmr: {
        host: '127.0.0.1',
        protocol: 'ws',
      },
    },
  }
})
