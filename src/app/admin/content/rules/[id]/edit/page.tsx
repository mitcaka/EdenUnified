import { updateRule } from '@/app/actions/cms'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ruleId = parseInt(id)
  
  if (isNaN(ruleId)) notFound()

  const [rule, categories] = await Promise.all([
    prisma.rule.findUnique({ where: { id: ruleId } }),
    prisma.ruleCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  if (!rule) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content/rules" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sửa luật máy chủ</h1>
        </div>
      </div>

      <form action={updateRule} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <input type="hidden" name="id" value={rule.id} />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tiêu đề luật <span className="text-red-500">*</span></label>
            <input type="text" name="title" defaultValue={rule.title} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Slug</label>
            <input type="text" name="slug" defaultValue={rule.slug} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono text-gray-600 bg-gray-50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">Nội dung luật <span className="text-red-500">*</span></label>
          <textarea name="content" defaultValue={rule.content} rows={5} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
            <select name="categoryId" defaultValue={rule.categoryId} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mức độ nghiêm trọng</label>
            <select name="severity" defaultValue={rule.severity} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm">
              <option value="info">Thông tin</option>
              <option value="minor">Nhẹ (Minor)</option>
              <option value="major">Nặng (Major)</option>
              <option value="critical">Nghiêm trọng (Critical)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Thứ tự</label>
            <input type="number" name="sortOrder" defaultValue={rule.sortOrder} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  )
}
