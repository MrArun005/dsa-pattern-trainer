import { useEffect, useState } from 'react'
import type { Grade } from '../srs.ts'
import { LADDER, isDue } from '../srs.ts'
import type { Store } from '../store.ts'
import { allCardIds, cardHref, cardLabel, findPattern, findProblem } from '../content/index.ts'
import { go } from '../router.ts'
import { useLang } from './PatternPage.tsx'
import { tabInserts } from './editor.ts'

type Done = { id: string; grade: Grade }

export function Session({ store }: { store: Store }) {
  const [lang] = useLang(store)
  // Frozen at mount: grading a card changes its due date, and a live queue
  // would reshuffle under him mid-session.
  const [queue] = useState(() =>
    allCardIds().filter((id) => store.progress.cards[id] && isDue(store.progress.cards[id], store.today)),
  )
  const [at, setAt] = useState(0)
  const [done, setDone] = useState<Done[]>([])
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)

  const id = queue[at]

  const submit = (grade: Grade) => {
    store.grade(id, grade, id.endsWith('/template') ? answer.trim() || undefined : undefined)
    setDone((d) => [...d, { id, grade }])
    setAnswer('')
    setRevealed(false)
    setAt((n) => n + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return go('#/')
      if (!id) return
      if (!revealed && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) return setRevealed(true)
      if (!revealed) return
      if (e.key === '1') submit('forgot')
      if (e.key === '2') submit('shaky')
      if (e.key === '3') submit('solid')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  if (queue.length === 0)
    return (
      <div className="empty">
        Nothing is due, so there is no session to run.
        <div style={{ marginTop: 'var(--s4)' }}>
          <a className="btn-ghost" href="#/">back to today</a>
        </div>
      </div>
    )

  if (!id) return <Summary done={done} store={store} />

  const [patternId, second] = id.split('/')
  const pattern = findPattern(patternId)!
  const problem = second === 'template' ? null : findProblem(patternId, second)

  return (
    <>
      <div className="progress-track">
        <i style={{ width: `${(at / queue.length) * 100}%` }} />
      </div>

      <section className="section">
        <div className="lab">
          card {at + 1} of {queue.length} · {pattern.name} · esc to leave, nothing is lost
        </div>
        <h1>{problem ? problem.title : `Write the ${pattern.name} template from memory.`}</h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>
          {problem
            ? 'From memory: what is the approach, and what does the code look like? Sketch it — you are testing recall, not compiling.'
            : 'No reference. Getting it wrong and then seeing it is what builds the memory.'}
        </p>
      </section>

      <section className="section">
        <div className="lab">{problem ? 'your approach' : 'from blank'}</div>
        <textarea
          className="editor"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={tabInserts(setAnswer)}
          placeholder={lang === 'py' ? '# from memory' : '// from memory'}
          spellCheck={false}
          autoFocus
        />
      </section>

      {!revealed ? (
        <div className="btn-row">
          <button className="btn" onClick={() => setRevealed(true)}>REVEAL  ⌘↵</button>
          <span className="meta">answer first, even badly. reading it now teaches nothing.</span>
        </div>
      ) : (
        <>
          <div className="rule" />
          <div className="cols-2">
            <section>
              <div className="lab">{problem ? 'reference solution' : 'the actual template'}</div>
              <pre className="code">{problem ? problem.solution[lang] : pattern.template[lang]}</pre>
            </section>
            <section>
              <div className="lab">the idea in one sentence</div>
              <p className="prose">{problem ? problem.trick : pattern.trigger}</p>
              {!problem && store.card(id).sentence && (
                <>
                  <div className="lab" style={{ marginTop: 'var(--s5)' }}>your sentence last time</div>
                  <p className="prose">“{store.card(id).sentence}”</p>
                </>
              )}
              {problem && (
                <div style={{ marginTop: 'var(--s4)' }}>
                  <a className="btn-ghost" href={cardHref(id)}>open it properly and run the tests</a>
                </div>
              )}
            </section>
          </div>

          <div className="rule" />
          <section>
            <div className="lab">how did that go? this sets when it comes back</div>
            <div className="btn-row">
              <button className="btn-ghost" onClick={() => submit('forgot')}>1 · forgot</button>
              <button className="btn-ghost" onClick={() => submit('shaky')}>2 · shaky</button>
              <button className="btn" onClick={() => submit('solid')}>3 · solid</button>
            </div>
          </section>
        </>
      )}
    </>
  )
}

function Summary({ done, store }: { done: Done[]; store: Store }) {
  const count = (g: Grade) => done.filter((d) => d.grade === g).length

  return (
    <>
      <section className="section">
        <div className="lab">session complete</div>
        <h1>
          {count('solid')} solid, {count('shaky')} shaky, {count('forgot')} forgotten.
        </h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>
          {count('forgot') === 0
            ? 'Nothing was lost this round. The intervals just got longer, which is the whole point — you should be seeing these less often over time.'
            : `The ${count('forgot')} you forgot come back today. That is not a setback — recalling something after failing to is exactly what moves it into long-term memory.`}
        </p>
      </section>

      <section className="section">
        <div className="lab">what you saw</div>
        {done.map(({ id, grade }) => (
          <a className="row" key={id} href={cardHref(id)}>
            <span className="name">{cardLabel(id)}</span>
            <span className={`pill ${grade === 'solid' ? 'ok' : grade === 'forgot' ? 'due' : ''}`}>{grade}</span>
            <span className="meta num" style={{ minWidth: 130, textAlign: 'right' }}>
              next {store.progress.cards[id]?.due} · step {store.progress.cards[id]?.step}/{LADDER.length - 1}
            </span>
          </a>
        ))}
      </section>

      <div className="btn-row">
        <a className="btn" href="#/">back to today</a>
        <a className="btn-ghost" href="#/progress">see whether this is working</a>
      </div>
    </>
  )
}
