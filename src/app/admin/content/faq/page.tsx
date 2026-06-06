import { prisma } from '@/lib/prisma'
import { createFaq, deleteFaq } from '@/app/actions/cms'
import { Plus, Trash2 } from 'lucide-react'

export default async function FaqAdminPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } })
  const cats = [...new Set(faqs.map(f => f.category))]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp</h1><p className="text-sm text-gray-500 mt-1">{faqs.length} câu hỏi · {cats.length} nhóm</p></div>

      <details className="rounded-lg border border-gray-200 bg-white">
        <summary className="px-5 py-3 cursor-pointer font-medium text-sm flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Thêm câu hỏi mới</summary>
        <form action={createFaq} className="p-5 border-t border-gray-200 space-y-3">
          <input type="text" name="question" placeholder="Câu hỏi?" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <textarea name="answer" placeholder="Trả lời..." rows={3} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="category" placeholder="Nhóm (VD: Joining, Gameplay)" defaultValue="General" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            <input type="number" name="sortOrder" defaultValue="0" className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Thứ tự" />
          </div>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Thêm FAQ</button>
        </form>
      </details>

      {cats.map(cat => (
        <div key={cat} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">{cat}</div>
          {faqs.filter(f => f.category === cat).map(f => (
            <div key={f.id} className="px-5 py-3 border-b border-gray-100 flex items-start gap-3 hover:bg-gray-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{f.question}</p>
                <p className="text-xs text-gray-500 mt-1">{f.answer}</p>
              </div>
              <form action={deleteFaq}><input type="hidden" name="id" value={f.id} /><button type="submit" className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button></form>
            </div>
          ))}
        </div>
      ))}
      {faqs.length === 0 && <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">Chưa có câu hỏi nào</div>}
    </div>
  )
}
