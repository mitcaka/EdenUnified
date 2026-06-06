'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendTaskAssignedNotification } from '@/lib/discord'

async function logActivity(userId: string, taskId: string, actionType: string, oldValue: string, newValue: string) {
  await prisma.activityLog.create({
    data: {
      userId,
      taskId,
      actionType,
      oldValue,
      newValue
    }
  })
}

// MEMBER: Start task
export async function startTask(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  if (task.assigneeId !== session.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này' }
  }

  if (task.status !== 'TODO' && task.status !== 'BACKLOG') {
    return { error: 'Trạng thái không hợp lệ để bắt đầu' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'DOING' }
  })

  await logActivity(session.id, taskId, 'START_TASK', task.status, 'DOING')
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}

// MEMBER: Send to test
export async function sendToTest(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  if (task.assigneeId !== session.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này' }
  }

  if (task.status !== 'DOING') {
    return { error: 'Chỉ có thể gửi Test khi đang Doing' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'NEED_TEST' }
  })

  await logActivity(session.id, taskId, 'SEND_TO_TEST', task.status, 'NEED_TEST')
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}

// MEMBER: Send to review
export async function sendToReview(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  if (task.assigneeId !== session.id) {
    return { error: 'Bạn không có quyền thực hiện thao tác này' }
  }

  if (task.status !== 'NEED_TEST') {
    return { error: 'Chỉ có thể gửi Review từ bước Need Test' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'NEED_REVIEW' }
  })

  await logActivity(session.id, taskId, 'SEND_TO_REVIEW', task.status, 'NEED_REVIEW')
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}

// ADMIN/OWNER: Mark Done
export async function markDone(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const isOwnerOrAdmin = session.role === 'OWNER' || session.role === 'ADMIN'

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  const isReviewer = task.reviewerId === session.id

  if (!isOwnerOrAdmin && !isReviewer) {
    return { error: 'Bạn không có quyền duyệt task này' }
  }

  if (task.status !== 'NEED_REVIEW') {
    return { error: 'Task phải ở trạng thái Need Review' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { 
      status: 'DONE',
      completedAt: new Date()
    }
  })

  await logActivity(session.id, taskId, 'MARK_DONE', task.status, 'DONE')
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}

// ADMIN/OWNER: Return to Doing
export async function returnToDoing(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const isOwnerOrAdmin = session.role === 'OWNER' || session.role === 'ADMIN'

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  const isReviewer = task.reviewerId === session.id

  if (!isOwnerOrAdmin && !isReviewer) {
    return { error: 'Bạn không có quyền reject task này' }
  }

  if (task.status !== 'NEED_REVIEW' && task.status !== 'NEED_TEST') {
    return { error: 'Trạng thái không hợp lệ' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'DOING' }
  })

  await logActivity(session.id, taskId, 'RETURN_TO_DOING', task.status, 'DOING')
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}

// QUICK ASSIGN TO SELF
export async function quickAssignToSelf(taskId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role === 'VIEWER') return { error: 'Bạn không có quyền thực hiện thao tác này' }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: 'Not found' }

  if (task.assigneeId) {
    return { error: 'Task này đã có người nhận' }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { 
      assigneeId: session.id,
      status: task.status === 'BACKLOG' ? 'TODO' : task.status
    }
  })

  await logActivity(session.id, taskId, 'QUICK_ASSIGN', 'Unassigned', session.id)
  await sendTaskAssignedNotification(updatedTask.id, session.id)
  
  revalidatePath('/')
  revalidatePath('/tasks')
  return { success: true }
}
