'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { sendTaskReviewRequestedNotification, sendTaskDoneNotification, sendTaskReturnedNotification } from '@/lib/discord'

async function checkPermission(taskId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const task = await prisma.task.findUnique({
    where: { id: taskId }
  })
  
  if (!task) throw new Error('Task not found')

  const isOwnerOrAdmin = session.role === 'OWNER' || session.role === 'ADMIN'
  const isAssignee = task.assigneeId === session.id
  const isReviewer = task.reviewerId === session.id

  return { session, task, isOwnerOrAdmin, isAssignee, isReviewer }
}

export async function addTaskProgressUpdate(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const content = formData.get('content') as string
  const evidenceUrls = formData.get('evidenceUrls') as string

  if (!taskId || !content.trim()) {
    throw new Error('Nội dung không được để trống')
  }

  const { session, task, isOwnerOrAdmin, isAssignee } = await checkPermission(taskId)

  if (!isOwnerOrAdmin && !isAssignee) {
    throw new Error('Bạn không có quyền cập nhật tiến độ công việc này')
  }

  await prisma.$transaction(async (tx) => {
    await tx.taskProgressUpdate.create({
      data: {
        taskId,
        authorId: session.id,
        content: content.trim(),
        evidenceUrls: evidenceUrls?.trim() || null,
        type: 'PROGRESS'
      }
    })
  })

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function submitTaskForTest(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const content = formData.get('content') as string
  const evidenceUrls = formData.get('evidenceUrls') as string

  if (!taskId || !content.trim()) {
    throw new Error('Bạn phải nhập ghi chú khi gửi Test')
  }

  const { session, task, isOwnerOrAdmin, isAssignee } = await checkPermission(taskId)

  if (!isOwnerOrAdmin && !isAssignee) {
    throw new Error('Bạn không có quyền cập nhật công việc này')
  }

  if (task.status !== 'DOING' && task.status !== 'TODO' && task.status !== 'BACKLOG') {
    throw new Error('Chỉ có thể gửi Test khi đang làm (DOING)')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: 'NEED_TEST' }
    })

    await tx.taskProgressUpdate.create({
      data: {
        taskId,
        authorId: session.id,
        content: content.trim(),
        evidenceUrls: evidenceUrls?.trim() || null,
        type: 'PROGRESS',
        statusFrom: task.status,
        statusTo: 'NEED_TEST'
      }
    })

    await tx.activityLog.create({
      data: {
        taskId,
        userId: session.id,
        actionType: 'STATUS_CHANGE',
        oldValue: task.status,
        newValue: 'NEED_TEST'
      }
    })
  })

  // Discord webhook
  await sendTaskReviewRequestedNotification(taskId, session.id, content.trim(), !!evidenceUrls)

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function submitTaskForReview(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const content = formData.get('content') as string
  const evidenceUrls = formData.get('evidenceUrls') as string

  if (!taskId || !content.trim()) {
    throw new Error('Bạn phải nhập ghi chú khi gửi Review')
  }

  const { session, task, isOwnerOrAdmin, isAssignee } = await checkPermission(taskId)

  if (!isOwnerOrAdmin && !isAssignee) {
    throw new Error('Bạn không có quyền cập nhật công việc này')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: 'NEED_REVIEW' }
    })

    await tx.taskProgressUpdate.create({
      data: {
        taskId,
        authorId: session.id,
        content: content.trim(),
        evidenceUrls: evidenceUrls?.trim() || null,
        type: 'PROGRESS',
        statusFrom: task.status,
        statusTo: 'NEED_REVIEW'
      }
    })

    await tx.activityLog.create({
      data: {
        taskId,
        userId: session.id,
        actionType: 'STATUS_CHANGE',
        oldValue: task.status,
        newValue: 'NEED_REVIEW'
      }
    })
  })

  // Discord webhook
  await sendTaskReviewRequestedNotification(taskId, session.id, content.trim(), !!evidenceUrls)

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function reviewTaskDone(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const reviewNote = formData.get('reviewNote') as string
  const pointActualStr = formData.get('pointActual') as string
  const pointActual = parseInt(pointActualStr || '0', 10)

  if (!taskId) throw new Error('Mã công việc không hợp lệ')

  const { session, task, isOwnerOrAdmin, isReviewer } = await checkPermission(taskId)

  if (!isOwnerOrAdmin && !isReviewer) {
    throw new Error('Bạn không có quyền duyệt công việc này')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { 
        status: 'DONE',
        pointActual,
        completedAt: new Date(),
        reviewerId: task.reviewerId || session.id // Set reviewer if not set
      }
    })

    if (reviewNote?.trim()) {
      await tx.taskProgressUpdate.create({
        data: {
          taskId,
          authorId: session.id,
          content: reviewNote.trim(),
          type: 'REVIEW_NOTE',
          statusFrom: task.status,
          statusTo: 'DONE'
        }
      })
    }

    await tx.activityLog.create({
      data: {
        taskId,
        userId: session.id,
        actionType: 'MARK_DONE',
        oldValue: task.status,
        newValue: 'DONE'
      }
    })
  })

  // Discord webhook
  await sendTaskDoneNotification(taskId, session.id, pointActual, reviewNote?.trim())

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function requestTaskChanges(formData: FormData) {
  const taskId = formData.get('taskId') as string
  const reviewNote = formData.get('reviewNote') as string

  if (!taskId || !reviewNote?.trim()) {
    throw new Error('Bắt buộc nhập lý do trả về')
  }

  const { session, task, isOwnerOrAdmin, isReviewer } = await checkPermission(taskId)

  if (!isOwnerOrAdmin && !isReviewer) {
    throw new Error('Bạn không có quyền duyệt công việc này')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { 
        status: 'DOING',
        reopenedCount: task.reopenedCount + 1,
        completedAt: null
      }
    })

    await tx.taskProgressUpdate.create({
      data: {
        taskId,
        authorId: session.id,
        content: reviewNote.trim(),
        type: 'REVIEW_NOTE',
        statusFrom: task.status,
        statusTo: 'DOING'
      }
    })

    await tx.activityLog.create({
      data: {
        taskId,
        userId: session.id,
        actionType: 'REQUEST_CHANGES',
        oldValue: task.status,
        newValue: 'DOING'
      }
    })
  })

  // Discord webhook
  await sendTaskReturnedNotification(taskId, session.id, reviewNote.trim())

  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  revalidatePath('/')
}
