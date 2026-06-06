'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Papa from 'papaparse'
import { Download, Copy, Calendar, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

type ReportData = {
  userId: string
  username: string
  name: string
  doneTasksCount: number
  totalBasePoints: number
  totalBonus: number
  totalPenalty: number
  totalFinalPoint: number
  overdueTasksCount: number
  reopenedTasksCount: number
  tasks: {
    title: string
    projectName: string
    basePoint: number
    bonusPoint: number
    penaltyPoint: number
    finalPoint: number
    pointReason: string | null
    completedAt?: string
    isOverdue: boolean
    reopenedCount: number
  }[]
}[]

export default function ReportClient({ initialMonth, reportData }: { initialMonth: string, reportData: ReportData }) {
  const router = useRouter()
  const [month, setMonth] = useState(initialMonth)
  const [copied, setCopied] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value)
    router.push(`/reports?month=${e.target.value}`)
  }

  const toggleRow = (userId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const exportCSV = () => {
    const rows: any[] = []
    reportData.forEach(user => {
      if (user.tasks.length === 0) {
        rows.push({
          'Nhân sự': user.name,
          'Tài khoản': user.username,
          'Tổng Task Done': 0,
          'Tổng Gốc': user.totalBasePoints,
          'Tổng Bonus': user.totalBonus,
          'Tổng Penalty': user.totalPenalty,
          'Tổng Final Point': user.totalFinalPoint,
          'Trễ Hạn': user.overdueTasksCount,
          'Bị Reopen': user.reopenedTasksCount,
          'Tên Task': '',
          'Dự án': '',
          'Base Point': '',
          'Bonus': '',
          'Penalty': '',
          'Final Point': '',
          'Lý do': '',
          'Trễ hạn (Task)': '',
          'Reopen (Task)': '',
          'Ngày hoàn thành': ''
        })
      } else {
        user.tasks.forEach((task, index) => {
          rows.push({
            'Nhân sự': index === 0 ? user.name : '',
            'Tài khoản': index === 0 ? user.username : '',
            'Tổng Task Done': index === 0 ? user.doneTasksCount : '',
            'Tổng Gốc': index === 0 ? user.totalBasePoints : '',
            'Tổng Bonus': index === 0 ? user.totalBonus : '',
            'Tổng Penalty': index === 0 ? user.totalPenalty : '',
            'Tổng Final Point': index === 0 ? user.totalFinalPoint : '',
            'Trễ Hạn': index === 0 ? user.overdueTasksCount : '',
            'Bị Reopen': index === 0 ? user.reopenedTasksCount : '',
            'Tên Task': task.title,
            'Dự án': task.projectName,
            'Base Point': task.basePoint,
            'Bonus': task.bonusPoint,
            'Penalty': task.penaltyPoint,
            'Final Point': task.finalPoint,
            'Lý do': task.pointReason || '',
            'Trễ hạn (Task)': task.isOverdue ? 'Có' : 'Không',
            'Reopen (Task)': task.reopenedCount,
            'Ngày hoàn thành': task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''
          })
        })
      }
    })

    const csv = Papa.unparse(rows)
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyDiscord = () => {
    let markdown = `**BÁO CÁO THÁNG ${month}**\n\n`
    reportData.forEach(user => {
      if (user.doneTasksCount > 0) {
        markdown += `- **${user.name}**: ${user.doneTasksCount} tasks Done (Final: **${user.totalFinalPoint} pt**) - [Gốc: ${user.totalBasePoints} | Thưởng: +${user.totalBonus} | Phạt: -${user.totalPenalty} | Trễ: ${user.overdueTasksCount} | Reopen: ${user.reopenedTasksCount}]\n`
      } else {
        markdown += `- **${user.name}**: 0 tasks Done\n`
      }
    })

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-0.5">Tháng báo cáo</label>
            <input 
              type="month" 
              value={month} 
              onChange={handleMonthChange}
              className="block w-full border-0 p-0 text-sm font-bold text-gray-900 focus:ring-0 bg-transparent cursor-pointer" 
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={copyDiscord}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              copied ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã Copy!' : 'Copy Discord'}
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {reportData.map((user) => (
          <div key={user.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => user.doneTasksCount > 0 && toggleRow(user.userId)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-blue-600">{user.totalFinalPoint} pt</div>
                <div className="text-xs text-gray-500 font-medium">{user.doneTasksCount} task done</div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
              <div className="p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Điểm Gốc</div>
                <div className="font-bold text-gray-700">{user.totalBasePoints}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Thưởng/Phạt</div>
                <div className="font-bold"><span className="text-green-600">+{user.totalBonus}</span> / <span className="text-red-600">-{user.totalPenalty}</span></div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Trễ/Reopen</div>
                <div className="font-bold"><span className="text-red-600">{user.overdueTasksCount}</span> / <span className="text-orange-600">{user.reopenedTasksCount}</span></div>
              </div>
            </div>

            {user.doneTasksCount > 0 && expandedRows[user.userId] && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Chi tiết Task Done</h4>
                {user.tasks.map((task, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="font-medium text-gray-900 text-sm mb-1">{task.title}</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{task.projectName}</span>
                      <span className="font-bold text-blue-600">{task.finalPoint} pt</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {user.doneTasksCount > 0 && (
              <div 
                className="bg-gray-50 py-2 border-t border-gray-100 flex justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleRow(user.userId)}
              >
                {expandedRows[user.userId] ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nhân sự</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Số Task Done</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500" title="Gốc + Thưởng - Phạt">Final Point</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Điểm Gốc</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Thưởng / Phạt</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Trễ / Reopen</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {reportData.map((user) => (
              <React.Fragment key={user.userId}>
                <tr 
                  className={`group transition-colors ${user.doneTasksCount > 0 ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                  onClick={() => user.doneTasksCount > 0 && toggleRow(user.userId)}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-bold ${user.doneTasksCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.doneTasksCount}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-blue-600 text-base">{user.totalFinalPoint}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-gray-500">{user.totalBasePoints}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <span className="font-bold text-green-600">+{user.totalBonus}</span> / <span className="font-bold text-red-600">-{user.totalPenalty}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <span className="font-bold text-red-600" title="Số task trễ hạn">{user.overdueTasksCount}</span> / <span className="font-bold text-orange-600" title="Số task bị reopen">{user.reopenedTasksCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.doneTasksCount > 0 && (
                      <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                        {expandedRows[user.userId] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRows[user.userId] && user.doneTasksCount > 0 && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50/50 p-0">
                      <div className="px-6 py-4 border-l-4 border-blue-500 ml-6">
                        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wider">Chi tiết Task Done</h4>
                        <div className="space-y-2">
                          {user.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                <span className="text-xs text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">{task.projectName}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-blue-600 text-base">{task.finalPoint} pt</span>
                                  <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                                    Gốc: {task.basePoint} 
                                    {task.bonusPoint > 0 && <span className="text-green-600 ml-1">(+{task.bonusPoint})</span>}
                                    {task.penaltyPoint > 0 && <span className="text-red-600 ml-1">(-{task.penaltyPoint})</span>}
                                  </span>
                                  {task.pointReason && <span className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] truncate" title={task.pointReason}>Lý do: {task.pointReason}</span>}
                                  {(task.isOverdue || task.reopenedCount > 0) && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {task.isOverdue && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase tracking-wider">Trễ hạn</span>}
                                      {task.reopenedCount > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold uppercase tracking-wider">Reopen x{task.reopenedCount}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
