import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import saved from '../data/content.json'
import { artists, audition, company, home, inquiryTypes, jobs, news, notices } from './data'

const fallback = saved?.home
  ? saved
  : { home, company, artists, news, notices, audition, inquiryTypes, jobs }

const ContentContext = createContext({ ...fallback, loaded: false, reload: async () => {} })

export function ContentProvider({ children }) {
  const [content, setContent] = useState(fallback)
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    const response = await fetch('/api/content')
    if (!response.ok) return
    setContent(await response.json())
  }, [])

  useEffect(() => {
    reload().finally(() => setLoaded(true))
  }, [reload])

  return <ContentContext.Provider value={{ ...content, loaded, reload }}>{children}</ContentContext.Provider>
}

export function useContent() {
  return useContext(ContentContext)
}
