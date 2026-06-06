'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardShell({ 
  role, 
  name, 
  children 
}: { 
  role: string
  name: string
  children: React.ReactNode 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 transition-opacity md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar role={role} onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        <Header name={name} role={role} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
