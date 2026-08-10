import { useCallback, useEffect, useState } from 'react'
import type { CardState, Grade } from './srs.ts'
import { newCard, review, todayISO } from './srs.ts'
import type { Lang } from './runner/types.ts'

const KEY = 'patterns.progress.v1'

export type Theme = 'light' | 'dark'

export type Progress = {
  cards: Record<string, CardState>
  sessions: string[]
  settings: { lang: Lang; dailyTarget: number; theme: Theme }
}

const empty = (): Progress => ({
  cards: {},
  sessions: [],
  settings: { lang: 'py', dailyTarget: 5, theme: 'light' },
})

export function load(): Progress {
  const raw = localStorage.getItem(KEY)
  if (!raw) return empty()
  try {
    const parsed = JSON.parse(raw) as Progress
    // Keep the shape honest even if an older/partial blob is on disk.
    return { ...empty(), ...parsed, settings: { ...empty().settings, ...parsed.settings } }
  } catch {
    // Never silently discard his history — park it and carry on.
    localStorage.setItem(`${KEY}.corrupt.${Date.now()}`, raw)
    return empty()
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)
  const today = todayISO()

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    document.documentElement.dataset.theme = progress.settings.theme
  }, [progress.settings.theme])

  const card = useCallback(
    (id: string): CardState => progress.cards[id] ?? newCard(id, today),
    [progress.cards, today],
  )

  const grade = useCallback(
    (id: string, g: Grade, sentence?: string) =>
      setProgress((p) => {
        const next = review(p.cards[id] ?? newCard(id, today), g, today)
        return {
          ...p,
          cards: { ...p.cards, [id]: sentence ? { ...next, sentence } : next },
          sessions: p.sessions.includes(today) ? p.sessions : [...p.sessions, today],
        }
      }),
    [today],
  )

  return { progress, setProgress, card, grade, today }
}

export type Store = ReturnType<typeof useProgress>

/** Editor drafts live outside progress — losing typed code to a refresh is unforgivable. */
export const draftKey = (cardId: string, lang: Lang) => `patterns.draft.${cardId}.${lang}`
