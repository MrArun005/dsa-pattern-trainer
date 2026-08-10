import type { Lang, RunResult, TestCase } from './types.ts'

export const TIMEOUT_MS = 2000

export async function run(lang: Lang, code: string, fn: string, tests: TestCase[]): Promise<RunResult> {
  if (lang === 'py') {
    return {
      kind: 'unavailable',
      message: 'Python runs next — the Pyodide worker is the next piece being built. JS works now.',
    }
  }
  return runJs(code, fn, tests)
}

function runJs(code: string, fn: string, tests: TestCase[]): Promise<RunResult> {
  const worker = new Worker(new URL('./js-worker.ts', import.meta.url), { type: 'module' })

  return new Promise<RunResult>((resolve) => {
    const done = (r: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(r)
    }

    const timer = setTimeout(() => done({ kind: 'timeout', ms: TIMEOUT_MS }), TIMEOUT_MS)

    worker.onmessage = (e: MessageEvent<RunResult>) => done(e.data)
    worker.onerror = (e) => done({ kind: 'compile-error', message: e.message || 'Worker failed' })
    worker.postMessage({ code, fn, tests })
  })
}
