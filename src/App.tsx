import { useRoute } from './router.ts'
import { useProgress } from './store.ts'
import { findPattern, findProblem } from './content/index.ts'
import { Today } from './screens/Today.tsx'
import { PatternPage } from './screens/PatternPage.tsx'
import { ProblemPage } from './screens/ProblemPage.tsx'
import { Session } from './screens/Session.tsx'
import { Progress } from './screens/Progress.tsx'
import { Settings } from './screens/Settings.tsx'

const NAV = [
  { href: '#/', label: 'today', match: ['today', 'session'] },
  { href: '#/two-pointers', label: 'patterns', match: ['pattern', 'problem', 'drill'] },
  { href: '#/progress', label: 'progress', match: ['progress'] },
  { href: '#/settings', label: 'settings', match: ['settings'] },
]

export function App() {
  const route = useRoute()
  const store = useProgress()
  const { theme } = store.progress.settings

  return (
    <div className="shell">
      <header className="top">
        <a href="#/" className="brand">patterns</a>
        <nav>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} aria-current={item.match.includes(route.name) ? 'page' : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className="spacer" />
        <span className="date">{store.today}</span>
        <button
          className="theme-toggle"
          onClick={() =>
            store.setProgress((p) => ({
              ...p,
              settings: { ...p.settings, theme: p.settings.theme === 'light' ? 'dark' : 'light' },
            }))
          }
          aria-label={`switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? 'dark' : 'light'}
        </button>
      </header>

      <main>{render()}</main>
    </div>
  )

  function render() {
    switch (route.name) {
      case 'today':
        return <Today store={store} />
      case 'session':
        return <Session store={store} />
      case 'progress':
        return <Progress store={store} />
      case 'settings':
        return <Settings store={store} />
    }

    const pattern = findPattern(route.pattern)
    if (!pattern) return <NotFound what={route.pattern} />

    if (route.name === 'problem') {
      const problem = findProblem(route.pattern, route.problem)
      return problem ? (
        <ProblemPage pattern={pattern} problem={problem} store={store} />
      ) : (
        <NotFound what={route.problem} />
      )
    }

    return <PatternPage pattern={pattern} store={store} drill={route.name === 'drill'} />
  }
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="empty">
      Nothing here called “{what}”.
      <div style={{ marginTop: 'var(--s4)' }}>
        <a className="btn-ghost" href="#/">back to today</a>
      </div>
    </div>
  )
}
