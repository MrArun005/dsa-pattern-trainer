import { useEffect, useState } from 'react'
import type { Grade } from '../srs.ts'
import type { Store } from '../store.ts'
import { draftKey } from '../store.ts'
import type { RunResult } from '../runner/types.ts'
import { TIMEOUT_MS, run } from '../runner/run.ts'
import type { Pattern, Problem } from '../content/types.ts'
import { problemCard } from '../content/index.ts'
import { go } from '../router.ts'
import { LangTabs } from './LangTabs.tsx'
import { useLang } from './PatternPage.tsx'
import { onSubmitKey, tabInserts } from './editor.ts'

export function ProblemPage({ pattern, problem, store }: { pattern: Pattern; problem: Problem; store: Store }) {
  const [lang, setLang] = useLang(store)
  const cardId = problemCard(pattern.id, problem.id)
  const key = draftKey(cardId, lang)

  const [code, setCode] = useState(() => localStorage.getItem(key) ?? problem.stub[lang])
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [hintsOpened, setHintsOpened] = useState(0)

  // Swapping language or problem loads that draft, falling back to the stub.
  useEffect(() => {
    setCode(localStorage.getItem(key) ?? problem.stub[lang])
    setResult(null)
  }, [key, lang, problem])

  useEffect(() => {
    localStorage.setItem(key, code)
  }, [key, code])

  const execute = async () => {
    setRunning(true)
    setResult(await run(lang, code, problem.fn[lang], problem.tests))
    setRunning(false)
    setAttempted(true)
  }

  const passed = result?.kind === 'ok' && result.results.every((r) => r.pass)

  const submit = (grade: Grade) => {
    store.grade(cardId, grade)
    go(`#/${pattern.id}`)
  }

  return (
    <>
      <section className="section">
        <div className="lab">
          <a href={`#/${pattern.id}`} style={{ color: 'inherit' }}>{pattern.name}</a> · {problem.difficulty}
        </div>
        <h1>{problem.title}</h1>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>{problem.prompt}</p>
      </section>

      <div className="cols-2">
        <section>
          <div className="bar-head">
            <div className="lab" style={{ marginBottom: 0 }}>your solution</div>
            <span className="spacer" />
            <LangTabs lang={lang} setLang={setLang} />
          </div>

          <textarea
            className="editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              tabInserts(setCode)(e)
              onSubmitKey(execute)(e)
            }}
            spellCheck={false}
          />

          <div className="btn-row" style={{ marginTop: 'var(--s3)' }}>
            <button className="btn" onClick={execute} disabled={running}>
              {running ? 'RUNNING…' : 'RUN  ⌘↵'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setCode(problem.stub[lang])
                setResult(null)
              }}
            >
              reset to stub
            </button>
            <span className="meta faint">calls {problem.fn[lang]}() · {problem.tests.length} cases</span>
          </div>
        </section>

        <section>
          <div className="lab">results</div>
          <Results result={result} running={running} />

          {passed && (
            <>
              <div className="rule" />
              <div className="lab">how did that feel? this sets when it comes back</div>
              {hintsOpened > 0 && (
                <p className="meta faint" style={{ marginBottom: 'var(--s3)' }}>
                  you opened {hintsOpened} hint{hintsOpened > 1 ? 's' : ''} — shaky is the honest answer
                </p>
              )}
              <div className="btn-row">
                <button className="btn-ghost" onClick={() => submit('forgot')}>FORGOT</button>
                <button className="btn-ghost" onClick={() => submit('shaky')}>SHAKY</button>
                <button className="btn" onClick={() => submit('solid')}>SOLID</button>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="rule" />

      <section className="section">
        <div className="lab">hints — each one you open is counted</div>
        {problem.hints.map((h, i) => (
          <details className="hint" key={i} onToggle={(e) => e.currentTarget.open && setHintsOpened((n) => n + 1)}>
            <summary>hint {i + 1}</summary>
            {h}
          </details>
        ))}
      </section>

      <section className="section">
        <div className="lab">reference solution</div>
        {!attempted ? (
          <div className="banner">
            Locked until you have run something. Reading the answer before trying is the loop that
            already failed you — an attempt that fails is worth more than a solution you understood.
          </div>
        ) : !revealed ? (
          <button className="btn-ghost" onClick={() => setRevealed(true)}>reveal solution</button>
        ) : (
          <>
            <pre className="code">{problem.solution[lang]}</pre>
            <p className="prose" style={{ marginTop: 'var(--s3)' }}>{problem.trick}</p>
          </>
        )}
      </section>
    </>
  )
}

function Results({ result, running }: { result: RunResult | null; running: boolean }) {
  if (running) return <div className="meta faint">running in a worker…</div>
  if (!result) return <div className="meta faint">nothing run yet. ⌘↵ in the editor.</div>

  if (result.kind === 'timeout')
    return (
      <div className="banner bad">
        Killed after {TIMEOUT_MS}ms — that looks like an infinite loop. Check that every path moves a
        pointer, or that the shrink condition can actually become false.
      </div>
    )

  if (result.kind === 'compile-error')
    return <div className="banner bad">{result.message}</div>

  if (result.kind === 'unavailable')
    return <div className="banner">{result.message}</div>

  const failed = result.results.filter((r) => !r.pass).length
  return (
    <>
      <div className={failed ? 'banner bad' : 'banner'} style={{ marginBottom: 'var(--s3)' }}>
        {failed === 0
          ? `all ${result.results.length} cases passed · ${result.ms}ms`
          : `${failed} of ${result.results.length} failed`}
      </div>
      {result.results.map((r, i) => (
        <div className={`case ${r.pass ? 'pass' : 'fail'}`} key={i}>
          <span className="flag">{r.pass ? 'PASS' : 'FAIL'}</span>
          <span className="io">
            {fmt(r.args).slice(1, -1)}
            {!r.pass && (
              <>
                {'\n'}expected <b>{fmt(r.expected)}</b>
                {'\n'}got      <span className="got">{r.error ? r.error : fmt(r.got)}</span>
              </>
            )}
          </span>
        </div>
      ))}
    </>
  )
}

const fmt = (v: unknown) => {
  try {
    return JSON.stringify(v) ?? String(v)
  } catch {
    return String(v)
  }
}
