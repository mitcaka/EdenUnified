import { prisma } from './prisma'

export function getCurrentMonthRange() {
  const currentDate = new Date()
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startOfMonth, endOfMonth, currentDate }
}

export async function getMyWorkData(userId: string) {
  const { startOfMonth, endOfMonth, currentDate } = getCurrentMonthRange()

  // Task assigneeId = currentUser.id, chưa Done/Cancelled
  const rawTasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: { notIn: ['DONE', 'CANCELLED'] }
    },
    include: { 
      project: true,
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  })

  // Sắp xếp:
  // 1. Overdue trước
  // 2. CRITICAL/HIGH trước
  // 3. dueDate gần nhất trước
  // 4. Doing trước Todo/Backlog
  const sortedTasks = rawTasks.sort((a, b) => {
    const aOverdue = a.dueDate && a.dueDate < currentDate ? 1 : 0
    const bOverdue = b.dueDate && b.dueDate < currentDate ? 1 : 0
    if (aOverdue !== bOverdue) return bOverdue - aOverdue

    const aUrgent = a.priority === 'HIGH' || a.priority === 'CRITICAL' ? 1 : 0
    const bUrgent = b.priority === 'HIGH' || b.priority === 'CRITICAL' ? 1 : 0
    if (aUrgent !== bUrgent) return bUrgent - aUrgent

    if (a.dueDate && b.dueDate) {
      if (a.dueDate.getTime() !== b.dueDate.getTime()) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
    } else if (a.dueDate) return -1
    else if (b.dueDate) return 1

    const aDoing = a.status === 'DOING' ? 1 : 0
    const bDoing = b.status === 'DOING' ? 1 : 0
    if (aDoing !== bDoing) return bDoing - aDoing

    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const myTasks = sortedTasks.slice(0, 20)

  // B. Cần xử lý gấp
  const threeDaysLater = new Date(currentDate)
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)
  
  const urgentTasks = sortedTasks.filter(t => {
    if (t.dueDate && t.dueDate < currentDate) return true // Overdue
    if (t.priority === 'HIGH' || t.priority === 'CRITICAL') return true
    if (t.dueDate && t.dueDate <= threeDaysLater) return true
    return false
  }).slice(0, 10)

  // C. Đang làm
  const doingTasks = sortedTasks.filter(t => t.status === 'DOING').slice(0, 10)

  // D. Chờ review/test
  const waitingTasks = sortedTasks.filter(t => t.status === 'NEED_TEST' || t.status === 'NEED_REVIEW').slice(0, 10)

  // E. Hoàn thành gần đây (trong tháng)
  const doneTasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: 'DONE',
      completedAt: { gte: startOfMonth, lte: endOfMonth }
    },
    include: { 
      project: true,
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { completedAt: 'desc' },
    take: 5
  })

  // F. Thống kê cá nhân
  const stats = {
    openAssignedTasks: rawTasks.length,
    doingTasksCount: doingTasks.length,
    overdueTasksCount: rawTasks.filter(t => t.dueDate && t.dueDate < currentDate).length,
    doneTasksMonth: await prisma.task.count({
      where: { assigneeId: userId, status: 'DONE', completedAt: { gte: startOfMonth, lte: endOfMonth } }
    }),
    totalPointsMonth: 0, // Tính sau
    waitingReviewCount: rawTasks.filter(t => t.status === 'NEED_REVIEW').length,
    criticalOpenCount: rawTasks.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length
  }

  const allDoneThisMonth = await prisma.task.findMany({
    where: { assigneeId: userId, status: 'DONE', completedAt: { gte: startOfMonth, lte: endOfMonth } },
    select: { pointActual: true, pointEstimate: true, bonusPoint: true, penaltyPoint: true }
  })

  stats.totalPointsMonth = allDoneThisMonth.reduce((sum, t) => {
    const hasBeenReviewed = t.pointActual !== 0 || t.bonusPoint > 0 || t.penaltyPoint > 0
    const base = hasBeenReviewed ? t.pointActual : t.pointEstimate
    return sum + base + t.bonusPoint - t.penaltyPoint
  }, 0)

  return { myTasks, urgentTasks, doingTasks, waitingTasks, doneTasks, stats }
}

