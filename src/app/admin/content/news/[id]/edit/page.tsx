import { prisma } from '@/lib/prisma'
import { updateNews } from '@/app/actions/cms'
import { notFound } from 'next/navigation'
import RichTextEditor from '@/components/ui/RichTextEditor'
import SubmitButton from '@/components/ui/SubmitButton'
import ImageUpload from '@/components/ui/ImageUpload'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await prisma.newsPost.findUnique({ where: { id } })
  
  if (!news) notFound()

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content/news" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sửa bài viết</h1>
          <p className="text-sm text-gray-500 mt-1">Cập nhật nội dung cho bài: {news.title}</p>
        </div>
      </div>

      <form action={updateNews} className="flex flex-col lg:flex-row gap-6 items-start">
        <input type="hidden" name="id" value={news.id} />
        
        {/* Main Column */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input type="text" name="title" defaultValue={news.title} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <RichTextEditor name="content" defaultValue={news.content} />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mô tả ngắn (Excerpt) <span className="text-red-500">*</span></label>
              <textarea name="excerpt" defaultValue={news.excerpt} rows={3} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Cài đặt xuất bản</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Trạng thái</label>
              <select name="status" defaultValue={news.status} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-gray-50 focus:bg-white transition-colors">
                <option value="draft">Bản nháp (Chưa hiển thị)</option>
                <option value="published">Xuất bản ngay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Đường dẫn tĩnh (Slug)</label>
              <input type="text" name="slug" defaultValue={news.slug} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono text-gray-600 bg-gray-50 focus:bg-white" placeholder="Để trống tự tạo từ tiêu đề" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ảnh bìa (Cover)</label>
              <ImageUpload name="coverImageUrl" defaultValue={news.coverImageUrl || ''} />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <SubmitButton text="Cập nhật bài viết" />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

