import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteGuide } from '@/app/actions/cms'
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react'

export default async function GuidesAdminPage() {
  const [categories, guides] = await Promise.all([
    prisma.guideCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.guide.findMany({ orderBy: { sortOrder: 'asc' }, include: { category: true } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Hướng dẫn</h1><p className="text-sm text-gray-500 mt-1">{guides.length} bài hướng dẫn</p></div>
        <div className="flex items-center gap-3">
          <Link href="/admin/content/guides/categories" className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><FolderPlus size={16} /> Quản lý danh mục</Link>
          <Link href="/admin/content/guides/new" className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Plus size={16} /> Thêm hướng dẫn</Link>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left font-semibold text-gray-600">Tiêu đề</th><th className="px-4 py-3 text-left font-semibold text-gray-600">Danh mục</th><th className="px-4 py-3 text-left font-semibold text-gray-600">Độ khó</th><th className="px-4 py-3 text-right font-semibold text-gray-600">Hành động</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {guides.map(g => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{g.title}</td>
                <td className="px-4 py-3 text-gray-500">{g.category.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${g.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : g.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{g.difficulty}</span></td>
                <td className="px-4 py-3 text-right"><div className="flex gap-1 justify-end">
                  <form action={deleteGuide}><input type="hidden" name="id" value={g.id} /><button type="submit" className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có hướng dẫn</div>}
      </div>
    </div>
  )
}
