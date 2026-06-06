'use client'

import { AlertTriangle, Clock, Medal, FileBarChart, Search, UserPlus, FolderPlus, PlusCircle } from 'lucide-react'
import TaskQuickCard from './TaskQuickCard'
import Link from 'next/link'

export default function ManagementDashboard({ 
  data, 
  currentUser 
}: { 
  data: any
  currentUser: { id: string; role: string }
}) {
  const { reviewQueue, urgentManagement, teamDoingGrouped, recentTasks, stats } = data

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bảng tin Quản lý</h1>

      {/* Thống kê Team */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Search className="h-5 w-5" />
            <h3 className="text-sm font-medium">Task Mở / Unassigned</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOpen} <span className="text-sm font-normal text-red-500">({stats.unassigned} trống)</span></p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-medium">Quá hạn / Critical</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.overdue} <span className="text-sm font-normal">/ {stats.criticalOpen}</span></p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-orange-600">
            <FileBarChart className="h-5 w-5" />
            <h3 className="text-sm font-medium">Cần Review</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.needReview}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <Medal className="h-5 w-5" />
            <h3 className="text-sm font-medium">Team Point / Done</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.totalTeamPointsMonth} <span className="text-sm font-normal">/ {stats.doneMonth} task</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Review & Quản lý */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Cần Review ({reviewQueue.length})
              </h2>
              <Link href="/admin/tasks?status=NEED_REVIEW" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
            
            {reviewQueue.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reviewQueue.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} showAssignee={true} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                <FileBarChart className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-center">Tuyệt vời! Không có task nào đang chờ review.</p>
              </div>
            )}
          </section>

          <section className="bg-red-50/30 p-5 rounded-2xl border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cần Quản Lý Gấp ({urgentManagement.length})
              </h2>
            </div>
            {urgentManagement.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {urgentManagement.map((task: any) => (
                  <TaskQuickCard key={task.id} task={task} currentUser={currentUser} showAssignee={true} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">Mọi thứ đang hoạt động ổn định.</p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Task Mới Gần Đây</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentTasks.map((task: any) => (
                <TaskQuickCard key={task.id} task={task} currentUser={currentUser} showAssignee={true} />
              ))}
            </div>
          </section>

        </div>

        {/* Cột phải: Team Doing & Quick Links */}
        <div className="space-y-6">
          
          <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-500" />
              Quick Links
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/tasks/new" className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-semibold">
                <PlusCircle className="h-4 w-4" /> Tạo Task
              </Link>
              <Link href="/admin/projects/new" className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-semibold">
                <FolderPlus className="h-4 w-4" /> Tạo Dự án
              </Link>
              <Link href="/admin/users/new" className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-semibold">
                <UserPlus className="h-4 w-4" /> Tạo User
              </Link>
              <Link href="/admin/reports?month=current" className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-semibold">
                <FileBarChart className="h-4 w-4" /> Report Tháng
              </Link>
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Top 3 Thành Viên
            </h2>
            <div className="space-y-3">
              {stats.top3Members.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">{idx + 1}</span>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                  <span className="font-bold text-green-600">{member.points} pt</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Ai đang làm gì?
              </h2>
            </div>
            
            <div className="space-y-4">
              {teamDoingGrouped.length > 0 ? (
                teamDoingGrouped.map((user: any) => (
                  <div key={user.userId} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{user.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{user._count.assignedTasks} task</span>
                    </div>
                    <div className="space-y-1">
                      {user.recentDoing.map((t: any) => (
                        <div key={t.id} className="text-xs text-gray-600 truncate bg-gray-50 px-2 py-1.5 rounded flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          <Link href={`/admin/tasks/${t.id}/edit`} className="hover:text-blue-600 hover:underline truncate">{t.title}</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic text-center">Chưa có ai đang làm việc.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
