import { prisma } from '@/lib/prisma'
import { deleteMedia } from '@/app/actions/cms'
import { Trash2, Star, Play } from 'lucide-react'
import GalleryUploadForm from './GalleryUploadForm'

// Client wrapper to trigger re-fetch after add
// (Gallery page is Server Component — GalleryUploadForm handles revalidation via Server Action)
export const dynamic = 'force-dynamic'

export default async function GalleryAdminPage() {
  const media = await prisma.mediaItem.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thư viện Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{media.length} mục · Ảnh & Video</p>
        </div>
        {/* Client Component xử lý upload — không truyền function prop vì Server → Client không serialize được */}
        <GalleryUploadForm />
      </div>

      {/* Grid hiển thị */}
      {media.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Play size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Chưa có ảnh/video nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm ảnh / Video" để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map(m => {
            const isVideo = m.type === 'video'
            const thumb = m.thumbnailUrl || m.mediaUrl
            return (
              <div key={m.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden group relative hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  {isVideo ? (
                    <>
                      {/* Thumbnail cho video: nếu có thumbnailUrl dùng ảnh, không thì hiện play placeholder */}
                      {m.thumbnailUrl ? (
                        <img src={m.thumbnailUrl} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                        <video
                          src={m.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play size={18} className="text-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 bg-purple-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">VIDEO</span>
                    </>
                  ) : (
                    <>
                      <img src={thumb} alt={m.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-blue-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">ẢNH</span>
                    </>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate flex-1">{m.title}</p>
                    {m.isFeatured && <Star size={12} className="text-yellow-500 shrink-0" />}
                  </div>
                  {m.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.description}</p>}
                </div>
                {/* Delete button */}
                <form action={deleteMedia} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 shadow"
                    title="Xóa"
                  >
                    <Trash2 size={12} />
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
