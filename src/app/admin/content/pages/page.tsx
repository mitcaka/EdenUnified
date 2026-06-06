import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Edit, FileText } from 'lucide-react'

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trang tĩnh (Pages)</h1>
        <p className="text-sm text-gray-500 mt-1">Chỉnh sửa nội dung các trang cố định (RP Guide, How to Join...)</p>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tiêu đề</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Đường dẫn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng thái</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="mr-3 h-5 w-5 text-gray-400" />
                    <div className="text-sm font-medium text-gray-900">{p.title}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">/{p.slug}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/content/pages/${p.id}/edit`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900">
                    <Edit size={16} /> Chỉnh sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">Chưa có trang nào được tạo.</div>
        )}
      </div>
    </div>
  )
}

