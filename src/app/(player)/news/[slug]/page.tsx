import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/player/PlayerComponents'
import TableOfContents from '@/components/player/TableOfContents'
import LatestNewsWidget from '@/components/player/LatestNewsWidget'
import { ArrowLeft } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize-html'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.newsPost.findUnique({ where: { slug } })
  return { title: post?.title ?? 'News' }
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.newsPost.findUnique({ where: { slug } })
  if (!post || post.status !== 'published') notFound()

  return (
    <PageShell>
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-player-muted hover:text-player-primary mb-6">
        <ArrowLeft size={14} /> Tất cả tin tức
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-8 min-w-0">
          {post.coverImageUrl && (
            <div className="aspect-[21/9] overflow-hidden rounded-xl border border-player mb-8">
              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <article className="w-full">
            {post.publishedAt && (
              <p className="text-xs uppercase tracking-[0.2em] text-player-primary mb-3">
                {new Date(post.publishedAt).toLocaleDateString('vi-VN', { dateStyle: 'long' })}
              </p>
            )}
            <h1 className="text-4xl md:text-5xl uppercase tracking-wide text-player-foreground leading-tight" style={{ fontFamily: "'Oswald'" }}>{post.title}</h1>
            <p className="mt-5 text-lg text-player-muted leading-relaxed font-medium">{post.excerpt}</p>
            <div className="w-full h-px bg-player-border mt-8 mb-8" />
            <div className="prose-eden" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
          </article>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0 self-start">
          <TableOfContents />
          <LatestNewsWidget currentPostId={post.id} />
        </aside>
      </div>
    </PageShell>
  )
}
