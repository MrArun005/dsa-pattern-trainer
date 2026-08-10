import { useState } from 'react'
import { LADDER } from '../srs.ts'
import type { Store } from '../store.ts'
import type { Lang } from '../runner/types.ts'
import { LangTabs } from './LangTabs.tsx'

export function Settings({ store }: { store: Store }) {
  const { settings } = store.progress
  const [confirming, setConfirming] = useState(false)

  const set = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) =>
    store.setProgress((p) => ({ ...p, settings: { ...p.settings, [key]: value } }))

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(store.progress, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `patterns-progress-${store.today}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <section className="section">
        <div className="lab">settings</div>
        <h1>Settings</h1>
      </section>

      <div className="cols-2">
        <section>
          <div className="row">
            <span className="name">theme</span>
            <div className="tabs">
              {(['light', 'dark'] as const).map((t) => (
                <button key={t} aria-pressed={settings.theme === t} onClick={() => set('theme', t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="row">
            <span className="name">default language</span>
            <LangTabs lang={settings.lang} setLang={(l: Lang) => set('lang', l)} />
          </div>

          <div className="row">
            <span className="name">daily target</span>
            <input
              className="editor"
              style={{ minHeight: 0, width: 90, padding: '8px 12px', textAlign: 'right' }}
              type="number"
              min={1}
              max={50}
              value={settings.dailyTarget}
              onChange={(e) => set('dailyTarget', Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            />
          </div>
        </section>

        <section>
          <div className="lab">the interval ladder</div>
          <p className="prose">
            After each recall: solid moves you one step up, shaky repeats the step, and forgetting drops
            you two steps and brings the card back the same day.
          </p>
          <pre className="code" style={{ marginTop: 'var(--s4)' }}>
            {LADDER.map((d, i) => `step ${i}  →  ${d} day${d === 1 ? '' : 's'}`).join('\n')}
          </pre>
          <p className="prose" style={{ marginTop: 'var(--s4)' }}>
            Fixed on purpose. If the Progress screen shows a bucket collapsing, the ladder is wrong for
            you and it is worth changing — but change it on evidence, not on a bad day.
          </p>
        </section>
      </div>

      <div className="rule" />

      <section className="section">
        <div className="lab">your data</div>
        <p className="prose">
          Everything lives in this browser's localStorage. Nothing is uploaded anywhere, which also
          means clearing site data wipes it — so export occasionally if the streak matters to you.
        </p>
        <div className="btn-row" style={{ marginTop: 'var(--s4)' }}>
          <button className="btn-ghost" onClick={exportJson}>export json</button>
          {!confirming ? (
            <button className="btn-ghost" onClick={() => setConfirming(true)}>reset everything</button>
          ) : (
            <>
              <button
                className="btn"
                onClick={() => {
                  store.setProgress((p) => ({ cards: {}, sessions: [], settings: p.settings }))
                  setConfirming(false)
                }}
              >
                yes, delete all progress
              </button>
              <button className="btn-ghost" onClick={() => setConfirming(false)}>cancel</button>
              <span className="meta warn">
                {Object.keys(store.progress.cards).length} cards and {store.progress.sessions.length} days
                of history. This cannot be undone.
              </span>
            </>
          )}
        </div>
      </section>
    </>
  )
}
