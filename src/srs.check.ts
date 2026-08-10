// Self-check for the scheduler: npm run check.
// ponytail: two assert helpers, no test framework. Add one if this outgrows a screen.
import { LADDER, addDays, daysBetween, isDue, longestStreak, newCard, recallRate, review, streak } from './srs.ts'

let checks = 0

function eq(actual: unknown, expected: unknown, msg: string) {
  checks++
  const [a, b] = [JSON.stringify(actual), JSON.stringify(expected)]
  if (a !== b) throw new Error(`${msg}\n  expected ${b}\n  got      ${a}`)
}

function ok(cond: boolean, msg: string) {
  checks++
  if (!cond) throw new Error(msg)
}

const T = '2026-08-10'

// a new card is due immediately
let c = newCard('two-pointers/template', T)
eq(c.step, 0, 'new card starts at step 0')
eq(c.due, T, 'new card is due today')

// solid advances up the ladder
c = review(c, 'solid', T)
eq(c.step, 1, 'solid advances the step')
eq(daysBetween(T, c.due), 1, 'first solid pushes it out one day')

c = review(c, 'solid', c.due)
eq(c.step, 2, 'second solid advances again')
eq(daysBetween(T, c.due), 1 + LADDER[2], 'interval comes from the ladder at the new step')

// shaky holds the interval and never requeues same-day
const shaky = review(c, 'shaky', T)
eq(shaky.step, c.step, 'shaky does not move the step')
eq(daysBetween(T, shaky.due), LADDER[c.step], 'shaky repeats the same interval')
ok(daysBetween(T, review(newCard('x', T), 'shaky', T).due) >= 1, 'shaky at step 0 must not requeue same-day')

// forgot drops two steps and comes back today
let deep = newCard('deep', T)
for (let i = 0; i < 5; i++) deep = review(deep, 'solid', T)
eq(deep.step, 5, 'five solids reach step 5')
const forgot = review(deep, 'forgot', T)
eq(forgot.step, 3, 'forgot drops two steps')
eq(forgot.due, T, 'forgot is due again the same day')
ok(isDue(forgot, T), 'a forgotten card reads as due')

// bounds
eq(review(newCard('a', T), 'forgot', T).step, 0, 'step never goes negative')
let top = newCard('b', T)
for (let i = 0; i < 20; i++) top = review(top, 'solid', T)
eq(top.step, LADDER.length - 1, 'step clamps at the top of the ladder')
eq(daysBetween(T, top.due), LADDER[LADDER.length - 1], 'top step uses the longest interval')

// purity
const before = newCard('immutable', T)
const snapshot = JSON.stringify(before)
review(before, 'solid', T)
eq(JSON.stringify(before), snapshot, 'review must not mutate its input')

// history accumulates
eq(review(review(newCard('h', T), 'solid', T), 'forgot', T).history.length, 2, 'every review is recorded')

// date maths across month, year and leap boundaries
eq(addDays('2026-08-31', 1), '2026-09-01', 'month rollover')
eq(addDays('2026-12-31', 1), '2027-01-01', 'year rollover')
eq(addDays('2026-03-01', -1), '2026-02-28', 'non-leap february')
eq(addDays('2028-03-01', -1), '2028-02-29', 'leap february')
eq(daysBetween(T, T), 0, 'same day is zero days')

// streaks
eq(streak([], T), 0, 'no history is no streak')
eq(streak(['2026-08-10'], T), 1, 'today alone is a streak of one')
eq(streak(['2026-08-08', '2026-08-09'], T), 2, 'a streak ending yesterday still counts')
eq(streak(['2026-08-07', '2026-08-09', '2026-08-10'], T), 2, 'a gap breaks the streak')
eq(streak(['2026-08-01'], T), 0, 'stale history is not a streak')

// longest streak looks at the whole history, not just the tail
eq(longestStreak([]), 0, 'no history has no longest streak')
eq(longestStreak(['2026-08-01']), 1, 'a single day is a run of one')
eq(longestStreak(['2026-07-01', '2026-07-02', '2026-07-03', '2026-08-01']), 3, 'finds a past run')
eq(longestStreak(['2026-08-02', '2026-08-01', '2026-08-03']), 3, 'order of input does not matter')
eq(longestStreak(['2026-08-01', '2026-08-01', '2026-08-02']), 2, 'duplicate days count once')

// recall rate
eq(recallRate([]), 0, 'no reviews is zero recall')
eq(
  recallRate([
    { ...newCard('p', T), history: [{ date: T, grade: 'solid' }, { date: T, grade: 'forgot' }] },
    { ...newCard('q', T), history: [{ date: T, grade: 'solid' }, { date: T, grade: 'shaky' }] },
  ]),
  0.5,
  'two solid out of four reviews is 50%',
)

console.log(`srs: ${checks} checks passed`)
