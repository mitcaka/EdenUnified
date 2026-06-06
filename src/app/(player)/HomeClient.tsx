'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check, Shield, BookOpen, Users } from 'lucide-react'
import { useState } from 'react'
import BattleMetricsWidget from '@/components/player/BattleMetricsWidget'

export function HeroSection({ settings }: { settings: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-player bg-player-card grain mb-20">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(180deg, transparent 0%, var(--player-background) 90%), url('${settings.hero_banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2000'}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      <div className="relative px-6 md:px-12 py-20 md:py-32">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs uppercase tracking-[0.3em] text-player-primary mb-4 font-bold">
          Nhập vai có xét duyệt · Thế giới liên tục
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-6xl md:text-8xl font-bold uppercase tracking-wide leading-none max-w-4xl text-white drop-shadow-lg" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>
          {settings.server_name ?? 'EDEN PZ'}
        </motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-2xl md:text-4xl font-semibold uppercase tracking-wider text-player-primary mt-3 drop-shadow-md" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>
          Sống sót. Nhập vai. Chiến đấu.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-6 max-w-xl text-lg text-gray-300 leading-relaxed font-medium">
          {settings.description ?? 'Survive, build, and write your story in a persistent post-apocalyptic Kentucky. Eden PZ is a community-driven roleplay server focused on immersion and consequence.'}
        </motion.p>
        
        <div className="mt-8">
          <BattleMetricsWidget serverId={settings.battlemetrics_id} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-8 flex flex-wrap items-center gap-3">
          {settings.discord_url && (
            <a href={settings.discord_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-player-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-player-foreground hover:opacity-90 transition-all hover:translate-y-[-1px]" style={{ color: 'var(--player-primary-foreground)', boxShadow: '0 8px 24px -8px var(--player-primary)' }}>
              Tham gia Discord <ArrowRight size={16} />
            </a>
          )}
          <Link href="/how-to-join" className="inline-flex items-center gap-2 rounded-md border border-player px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-player-card-elevated transition-colors">
            Cách tham gia
          </Link>
          {settings.server_ip && <ServerIp ip={settings.server_ip} />}
        </motion.div>
      </div>
    </section>
  )
}

function ServerIp({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(ip); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="inline-flex items-center gap-2 rounded-md border border-player px-4 py-3 text-sm font-mono hover:border-player-primary transition-colors" style={{ backgroundColor: 'rgba(11,15,14,0.6)' }}
    >
      <span className="text-player-muted">IP:</span> {ip}
      {copied ? <Check size={14} className="text-player-primary" /> : <Copy size={14} className="text-player-muted" />}
    </button>
  )
}

export function PillarCards() {
  const pillars = [
    { icon: Shield, title: 'Xét duyệt', desc: 'Mỗi người chơi được xét duyệt. Chất lượng hơn số lượng.' },
    { icon: Users, title: 'Ưu tiên nhân vật', desc: 'Câu chuyện, không phải chỉ số. Nỗi sợ, điểm yếu và hậu quả.' },
    { icon: BookOpen, title: 'Liên tục', desc: 'Mỗi mùa kéo dài hàng tháng. Lựa chọn của bạn để lại dấu vết.' },
  ]

  return (
    <section className="grid md:grid-cols-3 gap-4 mb-20">
      {pillars.map((p, i) => (
        <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-xl border border-player bg-player-card p-6 hover:bg-player-card-elevated transition-colors">
          <p.icon className="text-player-primary mb-4" size={24} />
          <h3 className="uppercase tracking-wide text-lg" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>{p.title}</h3>
          <p className="text-sm text-player-muted mt-2">{p.desc}</p>
        </motion.div>
      ))}
    </section>
  )
}

type NewsCardData = { id: string; slug: string; title: string; excerpt: string; coverImageUrl: string | null; publishedAt: string | null }

export function NewsCards({ news }: { news: NewsCardData[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {news.map((n) => (
        <Link key={n.id} href={`/news/${n.slug}`} className="group rounded-xl border border-player bg-player-card overflow-hidden hover:border-player-primary transition-all">
          {n.coverImageUrl && (
            <div className="aspect-[16/10] overflow-hidden">
              <img src={n.coverImageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <div className="p-5">
            {n.publishedAt && (
              <p className="text-xs uppercase tracking-wider text-player-muted mb-2">
                {new Date(n.publishedAt).toLocaleDateString('vi-VN', { dateStyle: 'medium' })}
              </p>
            )}
            <h3 className="text-lg uppercase tracking-wide group-hover:text-player-primary transition-colors" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>{n.title}</h3>
            <p className="text-sm text-player-muted mt-2 line-clamp-2">{n.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
