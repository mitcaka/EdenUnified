'use client'

import { useEffect, useState } from 'react'

type TocItem = {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // 1. Quét tìm tất cả h2, h3 trong bài viết
    const articleContent = document.querySelector('.prose-eden')
    if (!articleContent) return

    const elements = Array.from(articleContent.querySelectorAll('h2'))
    
    // Nếu không có header nào, thoát
    if (elements.length === 0) return

    const toc: TocItem[] = elements.map((el, idx) => {
      // 2. Tự động cấp ID nếu thẻ header chưa có
      if (!el.id) {
        // Biến text thành dạng slug không dấu
        let generatedId = el.textContent
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `heading-${idx}`
          
        // Thêm index để tránh trùng lặp id
        generatedId = `${generatedId}-${idx}`
        el.id = generatedId
      }

      return {
        id: el.id,
        text: el.textContent || '',
        level: 2
      }
    })

    setHeadings(toc)

    // 3. Khởi tạo Intersection Observer để track vị trí cuộn
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Lấy tất cả các entry đang lọt vào khung hình
      const visibleEntries = entries.filter(entry => entry.isIntersecting)
      
      if (visibleEntries.length > 0) {
        // Lấy thẻ hiển thị cao nhất (hoặc theo ý đồ)
        setActiveId(visibleEntries[0].target.id)
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '0px 0px -60% 0px', // Header sẽ active khi nó trồi lên 40% màn hình trên
      threshold: 1.0
    })

    elements.forEach(el => observer.observe(el))

    return () => {
      elements.forEach(el => observer.unobserve(el))
      observer.disconnect()
    }
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="bg-player-card border border-player rounded-xl p-5 mb-6 shadow-lg">
      <h3 className="text-lg uppercase tracking-wider text-player-foreground border-b border-player pb-3 mb-4 font-bold" style={{ fontFamily: "'Oswald'" }}>
        Nội dung bài viết
      </h3>
      <nav className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {headings.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              const target = document.getElementById(item.id)
              if (target) {
                // Cuộn mượt với một chút offset để không bị dính sát mép trên
                const yOffset = -100 
                const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
                window.scrollTo({ top: y, behavior: 'smooth' })
              }
            }}
            className={`
              text-sm transition-all duration-200 block truncate
              ${item.level === 3 ? 'ml-4 text-[13px]' : 'font-medium'}
              ${activeId === item.id 
                ? 'text-player-primary translate-x-1' 
                : 'text-player-muted hover:text-player-foreground hover:translate-x-1'
              }
            `}
            title={item.text}
          >
            {activeId === item.id && <span className="mr-1.5 opacity-80">▶</span>}
            {item.text}
          </a>
        ))}
      </nav>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--player-border); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--player-muted-foreground); }
      `}} />
    </div>
  )
}
