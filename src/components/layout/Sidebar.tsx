'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Users, FolderKanban, FileBarChart, LogOut, Settings, FileText, Activity, FolderOpen, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { logout } from '@/app/actions/auth'

import Image from 'next/image'
import { BRAND } from '@/lib/brand'

const navigation = [
  { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { name: 'Dự án', href: '/admin/projects', icon: FolderKanban },
  { name: 'Công việc', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Nhân sự', href: '/admin/users', icon: Users, adminOnly: true },
  { name: 'Báo cáo', href: '/admin/reports', icon: FileBarChart },
  { name: 'Nội dung', href: '/admin/content', icon: FileText },
  { name: 'Media Hub', href: '/admin/media', icon: FolderOpen, adminOnly: true },
  { name: 'Discord Composer', href: '/admin/discord', icon: MessageSquare },
  { name: 'Server Logs', href: '/admin/logs', icon: Activity },
]

export default function Sidebar({ 
  role,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse
}: { 
  role: string
  onNavigate?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()

  const filteredNav = navigation.filter(item => {
    if ((item as any).adminOnly && role !== 'OWNER' && role !== 'ADMIN') return false
    return true
  })

  return (
    <div className={`flex h-full flex-col border-r border-gray-200 bg-slate-50 shadow-sm transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex h-16 items-center border-b border-gray-200 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-[17px] font-black tracking-tight text-slate-900 leading-none truncate">{BRAND.name}</h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{BRAND.sidebarSubtitle}</span>
            </div>
          )}
        </div>
        {!isCollapsed && onToggleCollapse && (
          <button onClick={onToggleCollapse} className="text-gray-400 hover:text-gray-600 hidden md:block" title="Thu gọn">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center rounded-xl transition-all duration-200 ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } text-sm font-semibold ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`shrink-0 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-100 p-4 space-y-1.5">

        <Link
          href="/admin/profile"
          onClick={onNavigate}
          title={isCollapsed ? 'Hồ sơ cá nhân' : undefined}
          className={`group flex items-center rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center p-3' : 'w-full gap-3 px-3 py-2.5'
          } text-sm font-semibold ${
            pathname === '/admin/profile'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Settings className={`shrink-0 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} ${pathname === '/admin/profile' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
          {!isCollapsed && <span className="truncate">Hồ sơ cá nhân</span>}
        </Link>
        <form action={logout} className="w-full">
          <button
            type="submit"
            title={isCollapsed ? 'Đăng xuất' : undefined}
            className={`group flex items-center rounded-xl transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? 'justify-center p-3 w-full' : 'w-full gap-3 px-3 py-2.5'
            } text-sm font-semibold`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400 group-hover:text-red-500`} />
            {!isCollapsed && <span className="truncate">Đăng xuất</span>}
          </button>
        </form>

        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Mở rộng"
            className="group flex items-center justify-center rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-200 p-3 w-full text-sm font-semibold mt-2 hidden md:flex"
          >
            <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 shrink-0" />
          </button>
        )}
      </div>
    </div>
  )
}
