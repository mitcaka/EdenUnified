'use client'

import { useState } from 'react'
import DocumentPreview from './DocumentPreview'
import { FileText, ExternalLink } from 'lucide-react'

export default function DocumentViewerGroup({ urls }: { urls: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!urls || urls.length === 0) return null

  // If there's only 1 file, we don't need tabs. Just show it directly.
  if (urls.length === 1) {
    const url = urls[0]
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
    const canPreview = ['md', 'txt', 'csv'].includes(ext)
    
    if (canPreview) {
      return <DocumentPreview url={url} />
    } else {
      return (
        <div className="flex items-center justify-between border border-gray-200 rounded-xl bg-gray-50 px-3 py-2">
           <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} className="text-blue-500" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{url.split('/').pop()}</span>
           </div>
           <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
              Mở tab mới
           </a>
        </div>
      )
    }
  }

  // Multiple files -> show tabs
  const activeUrl = urls[activeIndex]
  const activeExt = activeUrl.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const canPreviewActive = ['md', 'txt', 'csv'].includes(activeExt)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2 mb-1">
        {urls.map((url, idx) => {
          const isActive = activeIndex === idx
          const name = url.split('/').pop() || 'Tài liệu'
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-b-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'border-blue-500 text-blue-700 bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span className="truncate max-w-[150px]">{name}</span>
            </button>
          )
        })}
      </div>
      
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {canPreviewActive ? (
          <DocumentPreview url={activeUrl} key={activeUrl} hideHeader={true} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <FileText size={32} className="text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">{activeUrl.split('/').pop()}</p>
            <p className="text-xs text-gray-500 mb-4">Định dạng file không hỗ trợ xem trước trực tiếp.</p>
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
    </div>
  )
}
