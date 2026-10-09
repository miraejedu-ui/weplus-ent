import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { home, company, artists, news, notices, audition, inquiryTypes, jobs } from '../src/data.js'

const COOKIE = 'weplus_admin'
const MAX_BODY = 8 * 1024 * 1024
const MAX_IMAGE = 5 * 1024 * 1024

const seed = { home, company, artists, news, notices, audition, inquiryTypes, jobs }

export function adminApi() {
  const middleware = createApiMiddleware(process.cwd())
  return {
    name: 'weplus-admin-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export function createApiMiddleware(root) {
  const dataDir = join(root, 'data')
  const contentPath = join(dataDir, 'content.json')
  const adminPath = join(dataDir, 'admin.json')
  const sessionPath = join(dataDir, 'sessions.json')
  const uploadDir = join(root, 'public', 'images', 'uploads')
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(uploadDir, { recursive: true })
  if (!existsSync(contentPath)) writeJson(contentPath, seed)

  const attempts = new Map()

  return async function api(req, res, next) {
    const url = new URL(req.url, 'http://127.0.0.1')
    if (!url.pathname.startsWith('/api/')) return next()

    try {
      if (req.method === 'GET' && url.pathname === '/api/content') {
        return send(res, 200, readJson(contentPath, seed))
      }
      if (req.method === 'GET' && url.pathname === '/api/me') {
        const admin = readAdmin(adminPath)
        const session = currentSession(req, sessionPath, admin)
        return send(res, 200, { ok: Boolean(session), email: session?.email || '' })
      }
      if (req.method === 'POST' && url.pathname === '/api/login') {
        return login(req, res, adminPath, sessionPath, attempts)
      }
      if (req.method === 'POST' && url.pathname === '/api/logout') {
        return logout(req, res, sessionPath)
      }
      if (req.method === 'PUT' && url.pathname === '/api/content') {
        if (!currentSession(req, sessionPath, readAdmin(adminPath))) {
          return send(res, 401, { message: '로그인이 필요합니다.' })
        }
        const body = await readBody(req)
        const data = JSON.parse(body.toString('utf8'))
        const saved = normalizeContent(data)
        writeJson(contentPath, saved)
        return send(res, 200, saved)
      }
      if (req.method === 'POST' && url.pathname === '/api/upload') {
        if (!currentSession(req, sessionPath, readAdmin(adminPath))) {
          return send(res, 401, { message: '로그인이 필요합니다.' })
        }
        const body = await readBody(req)
        const data = JSON.parse(body.toString('utf8'))
        const fileUrl = saveImage(uploadDir, data)
        return send(res, 200, { url: fileUrl })
      }
      return send(res, 404, { message: '없는 요청입니다.' })
    } catch (error) {
      const status = error.status || 500
      return send(res, status, { message: error.publicMessage || '요청을 처리하지 못했습니다.' })
    }
  }
}

async function login(req, res, adminPath, sessionPath, attempts) {
  const admin = readAdmin(adminPath)
  if (!admin) return send(res, 500, { message: '관리자 계정이 준비되지 않았습니다.' })

  const ip = req.socket.remoteAddress || 'local'
  const now = Date.now()
  const history = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000)
  if (history.length >= 8) {
    attempts.set(ip, history)
    return send(res, 429, { message: '시도 횟수가 많습니다. 잠시 후 다시 로그인하세요.' })
  }

  const body = JSON.parse((await readBody(req)).toString('utf8'))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const emailOk = email === String(admin.email || '').toLowerCase()
  const passwordOk = emailOk && verifyPassword(password, admin)
  if (!emailOk || !passwordOk) {
    history.push(now)
    attempts.set(ip, history)
    return send(res, 401, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  }

  attempts.delete(ip)
  const token = randomBytes(24).toString('hex')
  const sessions = readJson(sessionPath, {})
  sessions[token] = { email: admin.email, exp: now + 7 * 24 * 60 * 60 * 1000 }
  writeJson(sessionPath, sessions)
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; ${cookieBase()}; Max-Age=604800`)
  return send(res, 200, { ok: true, email: admin.email })
}

function logout(req, res, sessionPath) {
  const token = readCookie(req, COOKIE)
  const sessions = readJson(sessionPath, {})
  if (token) delete sessions[token]
  writeJson(sessionPath, sessions)
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieBase()}; Max-Age=0`)
  return send(res, 200, { ok: true })
}

function currentSession(req, sessionPath, admin) {
  if (!admin) return null
  const token = readCookie(req, COOKIE)
  if (!token) return null
  const sessions = readJson(sessionPath, {})
  const session = sessions[token]
  if (!session || session.exp < Date.now()) {
    if (session) {
      delete sessions[token]
      writeJson(sessionPath, sessions)
    }
    return null
  }
  return session
}

function readAdmin(adminPath) {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_SALT && process.env.ADMIN_HASH) {
    return {
      email: process.env.ADMIN_EMAIL,
      salt: process.env.ADMIN_SALT,
      hash: process.env.ADMIN_HASH,
    }
  }
  if (!existsSync(adminPath)) return null
  return readJson(adminPath, null)
}

function cookieBase() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `HttpOnly; SameSite=Lax; Path=/${secure}`
}

function verifyPassword(password, admin) {
  try {
    const salt = Buffer.from(admin.salt, 'hex')
    const actual = scryptSync(password, salt, 32)
    const expected = Buffer.from(admin.hash, 'hex')
    if (actual.length !== expected.length) return false
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

function saveImage(uploadDir, payload) {
  const raw = String(payload?.data || '')
  const match = raw.match(/^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/)
  if (!match) fail(400, 'jpg, png, webp, gif 사진만 올릴 수 있습니다.')
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > MAX_IMAGE) fail(400, '5MB 이하 사진만 올릴 수 있습니다.')
  const kind = sniff(bytes)
  if (!kind) fail(400, '이미지 파일을 확인하지 못했습니다.')
  const cleaned = basename(String(payload.filename || 'image'))
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/\.(jpe?g|png|webp|gif)$/i, '')
  const name = `${Date.now()}-${cleaned || 'image'}.${kind}`
  writeFileSync(join(uploadDir, name), bytes)
  return `/images/uploads/${name}`
}

function sniff(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (bytes.slice(0, 4).toString() === 'RIFF' && bytes.slice(8, 12).toString() === 'WEBP') return 'webp'
  if (bytes.slice(0, 3).toString() === 'GIF') return 'gif'
  return ''
}

function normalizeContent(data) {
  if (!data || typeof data !== 'object') fail(400, '내용을 확인하지 못했습니다.')
  const required = ['home', 'company', 'artists', 'news', 'notices', 'audition', 'inquiryTypes', 'jobs']
  if (required.some((key) => data[key] == null)) fail(400, '내용 항목이 빠졌습니다.')
  if (!Array.isArray(data.artists) || !Array.isArray(data.news) || !Array.isArray(data.notices) || !Array.isArray(data.jobs)) {
    fail(400, '목록 형식이 올바르지 않습니다.')
  }
  return {
    home: data.home,
    company: data.company,
    artists: data.artists,
    news: data.news,
    notices: data.notices,
    audition: data.audition,
    inquiryTypes: data.inquiryTypes,
    jobs: data.jobs,
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('too large'), { status: 413, publicMessage: '파일이 너무 큽니다.' }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function readCookie(req, name) {
  const source = req.headers.cookie || ''
  const found = source.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return found ? decodeURIComponent(found.slice(name.length + 1)) : ''
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2))
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function fail(status, publicMessage) {
  throw Object.assign(new Error(publicMessage), { status, publicMessage })
}
