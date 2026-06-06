'use client'

import Link from 'next/link'
import { Calendar, AlertCircle, Link as LinkIcon, Folder, User } from 'lucide-react'
import QuickActionButton from './QuickActionButton'
import { startTask, sendToTest, sendToReview, markDone, returnToDoing, quickAssignToSelf } from '@/app/actions/quickTask'

type TaskQuickCardProps = {
  task: any // We'll pass the serialized task from Prisma
  currentUser: { id: string; role: string }
  showAssignee?: boolean
}

export default function TaskQuickCard({ task, currentUser, showAssignee = false }: TaskQuickCardProps) {
  const isAssignee = task.assigneeId === currentUser.id
  const isReviewer = task.reviewerId === currentUser.id
  const isAdminOrOwner = currentUser.role === 'OWNER' || currentUser.role === 'ADMIN'

  // Format date
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : null
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' && task.status !== 'CANCELLED'

  // Determine badge colors
  const statusColors: Record<string, string> = {
    BACKLOG: 'bg-gray-100 text-gray-700',
    TODO: 'bg-slate-100 text-slate-700',
    DOING: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20',
    NEED_TEST: 'bg-purple-100 text-purple-700',
    NEED_REVIEW: 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/20',
    DONE: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-50 text-red-600 line-through'
  }

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-blue-50 text-blue-600',
    HIGH: 'bg-orange-100 text-orange-700 font-bold',
    CRITICAL: 'bg-red-100 text-red-700 font-black animate-pulse'
  }

  return (
    <div className={`group relative bg-white rounded-xl border ${isOverdue ? 'border-red-200 shadow-sm shadow-red-100' : 'border-gray-200'} p-4 hover:shadow-md transition-all min-w-0`}>
      <div className="flex justify-between items-start gap-4 mb-2">
        <Link href={`/admin/tasks/${task.id}`} className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug break-words">
          {task.title}
        </Link>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[task.status] || 'bg-gray-100'}`}>
            {task.status}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.priority] || 'bg-gray-100'}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-3">
        {task.project && (
          <div className="flex items-center gap-1 min-w-0">
            <Folder className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate max-w-[120px] md:max-w-none">{task.project.name}</span>
          </div>
        )}
        
        {dueDateStr && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{dueDateStr}</span>
          </div>
        )}

        {task.category && (
          <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
            {task.category}
          </div>
        )}

        {task.pointEstimate > 0 && (
          <div className="font-medium text-indigo-600">
            {task.pointEstimate}pt
          </div>
        )}

        {showAssignee && task.assignee && (
          <div className="flex items-center gap-1 text-gray-600 font-medium">
            <User className="h-3.5 w-3.5" />
            {task.assignee.name}
          </div>
        )}
        
        {showAssignee && !task.assigneeId && (
          <div className="flex items-center gap-1 text-red-500 font-medium">
            <User className="h-3.5 w-3.5" />
            Chưa có người nhận
          </div>
        )}
      </div>

      {(task.status === 'NEED_REVIEW' || task.status === 'NEED_TEST') && task.progressUpdates && task.progressUpdates.length > 0 && (
        <div className={`mt-2 mb-4 p-3 rounded-lg border ${task.status === 'NEED_REVIEW' ? 'bg-orange-50/50 border-orange-100' : 'bg-purple-50/50 border-purple-100'}`}>
          <p className="text-xs text-gray-700 line-clamp-2">
            <span className={`font-semibold ${task.status === 'NEED_REVIEW' ? 'text-orange-800' : 'text-purple-800'}`}>Ghi chú:</span> {task.progressUpdates[0].content}
          </p>
          {task.progressUpdates[0].evidenceUrls && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-600 font-medium">
              <LinkIcon className="h-3 w-3" /> Có đính kèm minh chứng
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {task.evidenceUrl ? (
            <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Xem tài liệu/Evidence">
              <LinkIcon className="h-4 w-4" />
            </a>
          ) : <div className="w-7"></div>}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {/* Action Buttons Logic */}
          
          {/* MEMBER ACTIONS */}
          {isAssignee && (task.status === 'TODO' || task.status === 'BACKLOG') && (
            <QuickActionButton taskId={task.id} action={startTask} label="Bắt đầu làm" variant="primary" />
          )}
          {isAssignee && task.status === 'DOING' && (
            <QuickActionButton taskId={task.id} action={sendToTest} label="Gửi Test" variant="warning" />
          )}
          {isAssignee && task.status === 'NEED_TEST' && (
            <QuickActionButton taskId={task.id} action={sendToReview} label="Gửi Review" variant="secondary" />
          )}
          {isAssignee && task.status === 'NEED_REVIEW' && !isAdminOrOwner && !isReviewer && (
            <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">Đang chờ Review...</span>
          )}

          {/* ADMIN/OWNER/REVIEWER ACTIONS */}
          {(isAdminOrOwner || isReviewer) && task.status === 'NEED_REVIEW' && (
            <>
              <QuickActionButton taskId={task.id} action={returnToDoing} label="Yêu cầu sửa (Reject)" variant="secondary" />
              <QuickActionButton taskId={task.id} action={markDone} label="Duyệt (Mark Done)" variant="success" />
            </>
          )}

          {/* UNASSIGNED ACTIONS */}
          {!task.assigneeId && task.status !== 'DONE' && task.status !== 'CANCELLED' && (
            <QuickActionButton taskId={task.id} action={quickAssignToSelf} label="Nhận việc này" variant="primary" />
          )}
        </div>
      </div>
    </div>
  )
}
