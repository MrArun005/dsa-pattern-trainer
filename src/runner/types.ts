export type Lang = 'py' | 'js'

export type TestCase = { args: unknown[]; expected: unknown }

export type CaseResult = {
  pass: boolean
  args: unknown[]
  expected: unknown
  got?: unknown
  error?: string
}

export type RunResult =
  | { kind: 'ok'; results: CaseResult[]; ms: number }
  | { kind: 'compile-error'; message: string }
  | { kind: 'timeout'; ms: number }
  | { kind: 'unavailable'; message: string }

export type RunRequest = { code: string; fn: string; tests: TestCase[] }