export async function getManagementData(userId: string) {
  const { startOfMonth, endOfMonth, currentDate } = getCurrentMonthRange()

  // A. Khu vực Cần review (Need Review hoặc reviewer là user)
  const rawReviewQueue = await prisma.task.findMany({
    where: {
      status: 'NEED_REVIEW'
    },
    include: { 
      project: true, 
      assignee: { select: { id: true, name: true, username: true, role: true } },
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
  })

  const reviewQueue = rawReviewQueue.sort((a, b) => {
    const aUrgent = a.priority === 'HIGH' || a.priority === 'CRITICAL' ? 1 : 0
    const bUrgent = b.priority === 'HIGH' || b.priority === 'CRITICAL' ? 1 : 0
    if (aUrgent !== bUrgent) return bUrgent - aUrgent

    const aOverdue = a.dueDate && a.dueDate < currentDate ? 1 : 0
    const bOverdue = b.dueDate && b.dueDate < currentDate ? 1 : 0
    if (aOverdue !== bOverdue) return bOverdue - aOverdue

    return a.updatedAt.getTime() - b.updatedAt.getTime() // Cũ nhất trước
  }).slice(0, 20)

  // B. Quản lý gấp
  const sevenDaysAgo = new Date(currentDate)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const threeDaysAgo = new Date(currentDate)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const urgentManagement = await prisma.task.findMany({
    where: {
      status: { notIn: ['DONE', 'CANCELLED'] },
      OR: [
        { dueDate: { lt: currentDate } },
        { priority: { in: ['HIGH', 'CRITICAL'] } },
        { assigneeId: null },
        { status: 'BACKLOG', updatedAt: { lt: sevenDaysAgo } },
        { status: 'NEED_REVIEW', updatedAt: { lt: threeDaysAgo } }
      ]
    },
    include: { 
      project: true, 
      assignee: { select: { id: true, name: true, username: true, role: true } },
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { dueDate: 'asc' },
    take: 10
  })

  // C. Ai đang làm gì
  const usersWithDoing = await prisma.user.findMany({
    where: {
      assignedTasks: { some: { status: 'DOING' } }
    },
    include: {
      assignedTasks: {
        where: { status: 'DOING' },
        orderBy: { updatedAt: 'desc' },
        take: 3
      }
    }
  })

  const teamDoingGrouped = usersWithDoing.map(u => ({
    userId: u.id,
    name: u.name,
    doingCount: u.assignedTasks.length, // Wait, this is just the count of the top 3 unless we run a separate count.
    // Actually we can count the relation
    _count: { assignedTasks: 0 },
    recentDoing: u.assignedTasks
  }))
  // Let's get actual counts
  const doingCounts = await prisma.task.groupBy({
    by: ['assigneeId'],
    where: { status: 'DOING', assigneeId: { not: null } },
    _count: { id: true }
  })
  teamDoingGrouped.forEach(u => {
    const match = doingCounts.find(d => d.assigneeId === u.userId)
    u._count.assignedTasks = match ? match._count.id : 0
  })

  // D. Task mới gần đây
  const recentTasks = await prisma.task.findMany({
    include: { 
      project: true, 
      assignee: { select: { id: true, name: true, username: true, role: true } },
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // F. Thống kê quản lý
  const [totalOpen, doneMonth, needReview, overdue, criticalOpen, unassigned] = await Promise.all([
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] } } }),
    prisma.task.count({ where: { status: 'DONE', completedAt: { gte: startOfMonth, lte: endOfMonth } } }),
    prisma.task.count({ where: { status: 'NEED_REVIEW' } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: currentDate } } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, priority: { in: ['HIGH', 'CRITICAL'] } } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, assigneeId: null } })
  ])

  // Tính điểm team
  const allTeamDone = await prisma.task.findMany({
    where: { status: 'DONE', completedAt: { gte: startOfMonth, lte: endOfMonth }, assigneeId: { not: null } },
    select: { pointActual: true, pointEstimate: true, bonusPoint: true, penaltyPoint: true, assignee: { select: { id: true, name: true } } }
  })

  let totalTeamPointsMonth = 0
  const userPoints: Record<string, { name: string, points: number }> = {}

  allTeamDone.forEach(t => {
    const hasBeenReviewed = t.pointActual !== 0 || t.bonusPoint > 0 || t.penaltyPoint > 0
    const base = hasBeenReviewed ? t.pointActual : t.pointEstimate
    const finalPoint = base + t.bonusPoint - t.penaltyPoint
    totalTeamPointsMonth += finalPoint
    
    if (t.assignee) {
      if (!userPoints[t.assignee.id]) userPoints[t.assignee.id] = { name: t.assignee.name, points: 0 }
      userPoints[t.assignee.id].points += finalPoint
    }
  })

  const top3Members = Object.values(userPoints).sort((a, b) => b.points - a.points).slice(0, 3)

  const stats = {
    totalOpen, doneMonth, needReview, overdue, criticalOpen, unassigned, totalTeamPointsMonth, top3Members
  }

  return { reviewQueue, urgentManagement, teamDoingGrouped, recentTasks, stats }
}

export async function getViewerData() {
  const { startOfMonth, endOfMonth, currentDate } = getCurrentMonthRange()

  const doingTasks = await prisma.task.findMany({
    where: { status: 'DOING' },
    include: { 
      project: true, 
      assignee: { select: { id: true, name: true, username: true, role: true } },
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  })

  const doneRecent = await prisma.task.findMany({
    where: { status: 'DONE' },
    include: { 
      project: true, 
      assignee: { select: { id: true, name: true, username: true, role: true } },
      progressUpdates: { take: 1, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { completedAt: 'desc' },
    take: 10
  })

  const [totalOpen, doneMonth, overdue, criticalOpen] = await Promise.all([
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] } } }),
    prisma.task.count({ where: { status: 'DONE', completedAt: { gte: startOfMonth, lte: endOfMonth } } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: currentDate } } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, priority: { in: ['HIGH', 'CRITICAL'] } } })
  ])

  return { doingTasks, doneRecent, stats: { totalOpen, doneMonth, overdue, criticalOpen } }
}
