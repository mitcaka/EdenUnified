'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, ZoomIn, ExternalLink, Download } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
}

export default function ImageLightbox({ images }: ImageLightboxProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const openAt = useCallback((i: number) => setLightboxIdx(i), [])
  const close = useCallback(() => setLightboxIdx(null), [])

  const prev = useCallback(() => {
    setLightboxIdx(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setLightboxIdx(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [lightboxIdx, close, prev, next])

  const activeUrl = lightboxIdx !== null ? images[lightboxIdx] : null

  const colClass =
    images.length === 1 ? 'grid-cols-1' :
    images.length === 2 ? 'grid-cols-2' :
    'grid-cols-3'

  return (
    <>
      {/* Image grid */}
      <div className={`grid gap-2 ${colClass}`}>
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in"
          >
            <img
              src={url}
              alt={`Ảnh ${i + 1}`}
              loading="lazy"
              className="w-full object-cover"
              style={{
                maxHeight: images.length === 1 ? '400px' : '220px',
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn
                size={28}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
            {/* Index badge for multi-image */}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {i + 1}/{images.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox portal */}
      {lightboxIdx !== null && activeUrl && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="img-lightbox-overlay"
            onClick={close}
          >
            {/* Controls bar */}
            <div
              className="absolute top-3 right-3 flex items-center gap-2 z-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Counter */}
              {images.length > 1 && (
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  {lightboxIdx + 1} / {images.length}
                </span>
              )}
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white text-xs bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-full transition-colors"
                title="Mở tab mới"
              >
                <ExternalLink size={13} />
              </a>
              <button
                onClick={close}
                className="flex items-center justify-center w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                title="Đóng (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Prev / Next buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  title="Ảnh trước (←)"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); next() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  title="Ảnh sau (→)"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* The image */}
            <img
              src={activeUrl}
              alt={`Ảnh ${lightboxIdx + 1}`}
              onClick={e => e.stopPropagation()}
              draggable={false}
            />

            {/* Bottom caption */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full"
              onClick={e => e.stopPropagation()}
            >
              {images.length > 1 ? `Dùng ← → để điều hướng • Esc để đóng` : 'Esc để đóng'}
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}
