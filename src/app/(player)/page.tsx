import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/player/PlayerComponents'
import { HeroSection, PillarCards, NewsCards } from './HomeClient'

async function getSettings() {
  const rows = await prisma.siteSetting.findMany()
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

async function getLatestNews() {
  return prisma.newsPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })
}

import LeaderboardWidget from '@/components/player/LeaderboardWidget'

export default async function HomePage() {
  const [settings, news] = await Promise.all([getSettings(), getLatestNews()])

  return (
    <PageShell>
      <HeroSection settings={settings} />
      <LeaderboardWidget />
      <PillarCards />

      {/* LATEST NEWS */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl uppercase tracking-wide" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>Từ chiến trường</h2>
          <Link href="/news" className="text-sm text-player-primary hover:underline">Tất cả tin tức →</Link>
        </div>
        <NewsCards news={news.map(n => ({
          id: n.id,
          slug: n.slug,
          title: n.title,
          excerpt: n.excerpt,
          coverImageUrl: n.coverImageUrl,
          publishedAt: n.publishedAt?.toISOString() ?? null,
        }))} />
      </section>
    </PageShell>
  )
}
