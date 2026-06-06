'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

type GuideCategory = { id: number; name: string; slug: string; sortOrder: number }
type Guide = { id: number; title: string; slug: string; excerpt: string; difficulty: string; coverImageUrl?: string; categoryId: number }

const DIFF_LABELS: Record<string, string> = { beginner: 'Người mới', intermediate: 'Trung cấp', advanced: 'Nâng cao' }
const DIFF_STYLES: Record<string, React.CSSProperties> = {
  beginner: { color: 'var(--player-primary)', borderColor: 'rgba(143,191,77,0.4)' },
  intermediate: { color: 'var(--player-secondary)', borderColor: 'rgba(214,168,79,0.4)' },
  advanced: { color: 'var(--player-danger-foreground)', borderColor: 'rgba(138,47,47,0.5)' },
}

export function GuidesClient({ categories, guides }: { categories: GuideCategory[]; guides: Guide[] }) {
  const [cat, setCat] = useState<number | null>(null)
  const filtered = useMemo(() => guides.filter(g => cat === null || g.categoryId === cat), [guides, cat])

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip active={cat === null} onClick={() => setCat(null)}>Tất cả</FilterChip>
          {categories.map(c => <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</FilterChip>)}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-player rounded-xl"><p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald'" }}>Chưa có hướng dẫn</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.04 }}>
              <Link href={`/guides/${g.slug}`} className="group block rounded-xl border border-player bg-player-card overflow-hidden hover:border-player-primary transition-all h-full">
                {g.coverImageUrl && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={g.coverImageUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <span className="inline-block text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded" style={DIFF_STYLES[g.difficulty] || {}}>
                    {DIFF_LABELS[g.difficulty] ?? g.difficulty}
                  </span>
                  <h3 className="text-lg uppercase tracking-wide mt-3 group-hover:text-player-primary transition-colors" style={{ fontFamily: "'Oswald'" }}>{g.title}</h3>
                  <p className="text-sm text-player-muted mt-2 line-clamp-3">{g.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider border transition-colors ${active ? 'bg-player-primary border-player-primary' : 'border-player text-player-muted hover:text-player-foreground'}`} style={active ? { color: 'var(--player-primary-foreground)' } : {}}>
      {children}
    </button>
  )
}
