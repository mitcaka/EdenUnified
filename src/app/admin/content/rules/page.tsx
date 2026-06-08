import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createRule, deleteRule, createRuleCategory, deleteRuleCategory } from '@/app/actions/cms'
import { Plus, Trash2, FolderPlus, Edit } from 'lucide-react'

export default async function RulesAdminPage() {
  const [categories, rules] = await Promise.all([
    prisma.ruleCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.rule.findMany({ orderBy: { sortOrder: 'asc' }, include: { category: true } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Luật máy chủ</h1>
        <p className="text-sm text-gray-500 mt-1">{categories.length} danh mục · {rules.length} luật</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <details className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <summary className="px-5 py-3 cursor-pointer font-medium text-sm flex items-center gap-2"><FolderPlus size={16} className="text-green-600" /> Thêm danh mục mới</summary>
          <form action={createRuleCategory} className="p-5 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="name" placeholder="Tên danh mục" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input type="text" name="slug" placeholder="slug-danh-muc" className="rounded-md border border-gray-300 px-3 py-2 text-sm font-mono" />
            </div>
            <textarea name="description" placeholder="Mô tả danh mục..." rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" name="sortOrder" defaultValue="0" className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Thứ tự hiển thị" />
              <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Tạo danh mục</button>
            </div>
          </form>
        </details>

        {/* Add Rule Form */}
        <details className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <summary className="px-5 py-3 cursor-pointer font-medium text-sm flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Thêm luật mới</summary>
          <form action={createRule} className="p-5 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="title" placeholder="Tiêu đề luật" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <input type="text" name="slug" placeholder="slug-luat" className="rounded-md border border-gray-300 px-3 py-2 text-sm font-mono" />
            </div>
            <textarea name="content" placeholder="Nội dung luật..." rows={3} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-3 gap-3">
              <select name="categoryId" required className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                {categories.length === 0 && <option value="">Chưa có danh mục</option>}
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select name="severity" className="rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="info">Thông tin</option><option value="minor">Nhẹ</option><option value="major">Nặng</option><option value="critical">Nghiêm trọng</option></select>
              <input type="number" name="sortOrder" defaultValue="0" className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Thứ tự" />
            </div>
            <button type="submit" disabled={categories.length === 0} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Thêm luật</button>
          </form>
        </details>
      </div>

      {/* List by Category */}
      {categories.map(cat => {
        const catRules = rules.filter(r => r.categoryId === cat.id)
        return (
          <div key={cat.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                <p className="text-xs text-gray-400">{cat.description || cat.slug}</p>
              </div>
              {catRules.length === 0 ? (
                <form action={deleteRuleCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <button type="submit" title="Xoá danh mục trống" className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>
              ) : (
                <button disabled title="Chỉ có thể xoá danh mục khi đã xoá hết luật bên trong" className="p-1.5 rounded text-gray-300 cursor-not-allowed">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {catRules.map(r => (
              <div key={r.id} className="px-5 py-3 border-b border-gray-100 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{r.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${r.severity === 'critical' ? 'bg-red-100 text-red-600' : r.severity === 'major' ? 'bg-yellow-100 text-yellow-700' : r.severity === 'minor' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>{r.severity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
                </div>
                <div className="flex gap-1 justify-end">
                  <Link href={`/admin/content/rules/${r.id}/edit`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                    <Edit size={14} />
                  </Link>
                  <form action={deleteRule}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="p-1.5 rounded hover:bg-red-100 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {catRules.length === 0 && <p className="text-center py-6 text-gray-400 text-sm italic">Chưa có luật nào trong danh mục này.</p>}
          </div>
        )
      })}
    </div>
  )
}
