import { createServer } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'

const port = Number(process.env.PREVIEW_PORT || 5173)
const lifetime = Number(process.env.PREVIEW_LIFETIME_MS || 7200000)
const server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true } })
await server.listen()
mkdirSync('.local', { recursive: true })
const state = { pid: process.pid, url: `http://127.0.0.1:${port}`, expires: new Date(Date.now() + lifetime).toISOString(), lifetimeMs: lifetime, policy: 'finite lifetime, unaffected by HMR or polling' }
writeFileSync(`.local/preview-${port}.json`, JSON.stringify(state, null, 2))
console.log(JSON.stringify(state))
const stop = async () => { await server.close(); process.exit(0) }
setTimeout(stop, lifetime)
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
