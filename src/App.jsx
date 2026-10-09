import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ContentProvider } from './contentState'
import Home from './pages/Home'
import About from './pages/About'
import ArtistList from './pages/ArtistList'
import ArtistDetail from './pages/ArtistDetail'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import Audition from './pages/Audition'
import Contact from './pages/Contact'
import Recruit from './pages/Recruit'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={base}>
      <ContentProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="artist" element={<ArtistList />} />
          <Route path="artist/:id" element={<ArtistDetail />} />
          <Route path="news" element={<PostList kind="news" />} />
          <Route path="news/:id" element={<PostDetail kind="news" />} />
          <Route path="notice" element={<PostList kind="notice" />} />
          <Route path="notice/:id" element={<PostDetail kind="notice" />} />
          <Route path="audition" element={<Audition />} />
          <Route path="contact" element={<Contact />} />
          <Route path="recruit" element={<Recruit />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </ContentProvider>
    </BrowserRouter>
  )
}
