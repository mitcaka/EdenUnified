import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FileText, Newspaper, Shield, BookOpen, Image, HelpCircle, Settings, Scroll } from 'lucide-react'

export default async function ContentPage() {
  const [newsCount, pageCount, ruleCount, guideCount, mediaCount, faqCount, settingsCount] = await Promise.all([
    prisma.newsPost.count(),
    prisma.page.count(),
    prisma.rule.count(),
    prisma.guide.count(),
    prisma.mediaItem.count(),
    prisma.faq.count(),
    prisma.siteSetting.count(),
  ])

  const sections = [
    { name: 'Cài đặt trang', href: '/admin/content/settings', icon: Settings, count: settingsCount, desc: 'Tên server, IP, Discord, email liên hệ' },
    { name: 'Tin tức', href: '/admin/content/news', icon: Newspaper, count: newsCount, desc: 'Bài viết, thông báo, cập nhật' },
    { name: 'Trang nội dung', href: '/admin/content/pages', icon: Scroll, count: pageCount, desc: 'RP Guide, How to Join...' },
    { name: 'Luật máy chủ', href: '/admin/content/rules', icon: Shield, count: ruleCount, desc: 'Danh mục + luật chi tiết' },
    { name: 'Hướng dẫn', href: '/admin/content/guides', icon: BookOpen, count: guideCount, desc: 'Bài hướng dẫn cho người chơi' },
    { name: 'Thư viện', href: '/admin/content/gallery', icon: Image, count: mediaCount, desc: 'Ảnh và video' },
    { name: 'Câu hỏi (FAQ)', href: '/admin/content/faq', icon: HelpCircle, count: faqCount, desc: 'Câu hỏi thường gặp' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung</h1>
        <p className="text-sm text-gray-500 mt-1">Chỉnh sửa nội dung hiển thị trên trang người chơi</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(s => (
          <Link key={s.href} href={s.href} className="group block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 mb-2">
              <s.icon className="text-blue-500" size={20} />
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{s.count}</span>
            </div>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
