'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Search, Filter, Folder, AlertCircle, Tag } from 'lucide-react'

export default function TaskFilters({ 
  users, 
  projects 
}: { 
  users: { id: string, name: string }[],
  projects: { id: string, name: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [text, setText] = useState(searchParams.get('q') || '')
  const [debouncedText] = useDebounce(text, 500)
  
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [debouncedCategory] = useDebounce(category, 500)

  const [assigneeId, setAssigneeId] = useState(searchParams.get('assigneeId') || '')
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '')
  const [priority, setPriority] = useState(searchParams.get('priority') || '')

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedText) params.set('q', debouncedText)
    else params.delete('q')

    if (debouncedCategory) params.set('category', debouncedCategory)
    else params.delete('category')

    if (assigneeId) params.set('assigneeId', assigneeId)
    else params.delete('assigneeId')

    if (projectId) params.set('projectId', projectId)
    else params.delete('projectId')

    if (priority) params.set('priority', priority)
    else params.delete('priority')

    const newQuery = params.toString()
    if (newQuery !== searchParams.toString()) {
      router.push(`${pathname}?${newQuery}`)
    }
  }, [debouncedText, debouncedCategory, assigneeId, projectId, priority, router, pathname, searchParams])

  return (
    <div className="flex flex-wrap gap-3 w-full items-center">
      <div className="relative flex-1 min-w-[200px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="Tìm công việc..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="block w-full rounded-xl border-0 py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 bg-white"
        />
      </div>

      <div className="relative w-40 shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Folder className="h-4 w-4 text-gray-400" />
        </div>
        <select 
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="block w-full rounded-xl border-0 py-2 pl-10 pr-8 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 bg-white appearance-none cursor-pointer"
        >
          <option value="">Tất cả dự án</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
        </div>
      </div>

      <div className="relative w-40 shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <select 
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="block w-full rounded-xl border-0 py-2 pl-10 pr-8 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 bg-white appearance-none cursor-pointer"
        >
          <option value="">Tất cả nhân sự</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
        </div>
      </div>

      <div className="relative w-36 shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <AlertCircle className="h-4 w-4 text-gray-400" />
        </div>
        <select 
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="block w-full rounded-xl border-0 py-2 pl-10 pr-8 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 bg-white appearance-none cursor-pointer"
        >
          <option value="">Mọi độ ưu tiên</option>
          <option value="LOW">Thấp (LOW)</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao (HIGH)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
        </div>
      </div>

      <div className="relative w-36 shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Tag className="h-4 w-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="Category..." 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full rounded-xl border-0 py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6 bg-white"
        />
      </div>

    </div>
  )
}
