/// <reference lib="webworker" />
import type { CaseResult, RunRequest } from './types.ts'

// ponytail: Pyodide from the CDN, not bundled. Bundling drags ~200MB of wasm
// through node_modules and the build. Cost: the very first Python run needs
// network. Bundle it the day offline Python actually matters.
const VERSION = '0.26.4'
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`

type Pyodide = {
  runPython: (src: string) => unknown
  globals: { set: (k: string, v: unknown) => void }
}

let pyodide: Pyodide | null = null

async function boot(): Promise<Pyodide> {
  if (pyodide) return pyodide
  self.postMessage({ kind: 'status', message: `downloading the python runtime (~10 MB, once)` })
  const mod = await import(/* @vite-ignore */ `${BASE}pyodide.mjs`)
  pyodide = (await mod.loadPyodide({ indexURL: BASE })) as Pyodide
  self.postMessage({ kind: 'status', message: 'python ready' })
  return pyodide
}

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { code, fn, tests } = e.data

  if (!/^[A-Za-z_][\w]*$/.test(fn)) {
    self.postMessage({ kind: 'compile-error', message: `Bad function name in problem content: "${fn}"` })
    return
  }

  let py: Pyodide
  try {
    py = await boot()
  } catch (err) {
    self.postMessage({
      kind: 'unavailable',
      message: `Could not load the Python runtime (${short(err)}). Check the network, or switch to JavaScript — it runs locally with no download.`,
    })
    return
  }

  try {
    py.runPython(code)
  } catch (err) {
    self.postMessage({ kind: 'compile-error', message: short(err) })
    return
  }

  if (py.runPython(`callable(globals().get(${JSON.stringify(fn)}))`) !== true) {
    self.postMessage({
      kind: 'compile-error',
      message: `No function named "${fn}" was defined. Keep the name from the stub — the tests call it directly.`,
    })
    return
  }

  const started = performance.now()
  const results: CaseResult[] = tests.map(({ args, expected }) => {
    try {
      py.globals.set('_args_json', JSON.stringify(args))
      const raw = py.runPython(
        `import json as _json\n_json.dumps(${fn}(*_json.loads(_args_json)), default=list)`,
      ) as string
      const got = JSON.parse(raw) as unknown
      return { pass: JSON.stringify(got) === JSON.stringify(expected), args, expected, got }
    } catch (err) {
      return { pass: false, args, expected, error: short(err) }
    }
  })

  self.postMessage({ kind: 'ok', results, ms: Math.round(performance.now() - started) })
}

/** Python tracebacks are long; the last line is the part that says what broke. */
function short(err: unknown): string {
  const lines = String(err).trim().split('\n')
  return lines[lines.length - 1] || String(err)
}
