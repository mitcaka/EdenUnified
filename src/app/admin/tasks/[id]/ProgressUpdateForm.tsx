'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, FileText, Image as ImageIcon, Film, Link2, ExternalLink } from 'lucide-react'
import SubmitButton from '@/components/ui/SubmitButton'
import EvidenceUpload from '@/components/ui/EvidenceUpload'
import {
  addTaskProgressUpdate,
  submitTaskForTest,
  submitTaskForReview,
} from '@/app/actions/progress'

import RichTextEditor from '@/components/ui/RichTextEditor'

interface ProgressFormProps {
  taskId: string
  taskStatus: string
  isAssignee: boolean
  isOwnerOrAdmin: boolean
}

export default function ProgressUpdateForm({ taskId, taskStatus, isAssignee, isOwnerOrAdmin }: ProgressFormProps) {
  const canUpdate = isAssignee || isOwnerOrAdmin
  if (!canUpdate || taskStatus === 'DONE' || taskStatus === 'CANCELLED') return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-500" /> Gửi cập nhật tiến độ
      </h3>

      <form className="space-y-4">
        <input type="hidden" name="taskId" value={taskId} />

        <div>
          <RichTextEditor 
            name="content" 
            placeholder="Ghi chú cập nhật tiến độ của bạn..."
            minHeight="150px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            <ImageIcon size={14} className="text-gray-400" />
            Minh chứng đính kèm (ảnh, video hoặc link)
          </label>
          <EvidenceUpload name="evidenceUrls" folder="Team_Media/tasks" />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 sm:gap-3">
          <SubmitButton formAction={addTaskProgressUpdate} text="Thêm ghi chú" icon={<MessageSquare />} variant="secondary" />

          {taskStatus === 'DOING' && (
            <SubmitButton formAction={submitTaskForTest} text="Gửi Test" icon={<CheckCircle />} />
          )}
          {taskStatus === 'NEED_TEST' && (
            <SubmitButton formAction={submitTaskForReview} text="Gửi Review" icon={<FileText />} />
          )}
        </div>
      </form>
    </div>
  )
}
