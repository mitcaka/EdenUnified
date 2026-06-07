'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FolderOpen, Folder, Image as ImageIcon, Video, FileText,
  Upload, FolderPlus, RefreshCw, Copy, Link2, Trash2,
  ChevronRight, Home, Eye, X, Download, ExternalLink,
  CheckCircle, AlertCircle, Play, Share2, ArrowLeft,
  Search, Grid3X3, List
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  name: string
  url: string
  remotePath: string
  size: number
  lastModified: string
  contentType: string
}

interface FolderItem {
  name: string
  remotePath: string
  lastModified: string
}

type ViewMode = 'grid' | 'list'

const ROOT = 'Team_Media'

const FOLDER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'general': { label: 'Chung', emoji: '📁', color: 'text-blue-600' },
  'news': { label: 'Tin tức', emoji: '📰', color: 'text-green-600' },
  'tasks': { label: 'Minh chứng Task', emoji: '✅', color: 'text-purple-600' },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getMediaType(contentType: string, name: string): 'image' | 'video' | 'other' {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.startsWith('video/')) return 'video'
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'video'
  return 'other'
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const type = getMediaType(file.contentType, file.name)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white p-2">
          <X size={24} />
        </button>
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-full max-h-[80vh] flex items-center justify-center">
          {type === 'image' ? (
            <img src={file.url} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />
          ) : type === 'video' ? (
            <video src={file.url} controls autoPlay className="max-w-full max-h-[80vh]" style={{ maxWidth: '900px' }} />
          ) : (
            <div className="p-12 text-gray-400 flex flex-col items-center gap-3">
              <FileText size={48} />
              <p>{file.name}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-white/60 text-sm truncate max-w-full">{file.name} — {formatBytes(file.size)}</p>
      </div>
    </div>
  )
}

