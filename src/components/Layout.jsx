import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="layout">
      <a className="skip" href="#content">
        본문으로
      </a>
      <Header />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
