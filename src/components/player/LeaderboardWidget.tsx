'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Trophy, Users, Activity, AlertCircle } from 'lucide-react'

// Utility to format seconds into HH:MM
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function LeaderboardWidget() {
  const [data, setData] = useState<{ active: any[], top: any[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/battlemetrics/leaderboard')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch leaderboard')
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[400px] rounded-2xl bg-black/30 border border-white/5 animate-pulse"></div>
        <div className="h-[400px] rounded-2xl bg-black/30 border border-white/5 animate-pulse"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-full mt-12 p-6 rounded-2xl bg-red-950/30 border border-red-500/20 backdrop-blur-md text-red-200 flex items-center gap-3">
        <AlertCircle className="text-red-400" />
        <p>Lỗi Thống kê: {error}. Vui lòng kiểm tra lại cấu hình API Token trong Admin.</p>
      </div>
    )
  }

  return (
    <section className="mb-20 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-white drop-shadow-md" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>
          Thống Kê Người Chơi
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bảng 1: Active Players */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl h-[500px]"
        >
          <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <Activity className="text-green-400" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Người chơi đang Online</h3>
            <span className="ml-auto bg-green-500/20 text-green-400 py-1 px-3 rounded-full text-xs font-bold border border-green-500/30">
              {data.active.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400 sticky top-0 bg-black/60 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tên (Name)</th>
                  <th className="px-4 py-3 font-semibold text-right">Giờ chơi (Session)</th>
                </tr>
              </thead>
              <tbody>
                {data.active.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">Không có người chơi nào đang online.</td>
                  </tr>
                ) : (
                  data.active.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-blue-300">{p.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">{formatTime(p.sessionTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bảng 2: Most Time Played */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl h-[500px]"
        >
          <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <Trophy className="text-yellow-400" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Giờ Chơi (All Time)</h3>
            <span className="ml-auto bg-yellow-500/20 text-yellow-400 py-1 px-3 rounded-full text-xs font-bold border border-yellow-500/30">
              Top 10
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400 sticky top-0 bg-black/60 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                  <th className="px-4 py-3 font-semibold">Người chơi (Player)</th>
                  <th className="px-4 py-3 font-semibold text-right">Tổng giờ (Time)</th>
                </tr>
              </thead>
              <tbody>
                {data.top.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">Chưa có dữ liệu thống kê.</td>
                  </tr>
                ) : (
                  data.top.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-gray-400">{p.rank}</td>
                      <td className="px-4 py-3 font-medium text-blue-300">{p.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">{formatTime(p.totalTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      `}} />
    </section>
  )
}
