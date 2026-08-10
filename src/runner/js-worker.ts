/// <reference lib="webworker" />
import type { CaseResult, RunRequest } from './types.ts'

// Runs the user's JS in a Worker so an infinite loop can be killed by
// terminating the thread — the main window stays responsive either way.
self.onmessage = (e: MessageEvent<RunRequest>) => {
  const { code, fn, tests } = e.data

  // `fn` comes from repo-authored problem content, but pin it to an identifier
  // so nothing can ever be interpolated into the function body but a name.
  if (!/^[A-Za-z_$][\w$]*$/.test(fn)) {
    self.postMessage({ kind: 'compile-error', message: `Bad function name in problem content: "${fn}"` })
    return
  }

  let target: unknown
  try {
    // Evaluating arbitrary source IS the product here. It's the user's own code,
    // in a Worker with no DOM, in a local single-user app — nothing crosses a
    // trust boundary. `code` is never interpolated anywhere else.
    target = new Function(`${code}\n;return typeof ${fn} === 'function' ? ${fn} : undefined;`)()
  } catch (err) {
    self.postMessage({ kind: 'compile-error', message: String(err) })
    return
  }

  if (typeof target !== 'function') {
    self.postMessage({
      kind: 'compile-error',
      message: `No function named "${fn}" found. Keep the name from the stub — the tests call it directly.`,
    })
    return
  }

  const started = performance.now()
  const results: CaseResult[] = tests.map(({ args, expected }) => {
    try {
      const got = (target as (...a: unknown[]) => unknown)(...structuredClone(args))
      return { pass: same(got, expected), args, expected, got }
    } catch (err) {
      return { pass: false, args, expected, error: String(err) }
    }
  })

  self.postMessage({ kind: 'ok', results, ms: Math.round(performance.now() - started) })
}

// ponytail: structural compare via JSON. Order-sensitive and blind to NaN /
// undefined / Infinity — fine for array-and-number problems. Swap for a real
// deep-equal the day a problem returns a Set or a float tolerance.
function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