// ─── File Card (Grid) ─────────────────────────────────────────────────────────
function FileCard({
  file,
  onPreview,
  onCopyProxy,
  onShare,
  onDelete,
}: {
  file: FileItem
  onPreview: () => void
  onCopyProxy: () => void
  onShare: () => void
  onDelete: () => void
}) {
  const type = getMediaType(file.contentType, file.name)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
        onClick={onPreview}
      >
        {type === 'image' ? (
          <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
        ) : type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex flex-col items-center gap-2 text-white/80">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Play size={20} className="translate-x-0.5" />
              </div>
              <span className="text-xs font-medium">{file.name.split('.').pop()?.toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FileText size={32} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 rounded-full p-2 shadow">
            <Eye size={16} className="text-gray-700" />
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          {type === 'image' ? (
            <span className="bg-blue-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <ImageIcon size={9} /> IMG
            </span>
          ) : type === 'video' ? (
            <span className="bg-purple-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Video size={9} /> VID
            </span>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-800 truncate" title={file.name}>{file.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(file.size)}</p>

        {/* Quick actions */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={onCopyProxy}
            className="flex-1 text-[10px] flex items-center justify-center gap-1 py-1 rounded-md bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 font-medium transition-colors"
            title="Copy link proxy"
          >
            <Copy size={10} /> Copy Link
          </button>
          <button
            onClick={onShare}
            className="flex-1 text-[10px] flex items-center justify-center gap-1 py-1 rounded-md bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-500 font-medium transition-colors"
            title="Lấy public link Nextcloud"
          >
            <Share2 size={10} /> Public
          </button>
          <button
            onClick={onDelete}
            className="text-[10px] flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 font-medium transition-colors"
            title="Xóa file"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── File Row (List) ──────────────────────────────────────────────────────────
function FileRow({
  file,
  onPreview,
  onCopyProxy,
  onShare,
  onDelete,
}: {
  file: FileItem
  onPreview: () => void
  onCopyProxy: () => void
  onShare: () => void
  onDelete: () => void
}) {
  const type = getMediaType(file.contentType, file.name)
  return (
    <tr className="hover:bg-gray-50 group transition-colors">
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer" onClick={onPreview}>
            {type === 'image' ? (
              <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
            ) : type === 'video' ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Play size={14} className="text-white/80" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FileText size={14} />
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]" title={file.name}>{file.name}</span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-xs text-gray-400">
        {type === 'image' ? <span className="text-blue-600 font-medium">Ảnh</span> : type === 'video' ? <span className="text-purple-600 font-medium">Video</span> : 'File'}
      </td>
      <td className="py-2.5 px-4 text-xs text-gray-400">{formatBytes(file.size)}</td>
      <td className="py-2.5 px-4 text-xs text-gray-400">{new Date(file.lastModified).toLocaleDateString('vi-VN')}</td>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onPreview} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500" title="Xem"><Eye size={13} /></button>
          <button onClick={onCopyProxy} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-500" title="Copy link proxy"><Copy size={13} /></button>
          <button onClick={onShare} className="p-1.5 rounded-md hover:bg-green-100 text-green-500" title="Public link"><Share2 size={13} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-100 text-red-500" title="Xóa"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  )
}

// ─── Share Result Modal ───────────────────────────────────────────────────────
function ShareResultModal({ result, onClose }: {
  result: { shareUrl: string; directDownloadUrl: string; token: string; fileName: string }
  onClose: () => void
}) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã copy ${label}!`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Public Link đã tạo!</h3>
              <p className="text-xs text-gray-500 truncate max-w-[250px]">{result.fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {/* Share URL */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Link xem (nhúng Discord)</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <code className="text-sm text-blue-700 flex-1 truncate">{result.shareUrl}</code>
              <button
                onClick={() => copyToClipboard(result.shareUrl, 'link xem')}
                className="shrink-0 p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Direct download URL */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Link download trực tiếp</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <code className="text-sm text-purple-700 flex-1 truncate">
                {result.directDownloadUrl.startsWith('/') ? `${window.location.origin}${result.directDownloadUrl}` : result.directDownloadUrl}
              </code>
              <button
                onClick={() => copyToClipboard(result.directDownloadUrl.startsWith('/') ? `${window.location.origin}${result.directDownloadUrl}` : result.directDownloadUrl, 'link download')}
                className="shrink-0 p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              💡 <strong>Tip Discord:</strong> Dán link download trực tiếp vào Discord để video/ảnh hiển thị inline. Link này public — ai có link đều xem được.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

// ─── New Folder Modal ─────────────────────────────────────────────────────────
function NewFolderModal({ currentPath, onClose, onCreated }: {
  currentPath: string
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    const safeName = name.trim().replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_')
    const remotePath = `${currentPath}/${safeName}`
    setLoading(true)
    try {
      const res = await fetch('/api/media/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remotePath }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      toast.success(`Đã tạo thư mục "${safeName}"`)
      onCreated()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tạo thư mục')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FolderPlus size={18} className="text-blue-500" /> Tạo thư mục mới
        </h3>
        <p className="text-xs text-gray-500 mb-3">Trong: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{currentPath}/</code></p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Tên thư mục..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang tạo...' : 'Tạo thư mục'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function MediaHubClient() {
  const [currentPath, setCurrentPath] = useState(ROOT)
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [shareResult, setShareResult] = useState<any>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [sharingPath, setSharingPath] = useState<string | null>(null)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchContent = useCallback(async (path: string) => {
    setIsLoading(true)
    setSearch('')
    try {
      const res = await fetch(`/api/media/list?folder=${encodeURIComponent(path)}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
        setFolders(data.folders || [])
      } else {
        toast.error('Không thể tải danh sách media')
      }
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Đảm bảo thư mục Team_Media tồn tại
    fetch('/api/media/mkdir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remotePath: ROOT }),
    }).catch(() => {})
    fetchContent(ROOT)
  }, [])

  const navigateTo = (path: string) => {
    setCurrentPath(path)
    fetchContent(path)
  }

  // Breadcrumb parts
  const breadcrumbs = currentPath.split('/').reduce<{ label: string; path: string }[]>((acc, part, i, arr) => {
    const path = arr.slice(0, i + 1).join('/')
    acc.push({ label: i === 0 ? 'Team_Media' : part, path })
    return acc
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    const toastId = toast.loading(`Đang upload ${selectedFiles.length} file...`)

    let successCount = 0
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      try {
        const url = `/api/upload?raw=true&folder=${encodeURIComponent(currentPath)}&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type || '')}`
        
        const res = await fetch(url, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          }
        })
        
        if (res.ok) successCount++
        else {
          const data = await res.json()
          toast.error(`Lỗi upload ${file.name}: ${data.error}`)
        }
      } catch {
        toast.error(`Lỗi upload ${file.name}`)
      }
      setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
    }

    toast.success(`Upload thành công ${successCount}/${selectedFiles.length} file!`, { id: toastId })
    setIsUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchContent(currentPath)
  }

  const handleCopyProxy = (file: FileItem) => {
    const fullUrl = `${window.location.origin}${file.url}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Đã copy link proxy!')
  }

  const handleShare = async (file: FileItem) => {
    setSharingPath(file.remotePath)
    const toastId = toast.loading('Đang tạo public link...')
    try {
      const res = await fetch('/api/media/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remotePath: file.remotePath }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Public link đã sẵn sàng!', { id: toastId })
      setShareResult({ ...data, fileName: file.name })
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tạo public link', { id: toastId })
    } finally {
      setSharingPath(null)
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Xóa file "${file.name}"? Hành động này không thể hoàn tác.`)) return
    setDeletingPath(file.remotePath)
    const toastId = toast.loading('Đang xóa...')
    try {
      const res = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remotePath: file.remotePath }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('Đã xóa file!', { id: toastId })
      fetchContent(currentPath)
    } catch (e: any) {
      toast.error(e.message || 'Lỗi xóa file', { id: toastId })
    } finally {
      setDeletingPath(null)
    }
  }

  const filteredFiles = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files
  const filteredFolders = search
    ? folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : folders

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <FolderOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Media Hub</h1>
                <p className="text-xs text-gray-400">Kho lưu trữ media của team — Nextcloud</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm file..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                />
              </div>

              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid3X3 size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={() => setShowNewFolder(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                <FolderPlus size={15} /> Thư mục mới
              </button>

              <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${isUploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <Upload size={15} />
                {isUploading ? `${uploadProgress}%` : 'Upload'}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={() => fetchContent(currentPath)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mt-3 text-sm">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-gray-900">{bc.label}</span>
                ) : (
                  <button onClick={() => navigateTo(bc.path)} className="text-blue-500 hover:text-blue-700 hover:underline">
                    {bc.label}
                  </button>
                )}
              </span>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {files.length} file · {folders.length} thư mục · {formatBytes(totalSize)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Folders */}
            {filteredFolders.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Thư mục</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredFolders.map(folder => {
                    const meta = FOLDER_LABELS[folder.name] || { label: folder.name, emoji: '📁', color: 'text-gray-700' }
                    return (
                      <button
                        key={folder.remotePath}
                        onClick={() => navigateTo(folder.remotePath)}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group text-center"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">{meta.emoji}</span>
                        <span className={`text-xs font-semibold ${meta.color} truncate w-full`}>{meta.label}</span>
                        <span className="text-[10px] text-gray-400">{folder.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Files */}
            {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FolderOpen size={40} className="mb-3 opacity-40" />
                <p className="font-semibold text-gray-500">Thư mục trống</p>
                <p className="text-sm mt-1">Nhấn Upload để thêm file đầu tiên</p>
              </div>
            ) : filteredFiles.length === 0 ? null : viewMode === 'grid' ? (
              <>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Files ({filteredFiles.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredFiles.map(file => (
                    <FileCard
                      key={file.remotePath}
                      file={file}
                      onPreview={() => setPreviewFile(file)}
                      onCopyProxy={() => handleCopyProxy(file)}
                      onShare={() => handleShare(file)}
                      onDelete={() => handleDelete(file)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Files ({filteredFiles.length})</h2>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kích thước</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map(file => (
                        <FileRow
                          key={file.remotePath}
                          file={file}
                          onPreview={() => setPreviewFile(file)}
                          onCopyProxy={() => handleCopyProxy(file)}
                          onShare={() => handleShare(file)}
                          onDelete={() => handleDelete(file)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Drag & Drop overlay */}
      <div
        className="fixed inset-0 z-20 pointer-events-none"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const dt = e.dataTransfer
          if (dt.files.length > 0) {
            const fakeEvent = { target: { files: dt.files } } as any
            handleUpload(fakeEvent)
          }
        }}
      />

      {/* Modals */}
      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {shareResult && <ShareResultModal result={shareResult} onClose={() => setShareResult(null)} />}
      {showNewFolder && (
        <NewFolderModal
          currentPath={currentPath}
          onClose={() => setShowNewFolder(false)}
          onCreated={() => fetchContent(currentPath)}
        />
      )}
    </div>
  )
}
