import { LADDER, addDays, isDue, streak } from '../srs.ts'
import type { Store } from '../store.ts'
import { allCardIds, cardHref, cardLabel, drillCard, patterns, problemCard } from '../content/index.ts'

const MINUTES_PER_CARD = 3

export function Today({ store }: { store: Store }) {
  const { progress, today } = store
  const ids = allCardIds()
  const seen = ids.filter((id) => progress.cards[id])
  const due = seen.filter((id) => isDue(progress.cards[id], today))
  const fresh = ids.filter((id) => !progress.cards[id])

  return (
    <>
      <section className="section">
        <div className="lab">due today</div>
        {due.length > 0 ? (
          <div className="hero">
            <div className="big num">{due.length}</div>
            <div className="sub">
              <div>{breakdown(due)}</div>
              <div className="under">
                est. {due.length * MINUTES_PER_CARD} min
                {lastSession(progress.sessions, today)}
              </div>
            </div>
            <a className="btn push" href={cardHref(due[0])}>START REVIEW →</a>
          </div>
        ) : fresh.length === ids.length ? (
          <div className="hero">
            <div className="big num">{fresh.length}</div>
            <div className="sub">
              <div>nothing learned yet — {fresh.length} cards waiting</div>
              <div className="under">start with the two-pointers template, everything else builds on it</div>
            </div>
            <a className="btn push" href="#/two-pointers">START LEARNING →</a>
          </div>
        ) : (
          <div className="hero">
            <div className="big num ok" style={{ color: 'var(--ok)' }}>0</div>
            <div className="sub">
              <div>nothing due. come back tomorrow.</div>
              <div className="under">
                {fresh.length > 0
                  ? `${fresh.length} cards not started yet, if you want more`
                  : 'next card is due ' + nextDue(store)}
              </div>
            </div>
            {fresh.length > 0 && (
              <a className="btn-ghost push" href={cardHref(fresh[0])}>learn something new</a>
            )}
          </div>
        )}
      </section>

      <div className="cols">
        <section>
          <div className="lab">patterns</div>
          {patterns.map((p) => {
            const m = mastery(store, p.id)
            return (
              <a className="row" key={p.id} href={`#/${p.id}`}>
                <span className="name">{p.id.replace('-', '_')}</span>
                <span className="bar"><i style={{ width: `${Math.round(m * 100)}%` }} /></span>
                <span className="pct num">{Math.round(m * 100)}%</span>
              </a>
            )
          })}
        </section>

        <section>
          <div className="lab">last 30 days</div>
          <div className="dots">
            {last30(progress.sessions, today).map((state, i) => (
              <s key={i} className={state} />
            ))}
          </div>
          <div className="row" style={{ borderBottom: 0, paddingTop: 'var(--s3)' }}>
            <span className="meta">
              streak <b className="accent num">{streak(progress.sessions, today)}</b> days · active{' '}
              <b className="accent num">{progress.sessions.length}</b> days total
            </span>
          </div>
        </section>

        <section>
          <div className="lab">weakest recall</div>
          {weakest(store).length === 0 ? (
            <div className="meta faint">no misses yet — nothing has been forgotten.</div>
          ) : (
            weakest(store).map(({ id, forgot, step }) => (
              <a className="row" key={id} href={cardHref(id)}>
                <span className="name" style={{ fontSize: 12.5 }}>{cardLabel(id)}</span>
                <span className="meta warn">{forgot > 0 ? `forgot ×${forgot}` : step === 0 ? 'unlearned' : 'shaky'}</span>
              </a>
            ))
          )}
        </section>
      </div>
    </>
  )
}

function breakdown(due: string[]): string {
  const counts = new Map<string, number>()
  for (const id of due) {
    const name = patterns.find((p) => p.id === id.split('/')[0])?.name.toLowerCase() ?? id
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts].map(([name, n]) => `${n} ${name}`).join(' · ')
}

function lastSession(sessions: string[], today: string): string {
  const previous = sessions.filter((d) => d < today).sort().pop()
  if (!previous) return ''
  const days = Math.round((Date.parse(today) - Date.parse(previous)) / 86_400_000)
  return ` · last session ${days === 1 ? 'yesterday' : `${days} days ago`}`
}

function nextDue(store: Store): string {
  const dates = Object.values(store.progress.cards).map((c) => c.due).sort()
  return dates[0] ?? 'never'
}

/** Mean ladder position across every card in a pattern, unseen counting as zero. */
function mastery(store: Store, patternId: string): number {
  const pattern = patterns.find((p) => p.id === patternId)
  if (!pattern) return 0
  const ids = [drillCard(patternId), ...pattern.problems.map((q) => problemCard(patternId, q.id))]
  const total = ids.reduce((sum, id) => sum + (store.progress.cards[id]?.step ?? 0), 0)
  return total / (ids.length * (LADDER.length - 1))
}

function last30(sessions: string[], today: string): string[] {
  const days = new Set(sessions)
  return Array.from({ length: 30 }, (_, i) => (days.has(addDays(today, i - 29)) ? 'on' : ''))
}

function weakest(store: Store) {
  return Object.values(store.progress.cards)
    .map((c) => ({ id: c.id, step: c.step, forgot: c.history.filter((h) => h.grade === 'forgot').length }))
    .filter((c) => c.forgot > 0 || c.step <= 1)
    .sort((a, b) => b.forgot - a.forgot || a.step - b.step)
    .slice(0, 4)
}
