import { useEffect, useState } from 'react'

// ponytail: hash routing in a dozen lines. Four routes don't need a router.
export type Route =
  | { name: 'today' }
  | { name: 'pattern'; pattern: string }
  | { name: 'problem'; pattern: string; problem: string }
  | { name: 'drill'; pattern: string }

export function parse(hash: string): Route {
  const [pattern, second, third] = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!pattern) return { name: 'today' }
  if (second === 'drill') return { name: 'drill', pattern }
  if (second === 'p' && third) return { name: 'problem', pattern, problem: third }
  return { name: 'pattern', pattern }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(location.hash))
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const go = (path: string) => {
  location.hash = path
}
