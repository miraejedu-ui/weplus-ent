import { Link } from 'react-router-dom'
import { byDateDesc, formatDate } from '../data'
import { useContent } from '../contentState'
import { media } from '../media'
import { useTitle } from '../useTitle'

export default function Home() {
  const { artists, company, home, news, notices } = useContent()
  useTitle()
  const latestNews = byDateDesc(news).slice(0, 3)
  const latestNotices = byDateDesc(notices).slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>
              함께하면
              <br />
              더 빛나는 우리
            </h1>
            <p>{company.summary}</p>
            <Link className="btn" to="/audition">
              Audition 지원하기
            </Link>
          </div>
          <Photo src={home.heroImage} alt="" className="hero-photo" />
        </div>
      </section>

      <section className="home-block">
        <div className="wrap">
          <article className="about-box">
            <div>
              <h2>About</h2>
              <p>{company.about}</p>
              <Link className="link" to="/about">
                자세히 보기
              </Link>
            </div>
            <Photo src={home.aboutImage} alt="" className="about-photo" />
          </article>
        </div>
      </section>

      <section className="home-block">
        <div className="wrap">
          <div className="section-head">
            <h2>Artist</h2>
            <Link className="link" to="/artist">
              전체 보기
            </Link>
          </div>
          {artists.length === 0 ? (
            <p className="empty">등록된 아티스트가 없습니다.</p>
          ) : (
            <div className="artist-row">
              {artists.map((artist) => (
                <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-line">
                  <Photo src={artist.image} alt="" className="artist-thumb" />
                  <span>
                    <strong>{artist.name}</strong>
                    <span className="role">{artist.role}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-block">
        <div className="wrap">
          <div className="section-head">
            <h2>News</h2>
            <Link className="link" to="/news">
              전체 보기
            </Link>
          </div>
          <PostPreview items={latestNews} base="/news" empty="등록된 소식이 없습니다." />
        </div>
      </section>

      <section className="home-block home-last">
        <div className="wrap">
          <div className="section-head">
            <h2>Notice</h2>
            <Link className="link" to="/notice">
              전체 보기
            </Link>
          </div>
          <PostPreview items={latestNotices} base="/notice" empty="등록된 공지가 없습니다." />
        </div>
      </section>
    </>
  )
}

function Photo({ src, alt, className }) {
  if (!src) return <div className={`photo-slot ${className}`} />
  return <img className={className} src={media(src)} alt={alt} />
}

function PostPreview({ items, base, empty }) {
  if (items.length === 0) return <p className="empty">{empty}</p>

  return (
    <div className="home-list">
      {items.map((item) => (
        <Link key={item.id} to={`${base}/${item.id}`} className="home-item">
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          <span>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
          </span>
        </Link>
      ))}
    </div>
  )
}
