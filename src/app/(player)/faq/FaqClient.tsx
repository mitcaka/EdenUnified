'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

type FaqItem = { id: number; question: string; answer: string; category: string; sortOrder: number }

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>()
    faqs.forEach(f => {
      const arr = map.get(f.category) ?? []
      arr.push(f)
      map.set(f.category, arr)
    })
    return Array.from(map.entries())
  }, [faqs])

  if (grouped.length === 0) {
    return <div className="text-center py-20 border border-dashed border-player rounded-xl"><p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald'" }}>Chưa có câu hỏi nào</p></div>
  }

  return (
    <div className="space-y-10">
      {grouped.map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-xl uppercase tracking-wide mb-3 text-player-muted" style={{ fontFamily: "'Oswald'" }}>{cat}</h2>
          <div className="space-y-2">
            {items.map(f => <FaqAccordion key={f.id} q={f.question} a={f.answer} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function FaqAccordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-player bg-player-card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between text-left p-5 hover:bg-player-card-elevated transition-colors">
        <span className="font-medium">{q}</span>
        <ChevronDown size={18} className={`text-player-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-player-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
