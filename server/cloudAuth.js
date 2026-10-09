import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'

const COOKIE = 'weplus_admin'
const WEEK = 7 * 24 * 60 * 60

export function readAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_SALT || !process.env.ADMIN_HASH) return null
  return {
    email: process.env.ADMIN_EMAIL,
    salt: process.env.ADMIN_SALT,
    hash: process.env.ADMIN_HASH,
  }
}

export function verifyPassword(password, admin) {
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

export function sessionEmail(req) {
  const token = readCookie(req, COOKIE)
  const secret = process.env.SESSION_SECRET
  if (!token || !secret) return ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return ''
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length) return ''
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return ''
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.email || Number(data.exp) < Date.now()) return ''
    return data.email
  } catch {
    return ''
  }
}

export function setSessionCookie(res, email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + WEEK * 1000 })).toString('base64url')
  const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url')
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${signature}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=${WEEK}`)
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=0`)
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body) return JSON.parse(req.body)
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

function readCookie(req, name) {
  const source = req.headers.cookie || ''
  const found = source.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return found ? decodeURIComponent(found.slice(name.length + 1)) : ''
}
