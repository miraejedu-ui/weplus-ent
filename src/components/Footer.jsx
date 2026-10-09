import { Link } from 'react-router-dom'
import { nav } from '../data'
import { useContent } from '../contentState'

export default function Footer() {
  const { company } = useContent()
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link to="/" className="logo">
            weplus <span>ent</span>
          </Link>
          <p className="tag">{company.tagline}</p>
        </div>
        <div>
          <h2>Menu</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <ul>
            <li>
              <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
            </li>
            <li>{company.contact.phone}</li>
            <li>{company.contact.address}</li>
          </ul>
        </div>
      </div>
      <div className="wrap legal">
        <span>© 2026 {company.name}</span>
        <Link to="/admin">Admin</Link>
      </div>
    </footer>
  )
}
