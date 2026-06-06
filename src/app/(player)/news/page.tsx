import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tin tức', description: 'Announcements, season updates, and community stories.' }

export default async function NewsPage() {
  const news = await prisma.newsPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <PageShell>
      <PageHeader eyebrow="Thông báo" title="Tin tức" description="Cập nhật máy chủ và câu chuyện từ chiến trường." />
      {news.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-player rounded-xl">
          <p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald'" }}>Chưa có tin tức</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="group block rounded-xl border border-player bg-player-card overflow-hidden hover:border-player-primary transition-all h-full">
              {n.coverImageUrl && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={n.coverImageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6">
                {n.publishedAt && (
                  <p className="text-xs uppercase tracking-wider text-player-muted mb-2">
                    {new Date(n.publishedAt).toLocaleDateString('vi-VN', { dateStyle: 'long' })}
                  </p>
                )}
                <h2 className="text-xl uppercase tracking-wide group-hover:text-player-primary transition-colors" style={{ fontFamily: "'Oswald'" }}>{n.title}</h2>
                <p className="text-player-muted mt-2">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
