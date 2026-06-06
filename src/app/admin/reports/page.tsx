import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Báo cáo' }

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import ReportClient from './ReportClient'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getSession()
  const { month } = await searchParams
  
  // Default to current month YYYY-MM
  const currentDate = new Date()
  const currentMonth = month || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  
  const [yearStr, monthStr] = currentMonth.split('-')
  const startOfMonth = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
  const endOfMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999)

  const users = await prisma.user.findMany({
    include: {
      assignedTasks: {
        where: {
          status: 'DONE',
          completedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          }
        },
        include: {
          project: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  const reportData = users.map(user => {
    const doneTasks = user.assignedTasks
    const doneTasksCount = doneTasks.length
    
    let totalBasePoints = 0
    let totalBonus = 0
    let totalPenalty = 0
    let totalFinalPoint = 0
    let overdueTasksCount = 0
    let reopenedTasksCount = 0

    const tasks = doneTasks.map(t => {
      const hasBeenReviewed = t.pointActual !== 0 || t.bonusPoint > 0 || t.penaltyPoint > 0 || t.pointReason
      const basePoint = hasBeenReviewed ? t.pointActual : t.pointEstimate
      const finalPoint = basePoint + t.bonusPoint - t.penaltyPoint

      totalBasePoints += basePoint
      totalBonus += t.bonusPoint
      totalPenalty += t.penaltyPoint
      totalFinalPoint += finalPoint

      const isOverdue = !!(t.completedAt && t.dueDate && t.completedAt > t.dueDate)
      if (isOverdue) {
        overdueTasksCount += 1
      }

      if (t.reopenedCount > 0) {
        reopenedTasksCount += 1
      }

      return {
        title: t.title,
        projectName: t.project.name,
        basePoint,
        bonusPoint: t.bonusPoint,
        penaltyPoint: t.penaltyPoint,
        finalPoint,
        pointReason: t.pointReason,
        completedAt: t.completedAt?.toISOString(),
        isOverdue,
        reopenedCount: t.reopenedCount
      }
    })

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      doneTasksCount,
      totalBasePoints,
      totalBonus,
      totalPenalty,
      totalFinalPoint,
      overdueTasksCount,
      reopenedTasksCount,
      tasks
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Báo cáo Tháng</h1>
      <ReportClient initialMonth={currentMonth} reportData={reportData} />
    </div>
  )
}
