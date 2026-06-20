import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

type Props = {
  currentGuideId: number
  categoryId: number
  take?: number
}

export default async function RelatedGuidesWidget({ currentGuideId, categoryId, take = 5 }: Props) {
  // Lấy tối đa `take` bài cùng chuyên mục, loại trừ bài hiện tại
  const guides = await prisma.guide.findMany({
    where: {
      isPublished: true,
      id: { not: currentGuideId },
      categoryId,
    },
    orderBy: { sortOrder: 'asc' },
    take,
    include: { category: { select: { name: true } } },
  })

  // Nếu không đủ bài cùng chuyên mục, bổ sung thêm từ chuyên mục khác
  const remaining = take - guides.length
  const supplementary =
    remaining > 0
      ? await prisma.guide.findMany({
          where: {
            isPublished: true,
            id: { notIn: [currentGuideId, ...guides.map(g => g.id)] },
          },
          orderBy: { sortOrder: 'asc' },
          take: remaining,
          include: { category: { select: { name: true } } },
        })
      : []

  const all = [...guides, ...supplementary]
  if (all.length === 0) return null

  const difficultyLabel: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  }

  const difficultyColor: Record<string, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  }

  return (
    <div className="bg-player-card border border-player rounded-xl p-5 shadow-lg">
      <h3
        className="text-lg uppercase tracking-wider text-player-foreground border-b border-player pb-3 mb-4 font-bold flex items-center gap-2"
        style={{ fontFamily: "'Oswald'" }}
      >
        <BookOpen size={16} className="text-player-primary" />
        Hướng dẫn liên quan
      </h3>

      <div className="flex flex-col gap-1">
        {all.map(guide => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="group flex items-start gap-2 rounded-lg p-2 -mx-2 hover:bg-white/5 transition-colors"
          >
            <ChevronRight
              size={14}
              className="mt-0.5 shrink-0 text-player-muted group-hover:text-player-primary transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-player-foreground group-hover:text-player-primary transition-colors line-clamp-2 leading-snug">
                {guide.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-player-muted uppercase tracking-widest">
                  {guide.category.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  <span className={difficultyColor[guide.difficulty] ?? 'text-player-muted'}>
                    · {difficultyLabel[guide.difficulty] ?? guide.difficulty}
                  </span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/guides"
        className="mt-4 pt-3 border-t border-player flex items-center justify-center gap-1 text-xs text-player-muted hover:text-player-primary uppercase tracking-widest transition-colors"
      >
        Xem tất cả hướng dẫn <ChevronRight size={12} />
      </Link>
    </div>
  )
}
