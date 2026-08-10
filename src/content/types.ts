import type { Lang, TestCase } from '../runner/types.ts'

export type Problem = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  /** The whole idea in one sentence — what he should be able to say from memory. */
  trick: string
  /** Function name the tests call, per language, so each stays idiomatic. */
  fn: Record<Lang, string>
  stub: Record<Lang, string>
  solution: Record<Lang, string>
  /** Declared once, shared by every language. This is what keeps dual-language cheap. */
  tests: TestCase[]
  hints: string[]
}

export type Pattern = {
  id: string
  name: string
  trigger: string
  cues: string[]
  traps: string[]
  complexity: string
  template: Record<Lang, string>
  problems: Problem[]
}
