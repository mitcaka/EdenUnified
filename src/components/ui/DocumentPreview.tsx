'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, AlertCircle } from 'lucide-react'

export default function DocumentPreview({ url, hideHeader = false }: { url: string; hideHeader?: boolean }) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  const isMd = ext === 'md'

  useEffect(() => {
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

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white my-2 shadow-sm">
      {!hideHeader && (
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText size={16} className="text-blue-500 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{url.split('/').pop()}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
            Mở tab mới
          </a>
        </div>
      )}
      
      <div className="p-4 max-h-[400px] overflow-y-auto text-sm text-gray-800 bg-gray-50/30">
        {loading && (
          <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Đang tải nội dung...
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-red-400 gap-2">
            <AlertCircle size={24} />
            <span>Không thể tải nội dung file.</span>
          </div>
        )}
        {content !== null && (
          isMd ? (
             <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(content) }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-700">{content}</pre>
          )
        )}
      </div>
    </div>
  )
}

function parseSimpleMarkdown(md: string) {
  // Basic markdown parser for preview
  let html = md
    .replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-bold text-xl mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="font-bold text-2xl mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-3 italic text-gray-600 my-2">$1</blockquote>')
    .replace(/\n/gim, '<br />')
    
  return html
}
