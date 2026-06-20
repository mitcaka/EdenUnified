'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Link2, Image as ImageIcon, Video, Film, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export interface EvidenceItem {
  type: 'url' | 'image' | 'video'
  value: string       // URL (proxy for uploaded, or external URL)
  name?: string       // display name
  remotePath?: string // only for uploaded files
}

interface EvidenceUploadProps {
  /** Hidden input name for form submission — value will be newline-separated URLs */
  name: string
  /** Initial value (newline-separated URLs) */
  defaultValue?: string
  /** Upload folder (default: Team_Media/tasks) */
  folder?: string
}

function isVideoUrl(url: string): boolean {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)
}

function isImageUrl(url: string): boolean {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  // BUG FIX: thêm dấu ngoặc để tránh operator precedence sai (&&  trước ||)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
    || (url.includes('/api/media/') && !isVideoUrl(url))
}

function detectType(url: string): 'image' | 'video' | 'url' {
  if (isVideoUrl(url)) return 'video'
  if (isImageUrl(url)) return 'image'
  return 'url'
}

export default function EvidenceUpload({
  name,
  defaultValue = '',
  folder = 'Team_Media/tasks',
}: EvidenceUploadProps) {
  const initialItems: EvidenceItem[] = defaultValue
    ? defaultValue.split('\n').map(v => v.trim()).filter(Boolean).map(v => ({
        type: detectType(v),
        value: v,
        name: v.split('/').pop() || v,
      }))
    : []

  const [items, setItems] = useState<EvidenceItem[]>(initialItems)
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Serialize items to newline-separated URLs for form submission
  const serializedValue = items.map(i => i.value).join('\n')

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    setItems(prev => [...prev, { type: detectType(url), value: url, name: url.split('/').pop() || url }])
    setUrlInput('')
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    setUploadingCount(files.length)

    const results: EvidenceItem[] = []
    for (const file of files) {
      try {
        const url = `/api/upload?raw=true&folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type || '')}`
        
        const res = await fetch(url, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          }
        })
        
        if (!res.ok) {
          const data = await res.json()
          toast.error(`Lỗi upload ${file.name}: ${data.error}`)
          continue
        }
        const data = await res.json()
        results.push({
          type: data.type === 'video' ? 'video' : 'image',
          value: data.url,
          name: data.name,
          remotePath: data.remotePath,
        })
      } catch {
        toast.error(`Lỗi upload ${file.name}`)
      }
    }

    if (results.length > 0) {
      setItems(prev => [...prev, ...results])
      toast.success(`Đã upload ${results.length} file minh chứng!`)
    }
    setUploadingCount(0)
  }, [folder])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    uploadFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (files.length > 0) uploadFiles(files)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (files.length > 0) {
      e.preventDefault()
      uploadFiles(files)
    }
  }

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      {/* Hidden form field */}
      <input type="hidden" name={name} value={serializedValue} />

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
            uploadingCount > 0 ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            {uploadingCount > 0 ? (
              <><Loader2 size={15} className="animate-spin" /> Đang upload {uploadingCount} file...</>
            ) : (
              <><Upload size={15} /> Upload ảnh / Video</>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              disabled={uploadingCount > 0}
            />
          </label>

          <div className="flex items-center gap-1 flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden">
            <Link2 size={13} className="text-gray-400 ml-2.5 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="Hoặc dán URL link..."
              className="flex-1 text-sm py-2 px-2 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={!urlInput.trim()}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
            >
              Thêm
            </button>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-50/90">
            <p className="text-blue-600 font-semibold text-sm">Thả file để upload...</p>
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-2">
          Hỗ trợ: JPG, PNG, GIF, WEBP, MP4, WEBM · Kéo thả hoặc Ctrl+V để dán ảnh/video
        </p>
      </div>

      {/* Preview items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2 group hover:border-gray-200 transition-colors">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {item.type === 'image' ? (
                  <img src={item.value} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                ) : item.type === 'video' ? (
                  <video src={item.value} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Link2 size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {item.type === 'image' ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon size={8} /> Ảnh
                    </span>
                  ) : item.type === 'video' ? (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Film size={8} /> Video
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Link2 size={8} /> URL
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 truncate font-medium">{item.name || item.value}</p>
                {item.type !== 'url' && (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline truncate block"
                  >
                    {item.value}
                  </a>
                )}
                {item.type === 'url' && (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate block"
                  >
                    {item.value}
                  </a>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
