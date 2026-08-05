'use client'

import { useState } from 'react'
import DocumentPreview from './DocumentPreview'
import { FileText, ExternalLink, Maximize2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

function FullscreenGroupModal({
  urls,
  activeIndex,
  onClose,
}: {
  urls: string[]
  activeIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(activeIndex)
  const url = urls[idx]
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const canPreview = ['md', 'txt', 'csv'].includes(ext)

  return createPortal(
    <div
      className="doc-fullscreen-overlay"
      onClick={onClose}
    >
      <div
        className="doc-fullscreen-inner"
        style={{ maxWidth: '960px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with tabs */}
        <div className="doc-fullscreen-header flex-col gap-2 items-start" style={{ padding: '0.75rem 1rem 0' }}>
          <div className="flex items-center justify-between w-full pb-2">
            <span className="text-sm font-semibold text-gray-700">
              📄 Tài liệu đính kèm ({urls.length} file)
            </span>
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                title="Mở file trong tab mới"
              >
                <ExternalLink size={13} />
                <span>Tab mới</span>
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
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-gray-200 w-full">
            {urls.map((u, i) => {
              const name = u.split('/').pop() || 'Tài liệu'
              const isActive = idx === i
              return (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={14} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="truncate max-w-[180px]">{name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="doc-fullscreen-body">
          {canPreview ? (
            <DocumentPreview url={url} key={url} hideHeader maxHeight="none" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileText size={40} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-600">{url.split('/').pop()}</p>
              <p className="text-xs text-gray-400">Định dạng này không hỗ trợ xem trước trực tiếp.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={14} /> Mở trong tab mới
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function DocumentViewerGroup({ urls }: { urls: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  if (!urls || urls.length === 0) return null

  // Single file — no tabs needed
  if (urls.length === 1) {
    const url = urls[0]
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
    const canPreview = ['md', 'txt', 'csv'].includes(ext)

    if (canPreview) {
      return <DocumentPreview url={url} />
    } else {
      return (
        <div className="flex items-center justify-between border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 gap-3">
          <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 min-w-0">
            <FileText size={18} className="text-blue-500 shrink-0" />
            <span className="truncate">{url.split('/').pop()}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all shadow-sm shrink-0"
            title="Mở file trong tab mới"
          >
            <ExternalLink size={13} />
            <span>Mở tab mới</span>
          </a>
        </div>
      )
    }
  }

  // Multiple files → tabs
  const activeUrl = urls[activeIndex]
  const activeExt = activeUrl.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const canPreviewActive = ['md', 'txt', 'csv'].includes(activeExt)

  return (
    <div className="flex flex-col gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Tab bar */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-2 pt-2 gap-2">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {urls.map((url, idx) => {
            const isActive = activeIndex === idx
            const name = url.split('/').pop() || 'Tài liệu'
            const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
            const isMdFile = ext === 'md'
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg border-b-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-blue-500 text-blue-700 bg-white shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                <FileText size={14} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                <span className="truncate max-w-[140px]">{name}</span>
                {isMdFile && (
                  <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-1 py-0.5 rounded leading-none border border-purple-100">
                    MD
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {/* Fullscreen button */}
        <button
          onClick={() => setFullscreen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1.5 shrink-0 border border-transparent hover:border-blue-200"
          title="Xem toàn màn hình"
        >
          <Maximize2 size={13} />
          <span>Mở rộng</span>
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-white">
        {canPreviewActive ? (
          <DocumentPreview url={activeUrl} key={activeUrl} hideHeader />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 gap-3">
            <FileText size={36} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-700">{activeUrl.split('/').pop()}</p>
            <p className="text-xs text-gray-400 mb-1">Định dạng file không hỗ trợ xem trước trực tiếp.</p>
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <ExternalLink size={14} /> Mở trong tab mới
            </a>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenGroupModal
          urls={urls}
          activeIndex={activeIndex}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  )
}
