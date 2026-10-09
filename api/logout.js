import { clearSessionCookie } from '../server/cloudAuth.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: '로그아웃 요청이 아닙니다.' })
    return
  }
  clearSessionCookie(res)
  res.status(200).json({ ok: true })
}
