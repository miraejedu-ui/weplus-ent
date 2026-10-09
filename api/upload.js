import { sessionEmail, readJsonBody } from '../server/cloudAuth.js'
import { saveImage } from '../server/cloudStore.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: '업로드 요청이 아닙니다.' })
    return
  }
  if (!sessionEmail(req)) {
    res.status(401).json({ message: '로그인이 필요합니다.' })
    return
  }
  try {
    const body = await readJsonBody(req)
    const url = await saveImage(body)
    res.status(200).json({ url })
  } catch (error) {
    res.status(error.status || 500).json({ message: error.publicMessage || '사진을 올리지 못했습니다.' })
  }
}
