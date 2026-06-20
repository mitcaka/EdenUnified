import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Activity, MessageSquare, AlertCircle, FileText, CheckCircle, RefreshCcw, Edit, XCircle, ImageIcon, Film, Link2 } from 'lucide-react'
import SubmitButton from '@/components/ui/SubmitButton'
import ProgressUpdateForm from './ProgressUpdateForm'
import {
  reviewTaskDone,
  requestTaskChanges
} from '@/app/actions/progress'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      assignee: true,
      reviewer: true,
      progressUpdates: {
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      },
      activityLogs: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!task) notFound()

  const isOwnerOrAdmin = session.role === 'OWNER' || session.role === 'ADMIN'
  const isAssignee = task.assigneeId === session.id
  const isReviewer = task.reviewerId === session.id || isOwnerOrAdmin

  if (!isOwnerOrAdmin && !isAssignee && !isReviewer && session.role !== 'VIEWER') {
    return (
      <div className="flex h-64 flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Bạn không có quyền xem nhiệm vụ này.</h2>
        <Link href="/admin/tasks" className="mt-4 text-blue-600 hover:underline">Quay lại trang chủ</Link>
      </div>
    )
  }

  const parseEvidenceLinks = (urls?: string | null) => {
    if (!urls) return []
    return urls.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tasks" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chi tiết công việc</h1>
        </div>
        {canEditTask(session.role, task.assigneeId, session.id) && (
          <Link href={`/admin/tasks/${task.id}/edit`} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border hover:bg-gray-50">
            <Edit className="h-4 w-4" /> Sửa thông tin
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Nội dung chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`rounded px-2.5 py-1 text-xs font-bold tracking-wider ${
                task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                task.status === 'NEED_REVIEW' || task.status === 'NEED_TEST' ? 'bg-orange-100 text-orange-700' :
                task.status === 'DOING' ? 'bg-blue-100 text-blue-700' :
                task.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {task.status}
              </span>
              <span className="text-sm font-semibold text-gray-500">{task.project.name}</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h2>

            <div className="prose prose-sm max-w-none text-gray-600 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[100px] whitespace-pre-wrap">
              {task.description || <span className="italic text-gray-400">Không có mô tả</span>}
            </div>
          </div>

          {/* Form cập nhật tiến độ — Client Component */}
          <ProgressUpdateForm
            taskId={task.id}
            taskStatus={task.status}
            isAssignee={isAssignee}
            isOwnerOrAdmin={isOwnerOrAdmin}
          />

          {/* Form Review cho ADMIN/REVIEWER */}
          {isReviewer && (task.status === 'NEED_REVIEW' || task.status === 'NEED_TEST') && (
            <div className="bg-orange-50 rounded-2xl shadow-sm border border-orange-200 p-6">
              <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Review nhiệm vụ
              </h3>

              <form className="space-y-4">
                <input type="hidden" name="taskId" value={task.id} />
                <div>
                  <label className="block text-sm font-medium text-orange-900 mb-1">Ghi chú của Reviewer</label>
                  <textarea name="reviewNote" rows={3} placeholder="Nhận xét của bạn..." className="block w-full rounded-xl border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"></textarea>
                </div>

                <div className="w-1/3">
                  <label className="block text-sm font-medium text-orange-900 mb-1">Điểm thực tế (Point Actual)</label>
                  <input name="pointActual" type="number" defaultValue={task.pointEstimate} className="block w-full rounded-xl border-orange-200 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" />
                </div>

                <div className="flex flex-wrap gap-2 pt-2 sm:gap-3">
                  <SubmitButton formAction={reviewTaskDone} text="Duyệt hoàn thành" icon={<CheckCircle />} variant="primary" />
                  <SubmitButton formAction={requestTaskChanges} text="Yêu cầu sửa lại (Trả về DOING)" icon={<RefreshCcw />} variant="danger" />
                </div>
              </form>
            </div>
          )}

          {/* Cập nhật tiến độ (Progress Timeline) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-400" /> Lịch sử cập nhật
            </h3>

            <div className="space-y-6">
              {task.progressUpdates.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">Chưa có cập nhật nào.</p>
              ) : (
                task.progressUpdates.map(update => (
                  <div key={update.id} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {update.author.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {update.author.name}
                          <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{update.author.role}</span>
                        </h4>
                        <span className="text-xs text-gray-500">
                          {update.createdAt.toLocaleString('vi-VN')}
                        </span>
                      </div>

                      {update.statusTo && (
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100 mt-1 mb-2">
                          Đã chuyển trạng thái: {update.statusFrom} ➔ {update.statusTo}
                        </div>
                      )}

                      <div className={`text-sm text-gray-700 whitespace-pre-wrap p-3 rounded-xl border ${update.type === 'REVIEW_NOTE' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                        {update.content}
                      </div>

                      {/* Evidence — inline media preview */}
                      {update.evidenceUrls && (
                        <EvidenceDisplay evidenceUrls={update.evidenceUrls} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Sidebar Metadata & Activity Log */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Thông tin chung</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Người thực hiện</p>
                <p className="text-sm font-semibold text-gray-900">{task.assignee?.name || 'Chưa gán'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Người duyệt (Reviewer)</p>
                <p className="text-sm font-semibold text-gray-900">{task.reviewer?.name || 'Bất kỳ Admin nào'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Độ ưu tiên</p>
                <p className={`text-sm font-semibold ${task.priority === 'HIGH' ? 'text-red-600' : 'text-gray-900'}`}>{task.priority}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Hạn chót (Due Date)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {task.dueDate ? task.dueDate.toLocaleDateString('vi-VN') : 'Không có'}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Điểm dự kiến</p>
                  <p className="text-lg font-bold text-gray-900">{task.pointEstimate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Điểm thực tế</p>
                  <p className="text-lg font-bold text-green-600">{task.pointActual}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4" /> Activity Log
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {task.activityLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Không có lịch sử.</p>
              ) : (
                task.activityLogs.map(log => (
                  <div key={log.id} className="text-xs text-gray-600 border-l-2 border-gray-200 pl-3 py-1">
                    <p className="font-semibold text-gray-900">{log.user?.name || 'Unknown'}</p>
                    <p>
                      {log.actionType === 'STATUS_CHANGE' && `Đổi trạng thái: ${log.oldValue} ➔ ${log.newValue}`}
                      {log.actionType === 'ASSIGNEE_CHANGE' && `Đổi người làm`}
                      {log.actionType === 'MARK_DONE' && `Đã duyệt hoàn thành`}
                      {log.actionType === 'REQUEST_CHANGES' && `Đã yêu cầu sửa lại`}
                    </p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{log.createdAt.toLocaleString('vi-VN')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function canEditTask(role: string, assigneeId: string | null, userId: string) {
  return role === 'OWNER' || role === 'ADMIN' || assigneeId === userId
}

// ─── Inline evidence display (images/videos/links) ───────────────────────────
function EvidenceDisplay({ evidenceUrls }: { evidenceUrls: string }) {
  const links = evidenceUrls.split('\n').map(l => l.trim()).filter(Boolean)
  if (links.length === 0) return null

  const isVideo = (url: string) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
    return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)
  }
  const isImage = (url: string) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
    // BUG FIX: thêm dấu ngoặc để tránh operator precedence sai (&& chạy trước ||)
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
      || (url.includes('/api/media/') && !isVideo(url))
  }

  const images = links.filter(isImage)
  const videos = links.filter(isVideo)
  const urls = links.filter(u => !isImage(u) && !isVideo(u))

  return (
    <div className="mt-3 space-y-3">
      {/* Images grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>📸</span> Ảnh minh chứng
          </p>
          <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={url}
                  alt={`Minh chứng ${i + 1}`}
                  loading="lazy"
                  className="w-full rounded-lg border border-gray-200 object-cover max-h-48 hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>🎬</span> Video minh chứng
          </p>
          <div className="space-y-2">
            {videos.map((url, i) => (
              <video
                key={i}
                src={url}
                controls
                className="w-full rounded-lg border border-gray-200 max-h-64 bg-black"
                preload="metadata"
              />
            ))}
          </div>
        </div>
      )}

      {/* External URLs */}
      {urls.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>🔗</span> Link minh chứng
          </p>
          <ul className="space-y-1">
            {urls.map((url, i) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
                >
                  <Link2 size={11} className="shrink-0" />
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
