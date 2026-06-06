'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

const NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/rules', label: 'Luật lệ' },
  { href: '/guides', label: 'Hướng dẫn' },
  { href: '/how-to-join', label: 'Cách tham gia' },
  { href: '/gallery', label: 'Thư viện' },
  { href: '/news', label: 'Tin tức' },
  { href: '/contact', label: 'Liên hệ' },
]

export function PlayerHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-[#0B0F0E]/90 backdrop-blur-lg border-player shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-0' 
          : 'bg-transparent border-transparent py-2'
      }`}
    >
      <div className="container-eden flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-player-primary opacity-40"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-player-primary shadow-[0_0_12px_var(--player-primary)]"></span>
          </span>
          <span className="text-2xl tracking-widest uppercase group-hover:text-white transition-colors" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>
            Eden <span className="text-player-primary">PZ</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((item) => {
            if (item.href === '/how-to-join') {
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="relative overflow-hidden group bg-player-primary text-[#0B0F0E] px-6 py-2 rounded font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                  style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </Link>
              )
            }
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className="group relative px-1 py-2 text-xs uppercase tracking-widest font-medium text-player-muted hover:text-white transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-player-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )
          })}
        </nav>

        <button 
          aria-label="Toggle menu" 
          onClick={() => setOpen(v => !v)} 
          className="lg:hidden p-2 rounded-md text-player-muted hover:text-white hover:bg-player-card transition-colors"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-player bg-[#0B0F0E]/95 backdrop-blur-xl ${
          open ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 py-0 border-transparent'
        }`}
      >
        <nav className="container-eden flex flex-col gap-2">
          {NAV.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setOpen(false)} 
              className={`px-4 py-3 text-sm tracking-wider uppercase rounded-md transition-colors ${
                item.href === '/how-to-join'
                  ? 'bg-player-primary text-[#0B0F0E] font-bold text-center mt-2'
                  : 'text-player-muted hover:text-white hover:bg-white/5'
              }`}
              style={item.href === '/how-to-join' ? { fontFamily: "'Oswald', 'Inter', sans-serif" } : {}}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function PlayerFooter({ settings }: { settings: Record<string, string> }) {
  return (
    <footer className="border-t border-player mt-24" style={{ backgroundColor: 'rgba(11,15,14,0.6)' }}>
      <div className="container-eden py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-xl uppercase tracking-wider" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>
            Eden <span className="text-player-primary">PZ</span>
          </div>
          <p className="text-sm text-player-muted mt-3 max-w-xs">
            Cộng đồng nhập vai Project Zomboid nghiêm túc. Không liên kết với The Indie Stone.
          </p>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider text-player-muted mb-3">Điều hướng</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/rules" className="hover:text-player-primary transition-colors">Luật lệ</Link></li>
            <li><Link href="/guides" className="hover:text-player-primary transition-colors">Hướng dẫn</Link></li>
            <li><Link href="/how-to-join" className="hover:text-player-primary transition-colors font-semibold">Cách tham gia</Link></li>
            <li><Link href="/gallery" className="hover:text-player-primary transition-colors">Thư viện</Link></li>
            <li><Link href="/news" className="hover:text-player-primary transition-colors">Tin tức</Link></li>
            <li><Link href="/faq" className="hover:text-player-primary transition-colors">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider text-player-muted mb-3">Kết nối</h4>
          <ul className="space-y-1.5 text-sm">
            {settings.discord_url && (
              <li><a href={settings.discord_url} target="_blank" rel="noreferrer" className="hover:text-player-primary transition-colors">Discord</a></li>
            )}
            {settings.server_ip && (
              <li className="font-mono text-xs text-player-muted">{settings.server_ip}</li>
            )}
            {settings.contact_email && (
              <li><a href={`mailto:${settings.contact_email}`} className="hover:text-player-primary transition-colors">{settings.contact_email}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-player">
        <div className="container-eden py-4 text-xs text-player-muted flex justify-between">
          <span>© {new Date().getFullYear()} Eden PZ</span>
          <span>Sống sót. Nhập vai. Chiến đấu.</span>
        </div>
      </div>
    </footer>
  )
}

// Shared UI components
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="container-eden py-12 min-h-[60vh]">
      {children}
    </main>
  )
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="mb-10 max-w-3xl">
      {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-player-primary mb-3">{eyebrow}</p>}
      <h1 className="text-4xl md:text-5xl uppercase tracking-wide" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>{title}</h1>
      {description && <p className="mt-4 text-player-muted text-lg leading-relaxed">{description}</p>}
    </header>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ backgroundColor: 'var(--player-card-elevated)' }} />
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-20 border border-dashed border-player rounded-xl">
      <p className="text-xl uppercase tracking-wide text-player-muted" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>{title}</p>
      {description && <p className="text-sm text-player-muted mt-2">{description}</p>}
    </div>
  )
}
