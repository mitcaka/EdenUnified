'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2, AlertCircle, Maximize2, X, ExternalLink } from 'lucide-react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { createPortal } from 'react-dom'

// ─── Configure marked with highlight.js ──────────────────────────────────────
const renderer = new marked.Renderer()

// Open links in new tab by default
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  renderer,
  gfm: true,
})

// Use highlight.js for code syntax highlighting
marked.use({
  extensions: [],
  hooks: {
    preprocess: (src: string) => src,
    postprocess: (html: string) => html,
  },
  walkTokens: (token) => {
    if (token.type === 'code') {
      const lang = (token as { lang?: string }).lang || ''
      const code = (token as { text: string }).text
      try {
        const highlighted = lang && hljs.getLanguage(lang)
          ? hljs.highlight(code, { language: lang }).value
          : hljs.highlightAuto(code).value
        ;(token as { escaped?: boolean }).escaped = true
        ;(token as { text: string }).text = highlighted
      } catch {
        // fallback: no highlighting
      }
    }
  },
})

// ─── Fullscreen Modal ─────────────────────────────────────────────────────────
function FullscreenModal({
  url,
  content,
  isMd,
  onClose,
}: {
  url: string
  content: string
  isMd: boolean
  onClose: () => void
}) {
  const fileName = url.split('/').pop() || 'Tài liệu'

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const html = isMd ? marked.parse(content) as string : null

  return createPortal(
    <div className="doc-fullscreen-overlay" onClick={onClose}>
      <div className="doc-fullscreen-inner" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="doc-fullscreen-header">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText size={16} className="text-blue-500 shrink-0" />
            <span className="truncate max-w-[400px]">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              title="Mở file trong tab mới"
            >
              <ExternalLink size={13} />
              <span>Mở tab mới</span>
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all"
              title="Đóng (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="doc-fullscreen-body">
          {isMd && html ? (
            <div
              className="markdown-vscode"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-gray-700">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocumentPreview({
  url,
  hideHeader = false,
  maxHeight = '600px',
}: {
  url: string
  hideHeader?: boolean
  /** CSS max-height for the content area. Default '600px'. Pass 'none' to disable. */
  maxHeight?: string
}) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const isMd = ext === 'md'
  const fileName = url.split('/').pop() || 'Tài liệu'

  useEffect(() => {
    setLoading(true)
    setError(false)
    setContent(null)
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.text()
      })
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [url])

  const handleExpandClick = useCallback(() => setFullscreen(true), [])
  const handleCloseFullscreen = useCallback(() => setFullscreen(false), [])

  // Rendered HTML for Markdown
  const renderedHtml = content && isMd ? marked.parse(content) as string : null

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white my-2 shadow-sm">
        {/* Header */}
        {!hideHeader && (
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={16} className="text-blue-500 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
              {isMd && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
                  Markdown
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {content && (
                <button
                  onClick={handleExpandClick}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 size={13} />
                  <span className="hidden sm:inline">Mở rộng</span>
                </button>
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                title="Mở file trong tab mới"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Tab mới</span>
              </a>
            </div>
          </div>
        )}

        {/* Content area */}
        <div
          className="overflow-y-auto bg-white"
          style={{ maxHeight }}
        >
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Đang tải nội dung...</span>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-10 text-red-400 gap-2">
              <AlertCircle size={28} />
              <span className="text-sm font-medium">Không thể tải nội dung file.</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                <ExternalLink size={11} /> Mở trực tiếp
              </a>
            </div>
          )}
          {content !== null && (
            isMd && renderedHtml ? (
              <div className="markdown-vscode px-6 py-5" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-gray-700 p-5">
                {content}
              </pre>
            )
          )}
          {/* Expand hint when content is likely clipped */}
          {content && !fullscreen && maxHeight !== 'none' && (
            <div className="sticky bottom-0 flex justify-center py-2 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none">
              <button
                onClick={handleExpandClick}
                className="pointer-events-auto flex items-center gap-1.5 text-xs text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-blue-50 transition-colors"
              >
                <Maximize2 size={12} /> Xem toàn bộ nội dung
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && content && (
        <FullscreenModal
          url={url}
          content={content}
          isMd={isMd}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  )
}
