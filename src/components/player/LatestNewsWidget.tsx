import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

type Props = {
  currentPostId: string
  take?: number
}

export default async function LatestNewsWidget({ currentPostId, take = 4 }: Props) {
  const posts = await prisma.newsPost.findMany({
    where: {
      status: 'published',
      id: { not: currentPostId } // Loại trừ bài hiện tại
    },
    orderBy: { publishedAt: 'desc' },
    take
  })

  if (posts.length === 0) return null

  return (
    <div className="bg-player-card border border-player rounded-xl p-5 shadow-lg">
      <h3 className="text-lg uppercase tracking-wider text-player-foreground border-b border-player pb-3 mb-4 font-bold" style={{ fontFamily: "'Oswald'" }}>
        Tin tức mới nhất
      </h3>
      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <Link key={post.id} href={`/news/${post.slug}`} className="group flex gap-3 items-start">
            <div className="w-20 h-14 flex-shrink-0 rounded bg-player-muted overflow-hidden border border-player group-hover:border-player-primary transition-colors">
              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-player-muted-foreground bg-black/20">News</div>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <h4 className="text-sm font-medium text-player-foreground group-hover:text-player-primary transition-colors line-clamp-2 leading-snug" title={post.title}>
                {post.title}
              </h4>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-player-muted uppercase tracking-widest">
                <Calendar size={10} />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Unknown'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
