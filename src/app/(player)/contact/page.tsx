import { prisma } from '@/lib/prisma'
import { PageShell, PageHeader } from '@/components/player/PlayerComponents'
import { MessageCircle, Mail, Server } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Liên hệ', description: 'Reach the Eden PZ staff team.' }

export default async function ContactPage() {
  const rows = await prisma.siteSetting.findMany()
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))

  return (
    <PageShell>
      <PageHeader eyebrow="Liên hệ chúng tôi" title="Liên hệ" description="Cách nhanh nhất để được phản hồi là Discord. Đơn đăng ký, báo cáo và câu hỏi đều ở đó." />
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        {settings.discord_url && (
          <a href={settings.discord_url} target="_blank" rel="noreferrer" className="group rounded-xl border border-player bg-player-card p-6 hover:border-player-primary hover:bg-player-card-elevated transition-all">
            <MessageCircle className="text-player-primary mb-4" size={28} />
            <h3 className="text-lg uppercase tracking-wide" style={{ fontFamily: "'Oswald'" }}>Discord</h3>
            <p className="text-sm text-player-muted mt-1">Cộng đồng, đơn đăng ký, hỗ trợ.</p>
            <p className="text-xs text-player-primary mt-3 group-hover:underline">Mở lời mời →</p>
          </a>
        )}
        {settings.contact_email && (
          <a href={`mailto:${settings.contact_email}`} className="group rounded-xl border border-player bg-player-card p-6 hover:border-player-primary hover:bg-player-card-elevated transition-all">
            <Mail className="text-player-secondary mb-4" size={28} />
            <h3 className="text-lg uppercase tracking-wide" style={{ fontFamily: "'Oswald'" }}>Email</h3>
            <p className="text-sm text-player-muted mt-1">{settings.contact_email}</p>
            <p className="text-xs text-player-primary mt-3 group-hover:underline">Đối với vấn đề nhạy cảm →</p>
          </a>
        )}
        {settings.server_ip && (
          <div className="rounded-xl border border-player bg-player-card p-6 md:col-span-2">
            <Server className="text-player-muted mb-4" size={28} />
            <h3 className="text-lg uppercase tracking-wide" style={{ fontFamily: "'Oswald'" }}>Máy chủ</h3>
            <p className="font-mono text-sm text-player-muted mt-1">{settings.server_ip}</p>
            <p className="text-xs text-player-muted mt-3">Yêu cầu danh sách trắng. Đăng ký trên Discord trước.</p>
          </div>
        )}
      </div>
    </PageShell>
  )
}
