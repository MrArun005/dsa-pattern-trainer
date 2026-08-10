# Patterns

A spaced-repetition trainer for DSA patterns. Runs entirely in the browser — no
backend, no accounts, no sync.

It exists because of a specific failure mode: you learn a pattern, you understand
it, you solve problems with it, and six weeks later it is gone. That is not a
comprehension problem. Understanding a solution is easy and trains almost nothing;
memory forms when you **fail to recall something and then recall it**. Re-reading
solutions skips that step entirely, which is why it feels productive and does not
work.

So this app's job is not explaining algorithms. Explanations are everywhere. Its job
is to force retrieval on a schedule, and to measure whether retention is actually
improving.

## What's in it

Two patterns, done thoroughly rather than fifteen done shallowly: **Two Pointers**
and **Sliding Window**, nine problems each, easy through hard.

- **Recall drill** — blank editor, no reference. Write the template from memory,
  state the trick in one sentence, then compare against the real thing and your own
  sentence from last time.
- **Problem pages** — write code and run it against real test cases in Python or
  JavaScript, with per-case expected-vs-got diffs, a hint ladder that counts what you
  opened, and the reference solution locked until you have genuinely attempted it.
- **Review sessions** — the scheduler picks what is due, you grade yourself
  forgot / shaky / solid, and that sets when it comes back.
- **Progress** — your *measured* forgetting curve: every review bucketed by the real
  gap since you last saw that card, so you can see the interval where recall falls off.

## Running it

```bash
npm install
npm run dev        # http://localhost:5180
npm run check      # scheduler self-check, 35 assertions
npm run typecheck
npm run build
```

## How it works

**Scheduling** is a fixed interval ladder — `1, 1, 3, 7, 16, 35, 70` days. Solid
advances a step, shaky repeats it, forgetting drops two steps and brings the card
back the same day. Deliberately not FSRS: the ladder is about ten lines, and the
Progress screen measures whether it is working. Change it on evidence.

**Code execution** happens in Web Workers, so an infinite loop gets terminated
instead of freezing the tab. JavaScript runs natively; Python runs on Pyodide,
loaded from a CDN on first use.

**Dual language stays cheap** because test cases are declared once as data:

```ts
tests: [{ args: [[2, 7, 11, 15], 9], expected: [0, 1] }]
```

Only the starter stub and the reference solution are per-language, so adding a
language costs two small functions per problem rather than a second test harness.

**Progress** lives in `localStorage`. Nothing is uploaded anywhere, which also means
clearing site data wipes it — there is a JSON export in Settings.

## Adding a pattern

Every screen is already built, so a new pattern is pure content: one `Pattern`
object in `src/content/`, added to the list in `src/content/index.ts`. No new
components.

## Stack

Vite, React, TypeScript. No state library, no router, no UI framework, no test
framework — a hash router in a dozen lines and an assert-based self-check for the
only logic that genuinely needs one.
