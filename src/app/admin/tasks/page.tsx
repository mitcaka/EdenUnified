import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Công việc' }

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import TaskFilters from './TaskFilters'
import { AlertCircle, Clock, MessageSquare, Paperclip, MoreVertical } from 'lucide-react'

const COLUMNS = [
  { id: 'BACKLOG', name: 'Backlog', color: 'bg-gray-100' },
  { id: 'TODO', name: 'To Do', color: 'bg-slate-100' },
  { id: 'DOING', name: 'Doing', color: 'bg-blue-50' },
  { id: 'NEED_REVIEW', name: 'Need Review', color: 'bg-purple-50' },
  { id: 'NEED_TEST', name: 'Need Test', color: 'bg-orange-50' },
  { id: 'DONE', name: 'Done', color: 'bg-green-50' },
  { id: 'CANCELLED', name: 'Cancelled', color: 'bg-gray-50' }
]

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; assigneeId?: string; projectId?: string; priority?: string; category?: string }>
}) {
  const session = await getSession()
  const isOwnerOrAdmin = session?.role === 'OWNER' || session?.role === 'ADMIN'

  const { q, assigneeId, projectId, priority, category } = await searchParams

  const tasks = await prisma.task.findMany({
    where: {
      title: q ? { contains: q } : undefined,
      assigneeId: assigneeId ? assigneeId : undefined,
      projectId: projectId ? projectId : undefined,
      priority: priority ? priority : undefined,
      category: category ? { contains: category } : undefined,
    },
    include: {
      project: true,
      assignee: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const now = Date.now()

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-6rem)]">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bảng Công việc (Kanban)</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 w-full sm:w-auto">
            <TaskFilters users={users} projects={projects} />
          </div>
          {isOwnerOrAdmin && (
            <Link
              href="/admin/tasks/new"
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              + Tạo Task
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:overflow-x-auto pb-4">
        <div className="flex flex-col md:flex-row md:h-full gap-4 md:gap-6 w-full md:min-w-max px-1">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className={`flex md:h-full w-full md:w-[320px] shrink-0 flex-col rounded-2xl ${col.color} border border-gray-200/60`}>
                <div className="flex items-center justify-between p-4 shrink-0">
                  <h3 className="font-semibold text-gray-700">{col.name}</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/60 text-xs font-bold text-gray-600 shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                  {columnTasks.map(task => {
                    const isOverdue = task.dueDate && task.dueDate.getTime() < now && task.status !== 'DONE' && task.status !== 'CANCELLED'
                    const isCritical = task.priority === 'HIGH'
                    
                    return (
                      <Link 
                        key={task.id} 
                        href={`/admin/tasks/${task.id}`}
                        className={`group relative flex flex-col rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md border ${isCritical ? 'border-red-300' : 'border-gray-200'}`}
                      >
                        {isCritical && (
                          <div className="absolute -right-1.5 -top-1.5 rounded-full bg-red-100 p-1 ring-4 ring-white">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        <div className="mb-2 flex items-center gap-2">
                          {task.category && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                              {task.category}
                            </span>
                          )}
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                            task.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        <h4 className="mb-3 text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h4>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'font-bold text-red-600' : ''}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>{new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-700">{task.pointActual}</span> pt
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {task.assignee ? (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 ring-2 ring-white" title={task.assignee.name}>
                                {task.assignee.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400" title="Chưa gán">
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  {columnTasks.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200/50 bg-white/20">
                      <p className="text-sm text-gray-400">Trống</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
