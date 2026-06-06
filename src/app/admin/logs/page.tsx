'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { RefreshCw, Search, Copy, Check, Activity, Clock, Filter, ArrowDown, FolderOpen } from 'lucide-react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

type Tab = 'hourly' | 'search'

export default function LogViewerPage() {
  const [tab, setTab] = useState<Tab>('hourly')

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Server Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Xem log máy chủ Project Zomboid từ Nextcloud (Optimized)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit shrink-0">
        {([
          { key: 'hourly', icon: Clock, label: 'Hourly Logs' },
          { key: 'search', icon: Search, label: 'Super Search' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'hourly' && <HourlyTab />}
        {tab === 'search' && <SearchTab />}
      </div>
    </div>
  )
}

// ==================== Hourly Tab ====================
function HourlyTab() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [logLines, setLogLines] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState('')
  const [loading, setLoading] = useState(false)

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/logs/dates').then(r => r.json()).then(d => {
      setDates(d.dates || [])
      if (d.dates?.length) setSelectedDate(d.dates[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    fetch(`/api/logs/hourly?date=${selectedDate}`).then(r => r.json()).then(d => {
      setFiles(d.files || [])
      setSelectedFile('')
      setLogLines([])
      setLoading(false)
    })
  }, [selectedDate])

  const loadFile = async (file: string) => {
    setSelectedFile(file)
    setLoading(true)
    const res = await fetch(`/api/logs/hourly/${selectedDate}/${file}`)
    const d = await res.json()
    setLogLines((d.content || '').split('\n').filter(Boolean))
    setLoading(false)
  }

  const groupedFiles = useMemo(() => {
    const groups: Record<string, string[]> = {}
    files.forEach(f => {
      let prefix = 'Khác'
      if (f.includes('_')) {
        prefix = f.substring(0, f.indexOf('_'))
      } else {
        prefix = f.replace('.log', '')
      }
      if (!groups[prefix]) groups[prefix] = []
      groups[prefix].push(f)
    })
    return groups
  }, [files])

  const toggleGroup = (prefix: string) => {
    setOpenGroups(prev => ({ ...prev, [prefix]: !prev[prefix] }))
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Sidebar: 280px wide */}
      <div className="w-full md:w-[280px] shrink-0 flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden h-[30vh] md:h-full">
        {/* Sidebar Header (Select Date) */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 shrink-0">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5 ml-1">Chọn ngày</label>
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm bg-white shadow-sm font-medium focus:outline-none focus:border-blue-500">
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Sidebar Content (Accordion Groups) */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {Object.keys(groupedFiles).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(groupedFiles).map(([prefix, fList]) => (
                <div key={prefix} className="border border-gray-100 rounded-lg overflow-hidden bg-white">
                  <button onClick={() => toggleGroup(prefix)} className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left focus:outline-none">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className={openGroups[prefix] === true ? "text-blue-500" : "text-gray-400"} />
                      <span className="text-xs font-bold text-gray-700 uppercase">{prefix}</span>
                    </div>
                    <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {fList.length}
                    </span>
                  </button>
                  
                  {openGroups[prefix] === true && (
                    <div className="p-1.5 bg-white border-t border-gray-100 flex flex-col gap-0.5">
                      {fList.map(f => (
                        <button key={f} onClick={() => loadFile(f)} title={f} className={`text-left px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors truncate border border-transparent ${selectedFile === f ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                          {f.replace('.log', '').replace(prefix + '_', '') || 'main'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
              Không có file log nào.
            </div>
          )}
        </div>
      </div>

      {/* Main Content (Terminal): flexible width */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {selectedFile ? (
          <LogViewerTerminal title={`${selectedDate} / ${selectedFile}`} lines={logLines} loading={loading} />
        ) : (
          <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm">
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <ArrowDown className="md:-rotate-90 text-gray-400" size={16} /> 
              Vui lòng chọn một file log từ Menu bên trái
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Search Tab ====================
function SearchTab() {
  const [dates, setDates] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [filePattern, setFilePattern] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    fetch('/api/logs/dates').then(r => r.json()).then(d => {
      setDates(d.dates || [])
      if (d.dates?.length) setDate(d.dates[0])
    })
  }, [])

  const doSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return alert("Vui lòng chọn ngày.")
    if (!query.trim() && !filePattern.trim()) return alert("Vui lòng nhập từ khoá hoặc tên file cần tìm.")
    
    setSearching(true)
    setHasSearched(true)
    setResults([])
    
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (date) params.set('date', date)
    if (filePattern.trim()) params.set('file', filePattern.trim())
    
    try {
      const res = await fetch(`/api/logs/search?${params}`)
      const d = await res.json()
      setResults(d.results || [])
    } catch {
      alert("Đã xảy ra lỗi khi tìm kiếm!")
    }
    setSearching(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <form onSubmit={doSearch} className="flex gap-3 items-end shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ngày quét</label>
          <select value={date} onChange={e => setDate(e.target.value)} required className="rounded-md border border-gray-300 px-3 py-2 text-sm w-[150px] bg-white">
            <option value="">-- Chọn ngày --</option>
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tên file (Gần đúng)</label>
          <input type="text" value={filePattern} onChange={e => setFilePattern(e.target.value)} placeholder="VD: admin, server" className="rounded-md border border-gray-300 px-3 py-2 text-sm w-[200px]" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Từ khoá cần tìm</label>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nhập từ khoá..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={searching} className="h-[38px] inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Search size={16} /> {searching ? 'Đang quét...' : 'Tìm Kiếm'}
        </button>
      </form>

      <div className="flex-1 min-h-0 bg-[#0d1117] rounded-xl border border-gray-200 overflow-hidden shadow-lg flex flex-col relative">
        <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex justify-between items-center shrink-0">
          <h3 className="text-sm font-semibold text-gray-200">Kết quả tìm kiếm toàn cục</h3>
          <span className="text-xs text-gray-400 bg-[#21262d] px-2 py-0.5 rounded-full">{results.length} kết quả</span>
        </div>
        
        {searching && (
          <div className="absolute inset-0 z-10 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-blue-500" size={24} />
              <p className="text-blue-400 font-medium text-sm">Đang quét hàng vạn dòng dữ liệu từ máy chủ, vui lòng đợi...</p>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {results.length > 0 ? (
            <Virtuoso
              ref={virtuosoRef}
              data={results}
              itemContent={(_, res) => (
                <div className="px-4 py-1.5 flex gap-3 text-[13px] font-mono hover:bg-white/5 border-b border-[#30363d]/50">
                  <span className="text-[#8b949e] shrink-0 font-semibold w-40 truncate text-right">[{res.file}]</span>
                  <span className="text-[#484f58] shrink-0 w-12 text-right">L.{res.line}</span>
                  <span className="break-words text-[#c9d1d9] flex-1">
                    {highlightSearch(res.text, query)}
                  </span>
                </div>
              )}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
              {!hasSearched ? 'Điền thông tin và bấm Tìm Kiếm để bắt đầu quét.' : 'Không tìm thấy kết quả nào phù hợp.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Log Parser & Terminal ====================
type LogLine = {
  id: number
  original: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  category: string
  content: string
}

function parseLogLine(line: string, index: number): LogLine {
  const tsMatch = line.match(/^\[(\d{2}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\]/)
  const timestamp = tsMatch ? tsMatch[1] : ''
  let content = tsMatch ? line.slice(tsMatch[0].length).trim() : line

  let level: 'info' | 'warn' | 'error' = 'info'
  const lowerLine = line.toLowerCase()
  if (lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('severe') || lowerLine.includes('stack trace')) level = 'error'
  else if (lowerLine.includes('warn')) level = 'warn'

  let category = ''
  const catMatch = content.match(/^\[([^\]]+)\]\s*\[([^\]]+)\]/) 
  if (catMatch) {
    category = catMatch[2]
    content = content.slice(catMatch[0].length).trim()
  } else {
    const singleCatMatch = content.match(/^\[([^\]\s]+)\]/) 
    if (singleCatMatch) {
      category = singleCatMatch[1]
      content = content.slice(singleCatMatch[0].length).trim()
    }
  }

  return { id: index, original: line, timestamp, level, category, content }
}

function highlightSearch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#FFFF00] text-black px-0.5 rounded font-bold">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function LogViewerTerminal({ title, lines, loading }: { title: string; lines: string[]; loading: boolean }) {
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const parsedLines = useMemo(() => lines.map((l, i) => parseLogLine(l, i)), [lines])
  
  const categories = useMemo(() => {
    const cats = new Set<string>()
    parsedLines.forEach(l => { if (l.category) cats.add(l.category) })
    return Array.from(cats).sort()
  }, [parsedLines])

  const filteredLines = useMemo(() => {
    return parsedLines.filter(l => {
      if (filterLevel !== 'all') {
        if (filterLevel === 'error' && l.level !== 'error') return false
        if (filterLevel === 'warn' && l.level !== 'warn' && l.level !== 'error') return false 
      }
      if (filterCategory !== 'all' && l.category !== filterCategory) return false
      if (searchQuery) {
        if (!l.original.toLowerCase().includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [parsedLines, filterLevel, filterCategory, searchQuery])

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({ index: filteredLines.length - 1, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-[#0d1117] overflow-hidden shadow-lg relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <h3 className="text-sm font-semibold text-gray-200 ml-2 truncate max-w-[200px] xl:max-w-[300px]">{title}</h3>
            <span className="text-xs text-gray-400 bg-[#21262d] px-2 py-0.5 rounded-full">{filteredLines.length} dòng</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search in log..." 
              className="bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-md pl-8 pr-3 py-1.5 focus:border-blue-500 focus:outline-none w-48 transition-colors"
            />
          </div>

          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as any)} className="bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500">
            <option value="all">Tất cả mức độ</option>
            <option value="error">Chỉ Errors</option>
            <option value="warn">Warnings & Errors</option>
          </select>

          {categories.length > 0 && (
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 max-w-[150px]">
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <div className="flex items-center gap-1 border-l border-[#30363d] pl-3">
            <button onClick={scrollToBottom} className="p-1.5 text-gray-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded transition-colors" title="Cuộn xuống cuối">
              <ArrowDown size={14} />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="p-1.5 text-gray-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded transition-colors" title="Copy toàn bộ">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-x-0 top-[53px] bottom-0 z-10 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="animate-spin text-blue-500" size={20} />
            <p className="text-blue-400 text-sm font-medium">Đang tải dữ liệu file log...</p>
          </div>
        </div>
      )}

      {/* Terminal Area */}
      <div className="flex-1 min-h-0 relative">
        {filteredLines.length > 0 ? (
          <Virtuoso
            ref={virtuosoRef}
            data={filteredLines}
            initialTopMostItemIndex={filteredLines.length - 1} 
            itemContent={(_, line) => (
              <div className={`px-4 py-0.5 flex gap-3 text-[13px] font-mono hover:bg-white/5 group border-l-2 ${
                line.level === 'error' ? 'border-red-500 bg-red-900/10' : 
                line.level === 'warn' ? 'border-yellow-500 bg-yellow-900/10' : 'border-transparent'
              }`}>
                <span className="text-[#484f58] select-none shrink-0 w-12 text-right">{line.id + 1}</span>
                
                {line.timestamp && <span className="text-[#8b949e] shrink-0">[{line.timestamp}]</span>}
                
                {line.category && (
                  <span className={`shrink-0 font-semibold px-1 rounded text-xs leading-none self-start mt-0.5 ${
                    line.level === 'error' ? 'text-red-400 bg-red-900/30' :
                    line.level === 'warn' ? 'text-yellow-400 bg-yellow-900/30' :
                    'text-blue-400 bg-blue-900/30'
                  }`}>
                    {line.category}
                  </span>
                )}
                
                {/* Content */}
                <span className={`break-all flex-1 min-w-0 ${
                  line.level === 'error' ? 'text-[#ff7b72]' : 
                  line.level === 'warn' ? 'text-[#d2a8ff]' : 'text-[#c9d1d9]'
                }`}>
                  {highlightSearch(line.content || line.original, searchQuery)}
                </span>
              </div>
            )}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
            Không có dòng log nào thoả mãn.
          </div>
        )}
      </div>
    </div>
  )
}
