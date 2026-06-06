'use client'

import { Menu } from 'lucide-react'

export default function Header({ 
  name, 
  role,
  onMenuClick 
}: { 
  name: string
  role: string
  onMenuClick?: () => void
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Spacer for mobile to push right content to end */}
      <div className="flex-1 md:hidden"></div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-gray-900 leading-tight">{name}</div>
          <div className="text-[11px] text-gray-500 uppercase tracking-wider">{role}</div>
        </div>
        <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 shadow-sm border border-blue-200">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
