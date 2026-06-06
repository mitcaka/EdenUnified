'use client'

import { useState } from 'react'
import { Image as ImageIcon, X, Cloud } from 'lucide-react'
import MediaLibraryModal from './MediaLibraryModal'

interface ImageUploadProps {
  name: string
  defaultValue?: string
  folder?: string
}

export default function ImageUpload({ name, defaultValue = '', folder = 'CMS_Media' }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRemove = () => {
    setImageUrl('')
  }

  return (
    <>
      <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-colors hover:bg-gray-100 group">
        <input type="hidden" name={name} value={imageUrl} />
        
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                title="Đổi ảnh khác"
              >
                <Cloud size={18} />
              </button>
              <button 
                type="button" 
                onClick={handleRemove}
                className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                title="Xóa ảnh"
              >
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-500 transition-colors p-4 text-center cursor-pointer"
          >
            <div className="p-4 bg-white rounded-full shadow-sm mb-3 border border-gray-100 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
              <ImageIcon size={28} />
            </div>
            <span className="text-sm font-semibold text-gray-700 mb-1 group-hover:text-blue-600">Click để mở Thư viện ảnh</span>
            <span className="text-[11px] text-gray-400 font-medium">Hỗ trợ JPG, PNG, WEBP</span>
          </button>
        )}
      </div>

      <MediaLibraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => setImageUrl(url)}
        folder={folder}
      />
    </>
  )
}
