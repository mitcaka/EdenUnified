'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Users, FolderKanban, FileBarChart, LogOut, Settings, FileText, Activity } from 'lucide-react'
import { logout } from '@/app/actions/auth'

import Image from 'next/image'
import { BRAND } from '@/lib/brand'

const navigation = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Dự án', href: '/admin/projects', icon: FolderKanban },
  { name: 'Công việc', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Nhân sự', href: '/admin/users', icon: Users },
  { name: 'Báo cáo', href: '/admin/reports', icon: FileBarChart },
  { name: 'Nội dung', href: '/admin/content', icon: FileText },
  { name: 'Server Logs', href: '/admin/logs', icon: Activity },
]

export default function Sidebar({ 
  role,
  onNavigate 
}: { 
  role: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  const filteredNav = navigation.filter(item => {
    if (item.name === 'Nhân sự' && role !== 'OWNER' && role !== 'ADMIN') return false
    return true
  })

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-slate-50 shadow-sm">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
        <Image src="/logo.svg" alt="Logo" width={32} height={32} />
        <div className="flex flex-col">
          <h1 className="text-[17px] font-black tracking-tight text-slate-900 leading-none">{BRAND.name}</h1>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{BRAND.sidebarSubtitle}</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-100 p-4 space-y-1.5">

        <Link
          href="/admin/profile"
          onClick={onNavigate}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
            pathname === '/admin/profile'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Settings className={`h-5 w-5 ${pathname === '/admin/profile' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
          Hồ sơ cá nhân
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
            Đăng xuất
          </button>
        </form>
      </div>
    </div>
  )
}
