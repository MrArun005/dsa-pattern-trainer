import { useState } from 'react'
import type { Grade } from '../srs.ts'
import type { Store } from '../store.ts'
import type { Lang } from '../runner/types.ts'
import type { Pattern } from '../content/types.ts'
import { drillCard, problemCard } from '../content/index.ts'
import { go } from '../router.ts'
import { LangTabs } from './LangTabs.tsx'
import { tabInserts } from './editor.ts'

export function PatternPage({ pattern, store, drill }: { pattern: Pattern; store: Store; drill?: boolean }) {
  const [lang, setLang] = useLang(store)

  if (drill) return <Drill pattern={pattern} store={store} lang={lang} setLang={setLang} />

  return (
    <>
      <section className="section">
        <div className="lab">{pattern.id.replace('-', '_')}</div>
        <h1>{pattern.name}</h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>{pattern.trigger}</p>
        <div className="btn-row" style={{ marginTop: 'var(--s5)' }}>
          <a className="btn" href={`#/${pattern.id}/drill`}>RECALL DRILL →</a>
          <span className="meta faint">write the template from blank. this is the part that makes it stick.</span>
        </div>
      </section>

      <div className="cols-2">
        <section>
          <div className="bar-head">
            <div className="lab" style={{ marginBottom: 0 }}>template</div>
            <span className="spacer" />
            <LangTabs lang={lang} setLang={setLang} />
          </div>
          <pre className="code">{pattern.template[lang]}</pre>
          <div className="meta faint" style={{ marginTop: 'var(--s3)' }}>{pattern.complexity}</div>
        </section>

        <section>
          <div className="lab">how you recognise it</div>
          <ul className="list">
            {pattern.cues.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>
      </div>

      <div className="rule" />

      <section className="section">
        <div className="lab">where it goes wrong</div>
        <ul className="list">
          {pattern.traps.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section className="section">
        <div className="lab">problems</div>
        {pattern.problems.map((q) => {
          const card = store.progress.cards[problemCard(pattern.id, q.id)]
          const due = card ? card.due <= store.today : false
          return (
            <a className="row" key={q.id} href={`#/${pattern.id}/p/${q.id}`}>
              <span className="name">{q.title}</span>
              <span className="pill">{q.difficulty}</span>
              {!card ? (
                <span className="meta faint">not started</span>
              ) : due ? (
                <span className="pill due">due</span>
              ) : (
                <span className="meta">next {card.due}</span>
              )}
            </a>
          )
        })}
      </section>
    </>
  )
}

function Drill({
  pattern, store, lang, setLang,
}: { pattern: Pattern; store: Store; lang: Lang; setLang: (l: Lang) => void }) {
  const id = drillCard(pattern.id)
  const card = store.card(id)
  const [code, setCode] = useState('')
  const [sentence, setSentence] = useState('')
  const [revealed, setRevealed] = useState(false)

  const submit = (grade: Grade) => {
    store.grade(id, grade, sentence.trim() || card.sentence)
    go('#/')
  }

  return (
    <>
      <section className="section">
        <div className="lab">recall drill · {pattern.id.replace('-', '_')}</div>
        <h1>Write the {pattern.name} template from memory.</h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>
          No reference, no peeking. Getting it wrong here is the point — failing to recall and then
          seeing it is what actually builds the memory. Reading it again would not.
        </p>
      </section>

      <section className="section">
        <div className="bar-head">
          <div className="lab" style={{ marginBottom: 0 }}>from blank</div>
          <span className="spacer" />
          <LangTabs lang={lang} setLang={setLang} />
        </div>
        <textarea
          className="editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={tabInserts(setCode)}
          placeholder={lang === 'py' ? '# start typing' : '// start typing'}
          spellCheck={false}
          autoFocus
        />
      </section>

      <section className="section">
        <div className="lab">state the trick in one sentence</div>
        <textarea
          className="editor"
          style={{ minHeight: 80 }}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="if you can't compress it to a sentence, you have a memory of some code, not the pattern"
          spellCheck={false}
        />
      </section>

      {!revealed ? (
        <button className="btn" onClick={() => setRevealed(true)}>REVEAL AND COMPARE →</button>
      ) : (
        <>
          <div className="rule" />
          <div className="cols-2">
            <section>
              <div className="lab">the actual template</div>
              <pre className="code">{pattern.template[lang]}</pre>
            </section>
            <section>
              <div className="lab">the trick</div>
              <p className="prose">{pattern.trigger}</p>
              {card.sentence && (
                <>
                  <div className="lab" style={{ marginTop: 'var(--s5)' }}>your sentence last time</div>
                  <p className="prose">“{card.sentence}”</p>
                </>
              )}
            </section>
          </div>

          <div className="rule" />
          <section>
            <div className="lab">how did that go? this sets when it comes back</div>
            <div className="btn-row">
              <button className="btn-ghost" onClick={() => submit('forgot')}>FORGOT — again today</button>
              <button className="btn-ghost" onClick={() => submit('shaky')}>SHAKY — same interval</button>
              <button className="btn" onClick={() => submit('solid')}>SOLID — push it out</button>
            </div>
          </section>
        </>
      )}
    </>
  )
}

export function useLang(store: Store): [Lang, (l: Lang) => void] {
  const lang = store.progress.settings.lang
  const setLang = (next: Lang) =>
    store.setProgress((p) => ({ ...p, settings: { ...p.settings, lang: next } }))
  return [lang, setLang]
}
