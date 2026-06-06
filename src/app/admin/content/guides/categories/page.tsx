import { prisma } from '@/lib/prisma'
import { createGuideCategory, deleteGuideCategory } from '@/app/actions/cms'
import { FolderPlus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function GuideCategoriesAdminPage() {
  const [categories, guides] = await Promise.all([
    prisma.guideCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.guide.findMany({ select: { categoryId: true } }),
  ])

  // Count guides per category
  const categoryCounts = guides.reduce((acc, guide) => {
    acc[guide.categoryId] = (acc[guide.categoryId] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content/guides" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục Hướng dẫn</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} danh mục đã tạo</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form Add */}
        <div className="md:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 sticky top-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderPlus size={18} className="text-green-600" /> Thêm danh mục mới
            </h2>
            <form action={createGuideCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input type="text" name="name" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn tĩnh (Slug)</label>
                <input type="text" name="slug" placeholder="slug-danh-muc" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea name="description" rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                <input type="number" name="sortOrder" defaultValue="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors">Tạo danh mục</button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-3">
          {categories.map(cat => {
            const count = categoryCounts[cat.id] || 0
            return (
              <div key={cat.id} className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">{count} bài viết</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{cat.description || cat.slug}</p>
                </div>
                {count === 0 ? (
                  <form action={deleteGuideCategory}>
                    <input type="hidden" name="id" value={cat.id} />
                    <button type="submit" title="Xoá danh mục trống" className="p-2 rounded-md hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </form>
                ) : (
                  <button disabled title="Không thể xoá danh mục đang chứa bài viết" className="p-2 rounded-md text-gray-300 cursor-not-allowed">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )
          })}
          {categories.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 text-sm">Chưa có danh mục nào. Hãy tạo danh mục đầu tiên.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
