import type { Lang } from '../runner/types.ts'

export function LangTabs({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="tabs" role="group" aria-label="language">
      {(['py', 'js'] as Lang[]).map((l) => (
        <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l === 'py' ? 'python' : 'javascript'}
        </button>
      ))}
    </div>
  )
}
