import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { byDateDesc, formatDate } from '../data'
import { useContent } from '../contentState'
import { useTitle } from '../useTitle'

export default function PostList({ kind }) {
  const { news, notices } = useContent()
  const kinds = {
    news: {
      menu: 'News',
      title: '뉴스',
      desc: '아티스트 활동과 보도 소식입니다.',
      items: news,
      base: '/news',
      empty: '등록된 소식이 없습니다.',
    },
    notice: {
      menu: 'Notice',
      title: '공지',
      desc: '회사에서 전하는 공식 안내입니다.',
      items: notices,
      base: '/notice',
      empty: '등록된 공지가 없습니다.',
    },
  }
  const meta = kinds[kind]
  useTitle(meta.menu)
  const items = byDateDesc(meta.items)

  return (
    <div className="wrap page">
      <PageHead eyebrow={meta.menu} title={meta.title} desc={meta.desc} />
      {items.length === 0 ? (
        <p className="empty">{meta.empty}</p>
      ) : (
        <div className="post-list">
          {items.map((item) => (
            <Link key={item.id} to={`${meta.base}/${item.id}`} className="post-item">
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              <span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
