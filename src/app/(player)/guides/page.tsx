import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { GuidesClient } from './GuidesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hướng dẫn', description: 'Survival and roleplay guides for Eden PZ players.' }

export default async function GuidesPage() {
  const [cats, guides] = await Promise.all([
    prisma.guideCategory.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.guide.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <PageShell>
      <PageHeader eyebrow="Cẩm nang" title="Hướng dẫn" description="Kiến thức thực tế để tồn tại ở Kentucky và với những người trong đó." />
      <GuidesClient categories={cats} guides={guides.map(g => ({ ...g, coverImageUrl: g.coverImageUrl ?? undefined }))} />
    </PageShell>
  )
}
