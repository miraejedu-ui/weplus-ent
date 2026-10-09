import { readAdmin, readJsonBody, setSessionCookie, verifyPassword } from '../server/cloudAuth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: '로그인 요청이 아닙니다.' })
  try {
    const admin = readAdmin()
    if (!admin) return json(res, 500, { message: '관리자 계정이 준비되지 않았습니다.' })
    const body = await readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const matches = email === String(admin.email).toLowerCase() && verifyPassword(password, admin)
    if (!matches) return json(res, 401, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
    setSessionCookie(res, admin.email)
    return json(res, 200, { ok: true, email: admin.email })
  } catch {
    return json(res, 400, { message: '로그인 내용을 확인하지 못했습니다.' })
  }
}

function json(res, status, data) {
  res.status(status).json(data)
}
