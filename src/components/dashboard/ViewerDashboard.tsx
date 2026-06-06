'use client'

import { Clock, Medal, CheckSquare, AlertTriangle } from 'lucide-react'
import TaskQuickCard from './TaskQuickCard'

export default function ViewerDashboard({ 
  data, 
  currentUser 
}: { 
  data: any
  currentUser: { id: string; role: string }
}) {
  const { doingTasks, doneRecent, stats } = data

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tổng quan (Chế độ xem)</h1>

      {/* Thống kê Team */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <CheckSquare className="h-5 w-5" />
            <h3 className="text-sm font-medium">Task đang mở</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOpen}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-medium">Quá hạn / Critical</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.overdue} <span className="text-sm font-normal">/ {stats.criticalOpen}</span></p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <Medal className="h-5 w-5" />
            <h3 className="text-sm font-medium">Hoàn thành tháng này</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.doneMonth} task</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Toàn team đang làm
            </h2>
          </div>
          
          {doingTasks.length > 0 ? (
            <div className="space-y-4">
              {doingTasks.map((task: any) => (
                <TaskQuickCard key={task.id} task={task} currentUser={currentUser} showAssignee={true} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
              <Clock className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-center">Không có task nào đang DOING.</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold text-green-700 flex items-center gap-2">
              <Medal className="h-5 w-5" />
              Hoàn thành gần đây
            </h2>
          </div>
          
          {doneRecent.length > 0 ? (
            <div className="space-y-4">
              {doneRecent.map((task: any) => (
                <TaskQuickCard key={task.id} task={task} currentUser={currentUser} showAssignee={true} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
              <Medal className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-center">Chưa có task nào hoàn thành gần đây.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
