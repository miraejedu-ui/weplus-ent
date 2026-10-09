import { createReadStream, existsSync, statSync } from 'node:fs'
import http from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { createApiMiddleware } from './apiPlugin.js'

const root = process.cwd()
const dist = resolve(root, 'dist')
const port = Number(process.env.PORT) || 4173
const api = createApiMiddleware(root)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
}

function serveStatic(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = resolve(dist, `.${pathname}`)
  const inside = file === dist || file.startsWith(dist + sep)
  if (inside && existsSync(file) && statSync(file).isFile()) {
    res.statusCode = 200
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
    createReadStream(file).pipe(res)
    return
  }
  const index = join(dist, 'index.html')
  if (!existsSync(index)) {
    res.statusCode = 500
    res.end('Build the site first.')
    return
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  createReadStream(index).pipe(res)
}

http.createServer((req, res) => {
  api(req, res, () => serveStatic(req, res))
}).listen(port, '0.0.0.0', () => {
  console.log(`weplus ent listening on ${port}`)
})
