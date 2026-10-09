import { Link, useParams } from 'react-router-dom'
import NotFound from './NotFound'
import { formatDate } from '../data'
import { useContent } from '../contentState'
import { media } from '../media'
import { useTitle } from '../useTitle'

export default function ArtistDetail() {
  const { artists, news } = useContent()
  const { id } = useParams()
  const artist = artists.find((item) => item.id === id)
  const related = news.filter((item) => item.artistId === id)
  useTitle(artist ? artist.name : 'Artist')

  if (!artist) return <NotFound />

  return (
    <div className="wrap page">
      <Link className="back" to="/artist">
        Artist
      </Link>
      <article className="profile">
        <div className="portrait" style={artist.image ? undefined : { background: artist.gradient, color: artist.ink }}>
          {artist.image ? <img src={media(artist.image)} alt="" /> : artist.name.slice(0, 1)}
        </div>
        <div>
          <h1>{artist.name}</h1>
          <span className="role">{artist.role}</span>
          <p>{artist.bio}</p>
          <div className="block">
            <h2>활동</h2>
            <ul>
              {artist.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
          {related.length > 0 ? (
            <div className="block">
              <h2>소식</h2>
              <ul className="related">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/news/${item.id}`}>
                      {formatDate(item.date)} {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}
