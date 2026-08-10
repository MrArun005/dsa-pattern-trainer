import { LADDER, addDays, daysBetween, longestStreak, recallRate, streak } from '../srs.ts'
import type { CardState } from '../srs.ts'
import type { Store } from '../store.ts'
import { drillCard, patterns, problemCard } from '../content/index.ts'

const HEAT_DAYS = 182

export function Progress({ store }: { store: Store }) {
  const { progress, today } = store
  const cards = Object.values(progress.cards)
  const reviews = cards.flatMap((c) => c.history)

  if (reviews.length === 0)
    return (
      <div className="empty">
        Nothing measured yet. Do a few reviews and this screen starts answering the only question
        that matters — whether any of it is sticking.
        <div style={{ marginTop: 'var(--s4)' }}>
          <a className="btn-ghost" href="#/">back to today</a>
        </div>
      </div>
    )

  return (
    <>
      <section className="section">
        <div className="lab">progress</div>
        <h1>{Math.round(recallRate(cards) * 100)}% of your reviews came back solid.</h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>
          Across {reviews.length} reviews of {cards.length} cards. This is the number to watch — if it
          climbs while the intervals get longer, retention is genuinely improving rather than you just
          seeing things more often.
        </p>
      </section>

      <div className="stats">
        <Stat label="current streak" value={`${streak(progress.sessions, today)} days`} />
        <Stat label="longest streak" value={`${longestStreak(progress.sessions)} days`} />
        <Stat label="days practised" value={`${progress.sessions.length}`} />
        <Stat label="reviews logged" value={`${reviews.length}`} />
      </div>

      <div className="rule" />

      <section className="section">
        <div className="lab">where each pattern stands</div>
        <table className="grid">
          <thead>
            <tr>
              <th>pattern</th>
              <th>started</th>
              <th>mastery</th>
              <th>solid rate</th>
              <th>next due</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((p) => {
              const ids = [drillCard(p.id), ...p.problems.map((q) => problemCard(p.id, q.id))]
              const own = ids.map((id) => progress.cards[id]).filter(Boolean) as CardState[]
              const steps = ids.reduce((s, id) => s + (progress.cards[id]?.step ?? 0), 0)
              const next = own.map((c) => c.due).sort()[0]
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="num">{own.length} / {ids.length}</td>
                  <td className="num">{Math.round((steps / (ids.length * (LADDER.length - 1))) * 100)}%</td>
                  <td className="num">{own.length ? `${Math.round(recallRate(own) * 100)}%` : '—'}</td>
                  <td className="num">{next ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="section">
        <div className="lab">your measured forgetting curve</div>
        <p className="prose" style={{ marginBottom: 'var(--s5)' }}>
          How often a card came back solid, grouped by how long it had been since you last saw it. A
          bucket that collapses is the ladder pushing you too far, too fast — and that is a setting to
          change, not a verdict on you.
        </p>
        <Curve cards={cards} />
      </section>

      <section className="section">
        <div className="lab">last {HEAT_DAYS} days</div>
        <div className="heat">
          {Array.from({ length: HEAT_DAYS }, (_, i) => {
            const day = addDays(today, i - (HEAT_DAYS - 1))
            return <s key={day} className={progress.sessions.includes(day) ? 'on' : ''} />
          })}
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="lab">{label}</div>
      <div className="num" style={{ font: '400 34px/1 var(--serif)' }}>{value}</div>
    </div>
  )
}

const BUCKETS = [
  { label: 'same day', max: 0 },
  { label: '1 day', max: 1 },
  { label: '2–3 days', max: 3 },
  { label: '4–7 days', max: 7 },
  { label: '8–16 days', max: 16 },
  { label: '17–35 days', max: 35 },
  { label: '35+ days', max: Infinity },
]

function Curve({ cards }: { cards: CardState[] }) {
  const buckets = BUCKETS.map(() => ({ solid: 0, total: 0 }))

  for (const card of cards) {
    for (let i = 1; i < card.history.length; i++) {
      const gap = daysBetween(card.history[i - 1].date, card.history[i].date)
      const at = BUCKETS.findIndex((b) => gap <= b.max)
      const bucket = buckets[at === -1 ? buckets.length - 1 : at]
      bucket.total++
      if (card.history[i].grade === 'solid') bucket.solid++
    }
  }

  const measured = buckets.some((b) => b.total > 0)
  if (!measured)
    return (
      <div className="meta faint">
        Needs at least two reviews of the same card before there is a gap to measure. Come back after
        a few days.
      </div>
    )

  return (
    <>
      <div className="curve">
        {buckets.map((b, i) => (
          <s
            key={i}
            className={b.total > 0 ? 'hi' : ''}
            style={{ height: b.total ? `${Math.max(3, (b.solid / b.total) * 100)}%` : '2px' }}
            title={`${BUCKETS[i].label}: ${b.solid}/${b.total} solid`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 'var(--s2)' }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ flex: 1, fontSize: 10.5, color: 'var(--faint)', textAlign: 'center' }}>
            {b.total ? `${Math.round((b.solid / b.total) * 100)}%` : '—'}
            <div style={{ marginTop: 2 }}>{BUCKETS[i].label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
