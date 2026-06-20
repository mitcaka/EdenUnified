import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/player/PlayerComponents'
import TableOfContents from '@/components/player/TableOfContents'
import RelatedGuidesWidget from '@/components/player/RelatedGuidesWidget'
import { ArrowLeft } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await prisma.guide.findUnique({ where: { slug } })
  return { title: guide?.title ?? 'Guide' }
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true } } },
  })
  if (!guide || !guide.isPublished) notFound()

  const difficultyLabel: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  }

  return (
    <PageShell>
      <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-player-muted hover:text-player-primary mb-6">
        <ArrowLeft size={14} /> Tất cả hướng dẫn
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-8 min-w-0">
          {guide.coverImageUrl && (
            <div className="aspect-[21/9] overflow-hidden rounded-xl border border-player mb-8">
              <img src={guide.coverImageUrl} alt={guide.title} className="w-full h-full object-cover" />
            </div>
          )}
          <article className="w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-player-primary font-semibold">
                {guide.category?.name ?? guide.difficulty}
              </span>
              <span className="text-player-muted text-xs">·</span>
              <span className="text-xs uppercase tracking-[0.2em] text-player-muted">
                {difficultyLabel[guide.difficulty] ?? guide.difficulty}
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl uppercase tracking-wide text-player-foreground leading-tight"
              style={{ fontFamily: "'Oswald'" }}
            >
              {guide.title}
            </h1>
            <p className="mt-5 text-lg text-player-muted leading-relaxed font-medium">{guide.excerpt}</p>
            <div className="w-full h-px bg-player-border mt-8 mb-8" />
            <div className="prose-eden" dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.content) }} />
          </article>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0 self-start">
          <TableOfContents />
          <RelatedGuidesWidget
            currentGuideId={guide.id}
            categoryId={guide.categoryId}
            take={5}
          />
        </aside>
      </div>
    </PageShell>
  )
}
