import { useRoute } from './router.ts'
import { useProgress } from './store.ts'
import { findPattern, findProblem } from './content/index.ts'
import { Today } from './screens/Today.tsx'
import { PatternPage } from './screens/PatternPage.tsx'
import { ProblemPage } from './screens/ProblemPage.tsx'

export function App() {
  const route = useRoute()
  const store = useProgress()

  return (
    <div className="shell">
      <header className="top">
        <a href="#/" className="brand">patterns</a>
        <nav>
          <a href="#/" aria-current={route.name === 'today' ? 'page' : undefined}>today</a>
          <a href="#/two-pointers" aria-current={route.name !== 'today' ? 'page' : undefined}>patterns</a>
        </nav>
        <span className="spacer" />
        <span className="date">{store.today.toUpperCase()}</span>
      </header>

      <main>{render()}</main>
    </div>
  )

  function render() {
    if (route.name === 'today') return <Today store={store} />

    const pattern = findPattern(route.pattern)
    if (!pattern) return <NotFound what={route.pattern} />

    if (route.name === 'problem') {
      const problem = findProblem(route.pattern, route.problem)
      if (!problem) return <NotFound what={route.problem} />
      return <ProblemPage pattern={pattern} problem={problem} store={store} />
    }

    if (route.name === 'drill') return <PatternPage pattern={pattern} store={store} drill />
    return <PatternPage pattern={pattern} store={store} />
  }
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="empty">
      Nothing here called “{what}”.
      <div style={{ marginTop: 16 }}>
        <a className="btn-ghost" href="#/">back to today</a>
      </div>
    </div>
  )
}
