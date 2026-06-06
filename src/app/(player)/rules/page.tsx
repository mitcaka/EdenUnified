import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { RulesClient } from './RulesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Luật máy chủ', description: 'The rules that govern Eden PZ.' }

export default async function RulesPage() {
  const [categories, rules] = await Promise.all([
    prisma.ruleCategory.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.rule.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <PageShell>
      <PageHeader eyebrow="Đọc trước khi đăng ký" title="Luật máy chủ" description="Đây là các quy tắc bắt buộc. Vi phạm những điều nghiêm trọng sẽ bị xóa vĩnh viễn. Hãy đọc tất cả." />
      <RulesClient categories={categories} rules={rules} />
    </PageShell>
  )
}
