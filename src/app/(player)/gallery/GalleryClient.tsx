'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Image as ImageIcon, Star } from 'lucide-react'

type MediaItem = { id: number; title: string; description: string | null; type: 'image' | 'video'; mediaUrl: string; thumbnailUrl: string | null; tags: string[]; isFeatured: boolean; sortOrder: number }
type FilterType = 'all' | 'image' | 'video' | 'featured'

function getYouTubeEmbedUrl(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
}

export function GalleryClient({ items }: { items: MediaItem[] }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [active, setActive] = useState<MediaItem | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'image') return items.filter(m => m.type === 'image')
    if (filter === 'video') return items.filter(m => m.type === 'video')
    if (filter === 'featured') return items.filter(m => m.isFeatured)
    return items
  }, [items, filter])

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {([['all', 'Tất cả'], ['featured', 'Nổi bật'], ['image', 'Ảnh'], ['video', 'Video']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider border transition-colors ${filter === k ? 'bg-player-primary border-player-primary' : 'border-player text-player-muted hover:text-player-foreground'}`} style={filter === k ? { color: 'var(--player-primary-foreground)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-player rounded-xl"><p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald'" }}>Chưa có gì ở đây</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((m, i) => (
            <motion.button key={m.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: (i % 6) * 0.03 }} onClick={() => setActive(m)} className="relative group rounded-lg overflow-hidden border border-player bg-player-card aspect-[4/3]">
              <img src={m.thumbnailUrl ?? m.mediaUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,15,14,0.9), transparent)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left z-10">
                <p className="text-sm uppercase tracking-wide truncate" style={{ fontFamily: "'Oswald'" }}>{m.title}</p>
              </div>
              {m.isFeatured && (
                <div className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 z-10" style={{ backgroundColor: 'rgba(214,168,79,0.9)', color: 'var(--player-secondary-foreground)' }}>
                  <Star size={10} /> Nổi bật
                </div>
              )}
              {m.type === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-player-primary/90 flex items-center justify-center text-player-background backdrop-blur-sm shadow-[0_0_15px_rgba(var(--player-primary),0.5)]">
                    <Play size={24} className="ml-1" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <div className="absolute top-2 right-2 rounded p-1 z-10" style={{ backgroundColor: 'rgba(11,15,14,0.8)' }}>
                  <ImageIcon size={12} className="text-player-muted" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(11,15,14,0.95)', backdropFilter: 'blur(4px)' }} onClick={() => setActive(null)}>
            <button onClick={() => setActive(null)} className="absolute top-4 right-4 p-2 rounded-md hover:bg-player-card" aria-label="Close"><X size={24} /></button>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} transition={{ duration: 0.25 }} className="max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              {active.type === 'video' ? (
                getYouTubeEmbedUrl(active.mediaUrl) ? (
                  <iframe src={getYouTubeEmbedUrl(active.mediaUrl)!} allow="autoplay; encrypted-media; fullscreen" className="w-full aspect-video rounded-xl border border-player" />
                ) : (
                  <video src={active.mediaUrl} controls autoPlay className="w-full rounded-xl border border-player" />
                )
              ) : (
                <img src={active.mediaUrl} alt={active.title} className="w-full rounded-xl border border-player" />
              )}
              <div className="mt-4 text-center">
                <h3 className="text-xl uppercase tracking-wide" style={{ fontFamily: "'Oswald'" }}>{active.title}</h3>
                {active.description && <p className="text-sm text-player-muted mt-1">{active.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
