import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { useContent } from '../contentState'
import { media } from '../media'
import { useTitle } from '../useTitle'

export default function ArtistList() {
  const { artists } = useContent()
  useTitle('Artist')

  return (
    <div className="wrap page">
      <PageHead eyebrow="Artist" title="아티스트" desc="위플러스엔트와 함께하는 사람들입니다." />
      {artists.length === 0 ? (
        <p className="empty">등록된 아티스트가 없습니다.</p>
      ) : (
        <div className="artist-grid">
          {artists.map((artist) => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-card">
              <div className="portrait" style={artist.image ? undefined : { background: artist.gradient, color: artist.ink }}>
                {artist.image ? <img src={media(artist.image)} alt="" /> : artist.name.slice(0, 1)}
              </div>
              <div className="meta">
                <strong>{artist.name}</strong>
                <span className="role">{artist.role}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
