// Spaced-repetition scheduling. Pure functions over ISO yyyy-mm-dd strings.
// ponytail: fixed interval ladder, not FSRS. The Progress screen measures real
// retention — if the ladder is wrong the data will say so, then upgrade.

export type Grade = 'forgot' | 'shaky' | 'solid'

export const LADDER = [1, 1, 3, 7, 16, 35, 70]
const MAX_STEP = LADDER.length - 1

export type Review = { date: string; grade: Grade }

export type CardState = {
  id: string
  step: number
  due: string
  lastGrade?: Grade
  history: Review[]
  /** His own one-sentence statement of the trick, most recent version. */
  sentence?: string
}

export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to) - parse(from)) / 86_400_000)
}

export function newCard(id: string, today: string): CardState {
  return { id, step: 0, due: today, history: [] }
}

/** Grade a card and return its next state. Never mutates the input. */
export function review(card: CardState, grade: Grade, today: string): CardState {
  const step =
    grade === 'solid' ? Math.min(card.step + 1, MAX_STEP)
    : grade === 'shaky' ? card.step
    : Math.max(0, card.step - 2)

  // Forgetting means relearn now; anything else waits at least a day, so a
  // step-0 card can't loop forever inside one session.
  const due = grade === 'forgot' ? today : addDays(today, Math.max(1, LADDER[step]))

  return {
    ...card,
    step,
    due,
    lastGrade: grade,
    history: [...card.history, { date: today, grade }],
  }
}

export function isDue(card: CardState, today: string): boolean {
  return card.due <= today
}

/** Consecutive days of activity ending today or yesterday. */
export function streak(sessions: string[], today: string): number {
  const days = new Set(sessions)
  let cursor = days.has(today) ? today : addDays(today, -1)
  if (!days.has(cursor)) return 0
  let n = 0
  while (days.has(cursor)) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

/** Share of reviews graded solid on their first attempt of the day. */
export function recallRate(cards: CardState[]): number {
  const all = cards.flatMap((c) => c.history)
  if (all.length === 0) return 0
  return all.filter((r) => r.grade === 'solid').length / all.length
}

const pad = (n: number) => String(n).padStart(2, '0')
const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
