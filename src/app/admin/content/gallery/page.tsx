import { prisma } from '@/lib/prisma'
import { createMedia, deleteMedia } from '@/app/actions/cms'
import { Plus, Trash2, Star } from 'lucide-react'

export default async function GalleryAdminPage() {
  const media = await prisma.mediaItem.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Thư viện</h1><p className="text-sm text-gray-500 mt-1">{media.length} mục</p></div>

      <details className="rounded-lg border border-gray-200 bg-white">
        <summary className="px-5 py-3 cursor-pointer font-medium text-sm flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Thêm ảnh/video</summary>
        <form action={createMedia} className="p-5 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="title" placeholder="Tiêu đề" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <select name="type" className="rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="image">Ảnh</option><option value="video">Video</option></select>
          </div>
          <input type="url" name="mediaUrl" placeholder="URL ảnh/video chính" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <input type="url" name="thumbnailUrl" placeholder="URL thumbnail (tuỳ chọn)" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <input type="text" name="description" placeholder="Mô tả (tuỳ chọn)" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-3 items-center">
            <input type="text" name="tags" placeholder='Tags JSON: ["tag1","tag2"]' className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono" />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="isFeatured" className="rounded" /> Nổi bật</label>
            <input type="number" name="sortOrder" defaultValue="0" className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="STT" />
          </div>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Thêm</button>
        </form>
      </details>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map(m => (
          <div key={m.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden group relative">
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              <img src={m.thumbnailUrl || m.mediaUrl} alt={m.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5"><p className="text-sm font-medium text-gray-900 truncate flex-1">{m.title}</p>{m.isFeatured && <Star size={12} className="text-yellow-500" />}</div>
              <p className="text-xs text-gray-400 mt-0.5">{m.type}</p>
            </div>
            <form action={deleteMedia} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"><Trash2 size={12} /></button>
            </form>
          </div>
        ))}
      </div>
      {media.length === 0 && <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">Chưa có ảnh/video</div>}
    </div>
  )
}
