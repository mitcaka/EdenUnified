import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cách tham gia', description: 'Step-by-step guide to joining Eden PZ.' }

export default async function HowToJoinPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'how-to-join' } })
  if (!page || page.status !== 'published') notFound()

  return (
    <PageShell>
      <PageHeader eyebrow="Người chơi mới" title={page.title} description={page.seoDescription ?? undefined} />
      <article className="prose-eden max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
    </PageShell>
  )
}
