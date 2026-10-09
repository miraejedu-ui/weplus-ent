import { createRequire } from 'node:module'
import { head, put } from '@vercel/blob'

const require = createRequire(import.meta.url)
const seed = require('../data/content.json')

const CONTENT_PATH = 'site/content.json'

export function loadSeed() {
  return seed
}

export async function readContent() {
  try {
    const blob = await head(CONTENT_PATH)
    const response = await fetch(blob.url)
    if (!response.ok) return loadSeed()
    return await response.json()
  } catch {
    return loadSeed()
  }
}

export async function writeContent(data) {
  await put(CONTENT_PATH, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function saveImage(payload) {
  const raw = String(payload?.data || '')
  const match = raw.match(/^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/)
  if (!match) fail(400, 'jpg, png, webp, gif 사진만 올릴 수 있습니다.')
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) fail(400, '4MB 이하 사진만 올릴 수 있습니다.')
  const kind = sniff(bytes)
  if (!kind) fail(400, '이미지 파일을 확인하지 못했습니다.')
  const cleaned = String(payload.filename || 'image')
    .split(/[/\\]/)
    .pop()
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/\.(jpe?g|png|webp|gif)$/i, '')
  const name = `${Date.now()}-${cleaned || 'image'}.${kind}`
  const blob = await put(`site/images/${name}`, bytes, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: contentType(kind),
  })
  return blob.url
}

function contentType(kind) {
  if (kind === 'jpg') return 'image/jpeg'
  if (kind === 'png') return 'image/png'
  if (kind === 'webp') return 'image/webp'
  return 'image/gif'
}

function sniff(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (bytes.slice(0, 4).toString() === 'RIFF' && bytes.slice(8, 12).toString() === 'WEBP') return 'webp'
  if (bytes.slice(0, 3).toString() === 'GIF') return 'gif'
  return ''
}

function fail(status, message) {
  throw Object.assign(new Error(message), { status, publicMessage: message })
}
