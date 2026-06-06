'use client'

import { useState, useEffect } from 'react'
import { X, UploadCloud, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

type MediaLibraryModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  folder?: string
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, folder = 'CMS_Media' }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  const fetchFiles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/media/list?folder=${folder}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchFiles()
      setSelectedUrl(null)
    }
  }, [isOpen, folder])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading('Đang tải ảnh lên Cloud...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      toast.success('Tải ảnh lên thành công!', { id: toastId })
      
      // Select the new image immediately and close
      onSelect(data.url)
      onClose()
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên!', { id: toastId })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-bold text-gray-800">Thư viện ảnh ({folder})</h2>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
              <UploadCloud size={16} />
              {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
            </label>
            <button onClick={fetchFiles} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors" title="Làm mới">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <RefreshCw size={32} className="animate-spin mb-3 opacity-50" />
              <p>Đang tải thư viện ảnh...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p>Chưa có ảnh nào trong thư mục này.</p>
              <p className="text-sm mt-1">Hãy bấm "Tải ảnh lên" để bắt đầu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map(file => (
                <div 
                  key={file.name} 
                  onClick={() => setSelectedUrl(file.url)}
                  className={`
                    relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer bg-gray-200 transition-all
                    ${selectedUrl === file.url ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : 'border-transparent hover:border-blue-300'}
                  `}
                >
                  {/* Sử dụng loading="lazy" để tăng hiệu suất cho hàng ngàn ảnh */}
                  <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
                  
                  {selectedUrl === file.url && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                      <Check size={14} />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                    <p className="text-white text-[10px] truncate">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-between items-center bg-white">
          <p className="text-sm text-gray-500">
            {selectedUrl ? '1 ảnh đang chọn' : `Tổng cộng ${files.length} ảnh`}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button 
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl)
                  onClose()
                }
              }}
              disabled={!selectedUrl}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Chọn ảnh này
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
