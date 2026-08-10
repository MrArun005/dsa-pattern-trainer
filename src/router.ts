import { useEffect, useState } from 'react'

// ponytail: hash routing in a dozen lines. Four routes don't need a router.
export type Route =
  | { name: 'today' }
  | { name: 'session' }
  | { name: 'progress' }
  | { name: 'settings' }
  | { name: 'pattern'; pattern: string }
  | { name: 'problem'; pattern: string; problem: string }
  | { name: 'drill'; pattern: string }

export function parse(hash: string): Route {
  const [first, second, third] = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!first) return { name: 'today' }
  if (first === 'session') return { name: 'session' }
  if (first === 'progress') return { name: 'progress' }
  if (first === 'settings') return { name: 'settings' }
  if (second === 'drill') return { name: 'drill', pattern: first }
  if (second === 'p' && third) return { name: 'problem', pattern: first, problem: third }
  return { name: 'pattern', pattern: first }
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
