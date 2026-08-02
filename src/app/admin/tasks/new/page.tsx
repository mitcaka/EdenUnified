import { createTask } from '@/app/actions/task'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArrowLeft, Save, Layout, AlignLeft, Settings, Link as LinkIcon, Folder, Users, AlertCircle, Clock } from 'lucide-react'
import SubmitButton from '@/components/ui/SubmitButton'
import RichTextEditor from '@/components/ui/RichTextEditor'
import EvidenceUpload from '@/components/ui/EvidenceUpload'

export default async function NewTaskPage() {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    redirect('/tasks')
  }

  const [projects, users] = await Promise.all([
    prisma.project.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tasks" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tạo công việc mới</h1>
        </div>
      </div>

      <form action={createTask} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Layout className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc <span className="text-red-500">*</span></label>
                <input name="title" type="text" required placeholder="Nhập tên công việc..." className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <RichTextEditor name="description" placeholder="Nhập mô tả công việc..." minHeight="200px" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Liên kết & Tệp đính kèm</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tệp đính kèm (Tài liệu, ảnh, video...)</label>
                <EvidenceUpload name="evidenceUrl" folder="Team_Media/tasks" />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Settings className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Phân loại</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Folder className="h-4 w-4 text-gray-400" /> Dự án <span className="text-red-500">*</span>
                </label>
                <select name="projectId" required className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                  <option value="">-- Chọn dự án --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input name="category" type="text" placeholder="VD: Bug, Feature..." className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select name="status" defaultValue="TODO" required className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                    <option value="BACKLOG">BACKLOG</option>
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="NEED_REVIEW">NEED_REVIEW</option>
                    <option value="NEED_TEST">NEED_TEST</option>
                    <option value="DONE">DONE</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <AlertCircle className="h-4 w-4 text-gray-400" /> Ưu tiên
                  </label>
                  <select name="priority" defaultValue="MEDIUM" required className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Nhân sự</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
                <select name="assigneeId" className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                  <option value="">-- Không gán --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đánh giá (Reviewer)</label>
                <select name="reviewerId" className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer">
                  <option value="">-- Không gán --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Thời gian & Điểm</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
                <input name="dueDate" type="date" className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimate (pt)</label>
                  <input name="pointEstimate" type="number" min="0" defaultValue="0" className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual (pt)</label>
                  <input name="pointActual" type="number" min="0" defaultValue="0" className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm Thưởng (+)</label>
                  <input name="bonusPoint" type="number" min="0" defaultValue="0" className="block w-full rounded-xl border-gray-200 bg-green-50/50 text-green-700 px-3 py-2.5 text-sm focus:border-green-500 focus:bg-green-50 focus:ring-2 focus:ring-green-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm Phạt (-)</label>
                  <input name="penaltyPoint" type="number" min="0" defaultValue="0" className="block w-full rounded-xl border-gray-200 bg-red-50/50 text-red-700 px-3 py-2.5 text-sm focus:border-red-500 focus:bg-red-50 focus:ring-2 focus:ring-red-200 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do Thưởng/Phạt</label>
                <input name="pointReason" type="text" placeholder="Ghi chú lý do..." className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
              </div>
            </div>
          </div>

          <SubmitButton text="Lưu Công Việc Mới" />
        </div>

      </form>
    </div>
  )
}
