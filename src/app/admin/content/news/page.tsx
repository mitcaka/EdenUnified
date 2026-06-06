import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteNews } from '@/app/actions/cms'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default async function NewsListPage() {
  const news = await prisma.newsPost.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin tức</h1>
          <p className="text-sm text-gray-500 mt-1">{news.length} bài viết</p>
        </div>
        <Link href="/admin/content/news/new" className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} /> Thêm bài viết
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tiêu đề</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Ngày đăng</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {news.map(n => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{n.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{n.status === 'published' ? 'Đã đăng' : 'Nháp'}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <Link href={`/admin/content/news/${n.id}/edit`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit size={14} /></Link>
                    <form action={deleteNews}><input type="hidden" name="id" value={n.id} /><button type="submit" className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {news.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có bài viết nào</div>}
      </div>
    </div>
  )
}
