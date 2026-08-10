import type { KeyboardEvent } from 'react'

/** Tab inserts two spaces instead of escaping the textarea. */
export function tabInserts(setValue: (v: string) => void) {
  return (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart: start, selectionEnd: end, value } = el
    setValue(`${value.slice(0, start)}  ${value.slice(end)}`)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2
    })
  }
}

/** Cmd/Ctrl + Enter fires the action. */
export function onSubmitKey(action: () => void) {
  return (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      action()
    }
  }
}
