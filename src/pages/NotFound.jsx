import { Link } from 'react-router-dom'
import { useTitle } from '../useTitle'

export default function NotFound() {
  useTitle('페이지를 찾을 수 없습니다')

  return (
    <div className="wrap page">
      <header className="page-head">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="lede">주소가 바뀌었거나, 아직 없는 페이지입니다.</p>
      </header>
      <Link className="btn" to="/">
        홈으로
      </Link>
    </div>
  )
}
