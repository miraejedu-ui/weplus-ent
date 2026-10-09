import { sessionEmail } from '../server/cloudAuth.js'
import { readContent, writeContent } from '../server/cloudStore.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      res.status(200).json(await readContent())
      return
    }
    if (req.method === 'PUT') {
      if (!sessionEmail(req)) {
        res.status(401).json({ message: '로그인이 필요합니다.' })
        return
      }
      const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(await readRaw(req))
      const saved = normalize(body)
      await writeContent(saved)
      res.status(200).json(saved)
      return
    }
    res.status(405).json({ message: '처리할 수 없는 요청입니다.' })
  } catch (error) {
    res.status(error.status || 500).json({ message: error.publicMessage || '내용을 저장하지 못했습니다.' })
  }
}

function normalize(data) {
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

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function fail(status, publicMessage) {
  throw Object.assign(new Error(publicMessage), { status, publicMessage })
}
