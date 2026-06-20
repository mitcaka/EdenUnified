import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hướng dẫn Roleplay', description: 'The foundations of roleplay on Eden PZ.' }

export default async function RpGuidePage() {
  const page = await prisma.page.findUnique({ where: { slug: 'rp-guide' } })
  if (!page || page.status !== 'published') notFound()

  return (
    <PageShell>
      <PageHeader eyebrow="Đọc trước khi chơi" title={page.title} description={page.seoDescription ?? undefined} />
      <article className="prose-eden max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
    </PageShell>
  )
}
