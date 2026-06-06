'use client'

import { useState, useEffect } from 'react'
import { Trophy, Users, Activity, Server, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BattleMetricsWidget({ serverId = '38842637' }: { serverId?: string }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const res = await fetch(`https://api.battlemetrics.com/servers/${serverId}`, {
          headers: { Accept: 'application/vnd.api+json' }
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json.data.attributes)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchServer()
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchServer, 60000)
    return () => clearInterval(interval)
  }, [serverId])

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md text-gray-400 text-sm font-mono">
        <AlertCircle size={14} /> Server status unavailable
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="w-[320px] h-[90px] rounded-xl bg-black/40 border border-white/10 backdrop-blur-md animate-pulse p-4">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-white/10 rounded w-1/4"></div>
          <div className="h-8 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const isOnline = data.status === 'online'
  const percent = data.maxPlayers > 0 ? Math.min(100, Math.round((data.players / data.maxPlayers) * 100)) : 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="inline-flex flex-col rounded-xl bg-black/40 border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl min-w-[380px] max-w-[480px]"
    >
      {/* Header */}
      <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-gray-300" />
          <span className="text-sm font-bold tracking-wider text-gray-200 uppercase truncate max-w-[280px]">
            {data.name.split(' - ')[0] || 'Eden PZ'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/5 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-bold tracking-widest text-white uppercase mt-0.5">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex gap-8 items-center">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center min-w-[80px]">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
            <Trophy size={12} className="text-yellow-500" /> Hạng
          </span>
          <span className="text-2xl font-bold text-white font-mono">
            #{data.rank?.toLocaleString() || '---'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-12 bg-white/10"></div>

        {/* Players */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1.5">
              <Users size={12} className="text-blue-400" /> Người chơi
            </span>
            <span className="text-base font-bold text-white font-mono">
              {data.players} <span className="text-gray-500 mx-1">/</span> {data.maxPlayers}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/5 relative">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${percent}%`, boxShadow: `0 0 10px ${percent > 90 ? '#ef4444' : percent > 70 ? '#eab308' : '#22c55e'}` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
