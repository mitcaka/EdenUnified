'use client'

import dynamic from 'next/dynamic'

const DiscordComposer = dynamic(
  () => import('@/components/ui/DiscordComposer/DiscordComposer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#5865f2]" />
          <span className="text-sm">Đang tải editor...</span>
        </div>
      </div>
    ),
  }
)

export default function DiscordComposerClient() {
  return <DiscordComposer />
}
