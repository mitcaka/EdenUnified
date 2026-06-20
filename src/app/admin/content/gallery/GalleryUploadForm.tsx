'use client'

import { useState } from 'react'
import { Plus, Upload, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import MediaLibraryModal from '@/components/ui/MediaLibraryModal'
import { createMediaItem } from '@/app/actions/cms'

interface GalleryUploadFormProps {
  // onCreated removed — cannot pass function from Server Component to Client Component
}

function isVideoUrl(url: string): boolean {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)
}

export default function GalleryUploadForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'image' | 'video'>('image')
  const [description, setDescription] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalTarget, setModalTarget] = useState<'media' | 'thumbnail'>('media')

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const sizeMB = (file.size / 1024 / 1024).toFixed(0)
    const toastId = toast.loading(`Đang upload ${file.type.startsWith('video/') ? 'video' : 'ảnh'} (${sizeMB}MB)...`)
    try {
      const url = `/api/upload?raw=true&folder=Team_Media/gallery&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type || '')}`
      const res = await fetch(url, {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' }
      })
      if (!res.ok) throw new Error('Upload thất bại')
      const data = await res.json()
      setMediaUrl(data.url)
      setType(data.type === 'video' ? 'video' : 'image')
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''))
      toast.success('Upload thành công!', { id: toastId })
    } catch {
      toast.error('Lỗi upload', { id: toastId })
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const openModal = (target: 'media' | 'thumbnail') => {
    setModalTarget(target)
    setShowModal(true)
  }

  const handleModalSelect = (url: string) => {
    if (modalTarget === 'media') {
      setMediaUrl(url)
      setType(isVideoUrl(url) ? 'video' : 'image')
    } else {
      setThumbnailUrl(url)
    }
    setShowModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaUrl || !title) return
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', type)
      formData.append('mediaUrl', mediaUrl)
      formData.append('thumbnailUrl', thumbnailUrl)
      formData.append('description', description)
      if (isFeatured) formData.append('isFeatured', 'on')
      formData.append('sortOrder', '0')

      const result = await createMediaItem(formData)
      if (!result.ok) throw new Error(result.error || 'Lỗi lưu')
      toast.success('Đã thêm vào thư viện!')
      setMediaUrl(''); setThumbnailUrl(''); setTitle(''); setDescription(''); setIsFeatured(false)
      setIsOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu media')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        <Plus size={16} /> Thêm ảnh / Video
      </button>

      {isOpen && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <Plus size={16} className="text-blue-500" /> Thêm media mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Nguồn media</p>
              <div className="flex flex-wrap gap-2">
                {/* Direct upload */}
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${isUploading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  <Upload size={14} />
                  {isUploading ? 'Đang upload...' : 'Upload file'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleDirectUpload}
                    disabled={isUploading}
                  />
                </label>

                {/* From cloud library */}
                <button
                  type="button"
                  onClick={() => openModal('media')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors"
                >
                  <ImageIcon size={14} /> Chọn từ Cloud
                </button>
              </div>

              {/* Preview */}
              {mediaUrl && (
                <div className="mt-3 relative inline-block">
                  {type === 'video' ? (
                    <video src={mediaUrl} className="h-32 rounded-lg border border-gray-200 bg-black" muted preload="metadata" />
                  ) : (
                    <img src={mediaUrl} alt="preview" className="h-32 rounded-lg border border-gray-200 object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <span className={`absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${type === 'video' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {type === 'video' ? 'VIDEO' : 'ẢNH'}
                  </span>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Tiêu đề *"
                required
                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value as 'image' | 'video')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              >
                <option value="image">Ảnh</option>
                <option value="video">Video</option>
              </select>
              <button
                type="button"
                onClick={() => openModal('thumbnail')}
                className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ImageIcon size={13} />
                {thumbnailUrl ? 'Đổi thumbnail' : 'Thêm thumbnail'}
              </button>
            </div>

            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả (tuỳ chọn)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded" />
              <span>Đánh dấu nổi bật (Featured)</span>
            </label>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={!mediaUrl || !title || isSubmitting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Đang lưu...' : 'Thêm vào thư viện'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      <MediaLibraryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleModalSelect}
        folder="Team_Media/gallery"
      />
    </>
  )
}
