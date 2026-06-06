'use client'

import { CheckSquare, AlertTriangle, Clock, Medal, FileBarChart } from 'lucide-react'
import TaskQuickCard from './TaskQuickCard'
import Link from 'next/link'

export default function MyWorkDashboard({ 
  data, 
  currentUser 
}: { 
  data: any
  currentUser: { id: string; role: string }
}) {
  const { myTasks, urgentTasks, doingTasks, waitingTasks, doneTasks, stats } = data

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bảng tin cá nhân</h1>

      {/* Thống kê cá nhân */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <CheckSquare className="h-5 w-5" />
            <h3 className="text-sm font-medium">Việc của tôi</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.openAssignedTasks}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <h3 className="text-sm font-medium">Đang làm</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.doingTasksCount}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-medium">Quá hạn</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.overdueTasksCount}</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-orange-600">
            <FileBarChart className="h-5 w-5" />
            <h3 className="text-sm font-medium">Chờ Review</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.waitingReviewCount}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <Medal className="h-5 w-5" />
            <h3 className="text-sm font-medium">Điểm tháng này</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.totalPointsMonth} <span className="text-sm font-normal">/ {stats.doneTasksMonth} task</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Việc của tôi */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-500" />
                Công việc của tôi ({myTasks.length})
              </h2>
              <Link href={`/admin/tasks?assigneeId=${currentUser.id}`} className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
            
            {myTasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {myTasks.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                <CheckSquare className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-center">Tuyệt vời! Bạn không có công việc nào đang tồn đọng.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Medal className="h-5 w-5 text-green-500" />
              Hoàn thành gần đây
            </h2>
            {doneTasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {doneTasks.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">Chưa có task nào hoàn thành trong tháng này.</div>
            )}
          </section>

        </div>

        {/* Cột phải: Khẩn cấp & Đang làm */}
        <div className="space-y-6">
          <section className="bg-red-50/30 p-5 rounded-2xl border border-red-100">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" />
              Cần xử lý gấp
            </h2>
            {urgentTasks.length > 0 ? (
              <div className="space-y-3">
                {urgentTasks.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Không có việc khẩn cấp.</p>
            )}
          </section>

          <section className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              Đang làm (DOING)
            </h2>
            {doingTasks.length > 0 ? (
              <div className="space-y-3">
                {doingTasks.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Bạn chưa bấm "Bắt đầu làm" task nào.</p>
            )}
          </section>

          <section className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
            <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-4">
              <FileBarChart className="h-5 w-5" />
              Chờ Review / Test
            </h2>
            {waitingTasks.length > 0 ? (
              <div className="space-y-3">
                {waitingTasks.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Không có task nào đang chờ.</p>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
