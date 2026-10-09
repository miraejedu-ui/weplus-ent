import { sessionEmail } from '../server/cloudAuth.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: '확인할 수 없는 요청입니다.' })
    return
  }
  const email = sessionEmail(req)
  res.status(200).json({ ok: Boolean(email), email })
}
