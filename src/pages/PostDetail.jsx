import { Link, useParams } from 'react-router-dom'
import NotFound from './NotFound'
import { formatDate } from '../data'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function PostDetail({ kind }) {
  const { news, notices } = useContent()
  const { id } = useParams()
  const kinds = {
    news: { menu: 'News', items: news, base: '/news' },
    notice: { menu: 'Notice', items: notices, base: '/notice' },
  }
  const meta = kinds[kind]
  const post = meta.items.find((item) => item.id === id)
  useTitle(post ? post.title : meta.menu)

  if (!post) return <NotFound />

  return (
    <div className="wrap page">
      <article className="article">
        <Link className="back" to={meta.base}>
          {meta.menu}
        </Link>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <h1>{post.title}</h1>
        {(post.body || []).map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </article>
    </div>
  )
}
