import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { nav } from '../data'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="header">
      <div className="wrap header-inner">
        <NavLink to="/" className="logo" end>
          weplus <span>ent</span>
        </NavLink>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="burger" />
          <span className="sr">{open ? '메뉴 닫기' : '메뉴 열기'}</span>
        </button>
        <nav id="site-nav" className={open ? 'nav open' : 'nav'} onClick={() => setOpen(false)}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'on' : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
