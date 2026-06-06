import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const settingsRows = await prisma.siteSetting.findMany({
      where: { key: { in: ['battlemetrics_id', 'battlemetrics_token'] } }
    })
    const settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]))
    
    const serverId = settings.battlemetrics_id || '38842637'
    const token = settings.battlemetrics_token

    if (!token) {
      return NextResponse.json({ error: 'Missing BattleMetrics API Token in Settings' }, { status: 400 })
    }

    // Fetch Active Players
    const activeRes = await fetch(`https://api.battlemetrics.com/servers/${serverId}?include=player`, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 60 }
    })
    
    if (!activeRes.ok) {
      throw new Error('Failed to fetch active players from BM')
    }
    const activeJson = await activeRes.json()
    
    // Parse Active Players
    const activePlayers = []
    if (activeJson.included) {
      for (const item of activeJson.included) {
        if (item.type === 'player') {
          let time = 0
          if (item.meta && item.meta.metadata) {
            const timeMeta = item.meta.metadata.find((m: any) => m.key === 'time')
            if (timeMeta) time = timeMeta.value
          }
          activePlayers.push({
            name: item.attributes.name,
            sessionTime: time // seconds
          })
        }
      }
    }
    // Sort active players by sessionTime descending
    activePlayers.sort((a, b) => b.sessionTime - a.sessionTime)

    // Fetch Most Time Played (Leaderboard All Time)
    const topRes = await fetch(`https://api.battlemetrics.com/servers/${serverId}/relationships/leaderboards/time?filter[period]=AT&page[size]=10`, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 3600 } // cache 1 hour
    })
    
    if (!topRes.ok) {
      throw new Error('Failed to fetch leaderboard from BM')
    }
    const topJson = await topRes.json()
    
    const topPlayers = topJson.data.map((item: any) => ({
      rank: item.attributes.rank,
      name: item.attributes.name,
      totalTime: item.attributes.value // seconds
    }))

    return NextResponse.json({
      active: activePlayers,
      top: topPlayers
    })

  } catch (error: any) {
    console.error('BM Leaderboard Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
