import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PlayerHeader, PlayerFooter } from '@/components/player/PlayerComponents'
import './player.css'

export const metadata: Metadata = {
  title: { default: 'Eden PZ — Project Zomboid Roleplay', template: '%s — Eden PZ' },
  description: 'Eden PZ is a serious Project Zomboid roleplay server. Survive, roleplay, and remember.',
}

async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany()
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <div className="player-theme flex flex-col min-h-screen">
        <PlayerHeader />
        {children}
        <PlayerFooter settings={settings} />
      </div>
    </>
  )
}
