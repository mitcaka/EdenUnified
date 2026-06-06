import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { FaqClient } from './FaqClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Câu hỏi thường gặp', description: 'Common questions about joining and playing on Eden PZ.' }

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } })

  return (
    <PageShell>
      <PageHeader eyebrow="Giải đáp" title="Câu hỏi thường gặp" description="Vẫn còn thắc mắc? Hỏi trên Discord." />
      <FaqClient faqs={faqs} />
    </PageShell>
  )
}
