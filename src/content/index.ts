import type { Pattern, Problem } from './types.ts'
import { twoPointers } from './two-pointers.ts'
import { slidingWindow } from './sliding-window.ts'

export const patterns: Pattern[] = [twoPointers, slidingWindow]

export const findPattern = (id: string) => patterns.find((p) => p.id === id)

export const findProblem = (patternId: string, problemId: string) =>
  findPattern(patternId)?.problems.find((p) => p.id === problemId)

/** Card id for the pattern's template-recall drill. */
export const drillCard = (patternId: string) => `${patternId}/template`

/** Card id for one problem. */
export const problemCard = (patternId: string, problemId: string) => `${patternId}/${problemId}`

/** Every reviewable card id in the app, drill first. */
export const allCardIds = (): string[] =>
  patterns.flatMap((p) => [drillCard(p.id), ...p.problems.map((q) => problemCard(p.id, q.id))])

/** Where a card id lives in the app. */
export function cardHref(id: string): string {
  const [patternId, second] = id.split('/')
  return second === 'template' ? `#/${patternId}/drill` : `#/${patternId}/p/${second}`
}

/** Human label for a card id, for lists that mix drills and problems. */
export function cardLabel(id: string): string {
  const [patternId, second] = id.split('/')
  const pattern = findPattern(patternId)
  if (!pattern) return id
  if (second === 'template') return `${pattern.name} · template`
  return findProblem(patternId, second)?.title ?? id
}

export type { Pattern, Problem }
