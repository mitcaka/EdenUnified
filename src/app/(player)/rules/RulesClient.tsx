'use client'

import { motion } from 'framer-motion'

type RuleCategory = { id: number; name: string; slug: string; description: string | null; sortOrder: number }
type Rule = { id: number; title: string; slug: string; content: string; categoryId: number; severity: string; sortOrder: number }

const SEVERITY: Record<string, { label: string; bg: string; text: string }> = {
  info:     { label: 'Thông tin',    bg: 'var(--player-muted)', text: 'var(--player-muted-foreground)' },
  minor:    { label: 'Nhẹ',          bg: 'rgba(214,168,79,0.2)', text: 'var(--player-secondary)' },
  major:    { label: 'Nặng',         bg: 'rgba(214,168,79,0.3)', text: 'var(--player-secondary)' },
  critical: { label: 'Nghiêm trọng', bg: 'rgba(138,47,47,0.3)', text: 'var(--player-danger-foreground)' },
}

export function RulesClient({ categories, rules }: { categories: RuleCategory[]; rules: Rule[] }) {
  if (categories.length === 0) {
    return <div className="text-center py-20 border border-dashed border-player rounded-xl"><p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald'" }}>Chưa có luật nào được đăng</p></div>
  }

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const items = rules.filter(r => r.categoryId === cat.id)
        if (items.length === 0) return null
        return (
          <motion.section key={cat.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h2 className="text-2xl uppercase tracking-wide mb-1" style={{ fontFamily: "'Oswald'" }}>{cat.name}</h2>
            {cat.description && <p className="text-sm text-player-muted mb-4">{cat.description}</p>}
            <div className="space-y-3">
              {items.map((r) => {
                const sev = SEVERITY[r.severity] || SEVERITY.info
                return (
                  <article key={r.id} className="rounded-xl border border-player bg-player-card p-5 hover:bg-player-card-elevated transition-colors">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="text-lg uppercase tracking-wide flex-1" style={{ fontFamily: "'Oswald'" }}>{r.title}</h3>
                      <span className="px-2.5 py-1 rounded-md text-xs uppercase tracking-wider" style={{ backgroundColor: sev.bg, color: sev.text }}>{sev.label}</span>
                    </div>
                    <p className="text-player-muted mt-2 leading-relaxed">{r.content}</p>
                  </article>
                )
              })}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
