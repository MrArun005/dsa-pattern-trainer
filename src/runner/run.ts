import type { Lang, RunResult, TestCase } from './types.ts'

export const TIMEOUT_MS = 3000

type Status = (message: string) => void

export function run(
  lang: Lang,
  code: string,
  fn: string,
  tests: TestCase[],
  onStatus: Status = () => {},
): Promise<RunResult> {
  return lang === 'py' ? runPy(code, fn, tests, onStatus) : runJs(code, fn, tests)
}

function runJs(code: string, fn: string, tests: TestCase[]): Promise<RunResult> {
  const worker = new Worker(new URL('./js-worker.ts', import.meta.url), { type: 'module' })
  return talk(worker, { code, fn, tests }, TIMEOUT_MS, () => {}, true)
}

// The Python worker is kept alive between runs — booting Pyodide costs seconds,
// so throwing it away after every run would make the second run as slow as the
// first. A timeout still has to kill it, which forfeits the warm runtime.
let pyWorker: Worker | null = null

function runPy(code: string, fn: string, tests: TestCase[], onStatus: Status): Promise<RunResult> {
  pyWorker ??= new Worker(new URL('./py-worker.ts', import.meta.url), { type: 'module' })
  const worker = pyWorker
  // Booting can take a while on a cold cache, so Python gets a longer leash.
  return talk(worker, { code, fn, tests }, TIMEOUT_MS * 10, onStatus, false).then((result) => {
    if (result.kind === 'timeout' || result.kind === 'unavailable') {
      worker.terminate()
      if (pyWorker === worker) pyWorker = null
    }
    return result
  })
}

function talk(
  worker: Worker,
  request: { code: string; fn: string; tests: TestCase[] },
  timeoutMs: number,
  onStatus: Status,
  disposable: boolean,
): Promise<RunResult> {
  return new Promise<RunResult>((resolve) => {
    const finish = (result: RunResult) => {
      clearTimeout(timer)
      worker.onmessage = null
      worker.onerror = null
      if (disposable) worker.terminate()
      resolve(result)
    }

    const timer = setTimeout(() => {
      worker.terminate()
      finish({ kind: 'timeout', ms: timeoutMs })
    }, timeoutMs)

    worker.onmessage = (e: MessageEvent<RunResult | { kind: 'status'; message: string }>) => {
      if (e.data.kind === 'status') {
        onStatus(e.data.message)
        return
      }
      finish(e.data)
    }
    worker.onerror = (e) => finish({ kind: 'compile-error', message: e.message || 'Worker failed' })
    worker.postMessage(request)
  })
}
