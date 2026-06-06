import { createNews } from '@/app/actions/cms'
import RichTextEditor from '@/components/ui/RichTextEditor'
import SubmitButton from '@/components/ui/SubmitButton'
import ImageUpload from '@/components/ui/ImageUpload'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewNewsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content/news" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viết bài mới</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo tin tức hoặc thông báo mới cho cộng đồng</p>
        </div>
      </div>

      <form action={createNews} className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Column */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input type="text" name="title" required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nhập tiêu đề..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-3">Sử dụng công cụ bên dưới để soạn thảo. Bạn có thể chèn ảnh bằng nút Image trên thanh công cụ.</p>
              <RichTextEditor name="content" placeholder="Nội dung bài viết của bạn..." />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mô tả ngắn (Excerpt) <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Đoạn tóm tắt hiển thị trên trang chủ và khi chia sẻ link.</p>
              <textarea name="excerpt" rows={3} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tóm tắt ngắn gọn nội dung..." />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Cài đặt xuất bản</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Trạng thái</label>
              <select name="status" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-gray-50 focus:bg-white transition-colors">
                <option value="draft">Bản nháp (Chưa hiển thị)</option>
                <option value="published">Xuất bản ngay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Đường dẫn tĩnh (Slug)</label>
              <input type="text" name="slug" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono text-gray-600 bg-gray-50 focus:bg-white" placeholder="Để trống tự tạo từ tiêu đề" />
              <p className="text-[11px] text-gray-500 mt-1.5">URL: /news/<strong>[slug]</strong></p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ảnh bìa (Cover)</label>
              <ImageUpload name="coverImageUrl" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <SubmitButton text="Đăng bài viết" />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

