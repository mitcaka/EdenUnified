import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { GalleryClient } from './GalleryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Thư viện', description: 'Screenshots and videos from Eden PZ.' }

export default async function GalleryPage() {
  const media = await prisma.mediaItem.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })

  const items = media.map(m => {
    let parsedTags: string[] = []
    if (m.tags) {
      try {
        parsedTags = JSON.parse(m.tags)
      } catch (e) {
        parsedTags = m.tags.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    return {
      id: m.id, title: m.title, description: m.description,
      type: m.type as 'image' | 'video',
      mediaUrl: m.mediaUrl, thumbnailUrl: m.thumbnailUrl,
      tags: parsedTags,
      isFeatured: m.isFeatured, sortOrder: m.sortOrder,
    }
  })

  return (
    <PageShell>
      <PageHeader eyebrow="Kỷ niệm" title="Thư viện" description="Những khoảnh khắc được ghi lại giữa những khoảng lặng. Được gửi bởi cộng đồng." />
      <GalleryClient items={items} />
    </PageShell>
  )
}
