import { useEffect } from 'react'

export function useTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} · weplus ent` : 'weplus ent'
  }, [page])
}
