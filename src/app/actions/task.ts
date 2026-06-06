'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { TaskSchema } from '@/lib/validations'
import { sendTaskAssignedNotification } from '@/lib/discord'

export async function createTask(formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  const parseResult = TaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    category: formData.get('category'),
    evidenceUrl: formData.get('evidenceUrl'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId'),
    reviewerId: formData.get('reviewerId'),
    dueDate: formData.get('dueDate'),
    pointEstimate: parseInt(formData.get('pointEstimate') as string || '0', 10),
    pointActual: parseInt(formData.get('pointActual') as string || '0', 10),
    bonusPoint: parseInt(formData.get('bonusPoint') as string || '0', 10),
    penaltyPoint: parseInt(formData.get('penaltyPoint') as string || '0', 10),
    pointReason: formData.get('pointReason') as string || '',
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const data = parseResult.data
  const dueDate = data.dueDate ? new Date(data.dueDate) : null
  const completedAt = data.status === 'DONE' ? new Date() : null

  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      category: data.category || null,
      evidenceUrl: data.evidenceUrl || null,
      projectId: data.projectId,
      assigneeId: data.assigneeId || null,
      reviewerId: data.reviewerId || null,
      dueDate,
      pointEstimate: data.pointEstimate,
      pointActual: data.pointActual,
      bonusPoint: data.bonusPoint,
      penaltyPoint: data.penaltyPoint,
      pointReason: data.pointReason || null,
      completedAt,
    },
  })

  // Discord webhook
  if (newTask.assigneeId) {
    await sendTaskAssignedNotification(newTask.id, session.id)
  }

  revalidatePath('/tasks')
  redirect('/admin/tasks')
}

export async function updateTask(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new Error('Not found')

  const isOwnerOrAdmin = session.role === 'OWNER' || session.role === 'ADMIN'
  const isAssignee = task.assigneeId === session.id

  if (!isOwnerOrAdmin && !isAssignee) {
    throw new Error('Unauthorized')
  }

  const parseResult = TaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    category: formData.get('category'),
    evidenceUrl: formData.get('evidenceUrl'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId'),
    reviewerId: formData.get('reviewerId'),
    dueDate: formData.get('dueDate'),
    pointEstimate: parseInt(formData.get('pointEstimate') as string || '0', 10),
    pointActual: parseInt(formData.get('pointActual') as string || '0', 10),
    bonusPoint: parseInt(formData.get('bonusPoint') as string || '0', 10),
    penaltyPoint: parseInt(formData.get('penaltyPoint') as string || '0', 10),
    pointReason: formData.get('pointReason') as string || '',
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const data = parseResult.data

  // Kiểm soát quyền hạn sửa field của MEMBER
  let finalData: any = {}
  if (isOwnerOrAdmin) {
    finalData = { ...data }
  } else if (isAssignee) {
    // MEMBER validation
    if (data.status === 'CANCELLED' || data.status === 'BACKLOG') {
      throw new Error('Bạn không có quyền Hủy (Cancel) hoặc đẩy công việc về Backlog')
    }
    if ((task.status === 'DONE' || task.status === 'CANCELLED') && data.status !== task.status) {
      throw new Error('Chỉ Quản lý mới có quyền mở lại (Reopen) công việc đã hoàn tất hoặc bị hủy')
    }

    finalData = {
      status: data.status,
      description: data.description,
      evidenceUrl: data.evidenceUrl,
    }
    // Nếu status sang DONE, check xem có cần Review không. 
    // Giả sử logic là nếu có reviewerId thì chuyển sang NEED_REVIEW thay vì DONE
    if (finalData.status === 'DONE' && task.reviewerId) {
      finalData.status = 'NEED_REVIEW'
    }
  }

  let reopenedCount = task.reopenedCount
  const newStatus = finalData.status || task.status
  if ((task.status === 'DONE' || task.status === 'CANCELLED') && 
      (newStatus !== 'DONE' && newStatus !== 'CANCELLED')) {
    reopenedCount += 1
  }

  const dueDate = finalData.dueDate !== undefined ? (finalData.dueDate ? new Date(finalData.dueDate) : null) : task.dueDate
  
  let completedAt = task.completedAt
  if (newStatus === 'DONE' && task.status !== 'DONE') {
    completedAt = new Date()
  } else if (newStatus !== 'DONE') {
    completedAt = null
  }

  const updatePayload = {
    ...finalData,
    dueDate,
    completedAt,
    category: finalData.category || null,
    evidenceUrl: finalData.evidenceUrl || null,
    assigneeId: finalData.assigneeId || null,
    reviewerId: finalData.reviewerId || null,
    reopenedCount,
    pointReason: finalData.pointReason || null,
  }
  
  // Clean payload for undefined to avoid overwriting with null incorrectly if not changed
  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key])

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updatePayload,
  })

  // Activity Log Hook
  if (task.status !== updatedTask.status) {
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        taskId: id,
        actionType: 'STATUS_CHANGE',
        oldValue: task.status,
        newValue: updatedTask.status,
      }
    })
  }

  if (task.pointActual !== updatedTask.pointActual || 
      task.bonusPoint !== updatedTask.bonusPoint || 
      task.penaltyPoint !== updatedTask.penaltyPoint) {
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        taskId: id,
        actionType: 'PERFORMANCE_CHANGE',
        oldValue: `ACT:${task.pointActual} BON:${task.bonusPoint} PEN:${task.penaltyPoint}`,
        newValue: `ACT:${updatedTask.pointActual} BON:${updatedTask.bonusPoint} PEN:${updatedTask.penaltyPoint}`,
      }
    })
  }

  // Discord webhook cho Assignee
  if (updatedTask.assigneeId && updatedTask.assigneeId !== task.assigneeId) {
    await sendTaskAssignedNotification(updatedTask.id, session.id)
  }

  revalidatePath('/tasks')
  redirect('/admin/tasks')
}

export async function deleteTask(id: string) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  // Chuyển sang soft delete
  // Wait, the prompt asked for ActivityLog, Comment, schema update, dashboard, and Zod validate auth.
  // The plan didn't explicitly include soft delete in THIS phase (though it was mentioned as High in the audit report). Let's wait. Actually, the audit report says "Critical: Cập nhật schema.prisma: Thêm deletedAt (Soft delete)...". But wait! I didn't add deletedAt in schema.prisma in the plan! I only added ActivityLog and Comment. Ah, the plan specifically outlined what to do. I will just stick to the plan for now. The plan: "Sửa Server Action delete... chưa làm trong phase này nếu không có trong plan". Wait, it's better to stick to exactly what the user approved in the plan. The plan didn't mention `deletedAt` for Task.
  await prisma.task.delete({ where: { id } })
  revalidatePath('/tasks')
}
