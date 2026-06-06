import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/player/PlayerComponents'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await prisma.guide.findUnique({ where: { slug } })
  return { title: guide?.title ?? 'Guide' }
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const guide = await prisma.guide.findUnique({ where: { slug } })
  if (!guide || !guide.isPublished) notFound()

  return (
    <PageShell>
      <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-player-muted hover:text-player-primary mb-6">
        <ArrowLeft size={14} /> Tất cả hướng dẫn
      </Link>
      {guide.coverImageUrl && (
        <div className="aspect-[21/9] overflow-hidden rounded-xl border border-player mb-8">
          <img src={guide.coverImageUrl} alt={guide.title} className="w-full h-full object-cover" />
        </div>
      )}
      <article className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-player-primary mb-3">{guide.difficulty}</p>
        <h1 className="text-4xl md:text-5xl uppercase tracking-wide" style={{ fontFamily: "'Oswald'" }}>{guide.title}</h1>
        <p className="mt-4 text-lg text-player-muted leading-relaxed">{guide.excerpt}</p>
        <div className="prose-eden mt-8" dangerouslySetInnerHTML={{ __html: guide.content }} />
      </article>
    </PageShell>
  )
}
