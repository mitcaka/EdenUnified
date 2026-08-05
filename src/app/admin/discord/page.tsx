import type { Metadata } from 'next'
import DiscordComposerClient from '@/components/ui/DiscordComposer/DiscordComposerClient'
import DiscordTimestamp from '@/components/ui/DiscordComposer/DiscordTimestamp'
import { MessageSquare, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Discord Composer',
}

export default function DiscordComposerPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5865f2]/10">
            <MessageSquare className="h-5 w-5 text-[#5865f2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discord Post Composer</h1>
            <p className="text-sm text-gray-500">Soạn thảo bài đăng Discord với định dạng chuẩn</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700 leading-relaxed">
          Soạn thảo bài đăng bên dưới rồi nhấn{' '}
          <strong>Copy Discord Markdown</strong>. Paste (<kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">Ctrl+V</kbd>)
          thẳng vào Discord — nội dung sẽ hiển thị đúng định dạng ngay lập tức.
        </p>
      </div>

      {/* Main Layout: Editor + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Format Cheatsheet */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hướng dẫn nhanh
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-4 py-3 sm:grid-cols-3">
              {[
                { label: 'Bold', md: '**text**' },
                { label: 'Italic', md: '*text*' },
                { label: 'Underline', md: '__text__' },
                { label: 'Strikethrough', md: '~~text~~' },
                { label: 'Spoiler', md: '||text||' },
                { label: 'Inline Code', md: '`text`' },
                { label: 'Code Block', md: '```code```' },
                { label: 'Blockquote', md: '> text' },
                { label: 'Danh sách', md: '- item' },
              ].map(({ label, md }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-20 shrink-0">{label}:</span>
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-700 text-[11px]">
                    {md}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* The Composer (client-side dynamic) */}
          <DiscordComposerClient />
        </div>

        {/* Sidebar: Timestamp Tool (1/3 width) */}
        <div className="space-y-4">
          <DiscordTimestamp />

          {/* Quick tips */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Mẹo Discord
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
              <li>• Giới hạn 2000 ký tự / tin nhắn</li>
              <li>• Dùng <code className="rounded bg-gray-100 px-1 font-mono">@everyone</code> với cẩn thận</li>
              <li>• Spoiler ẩn nội dung cho đến khi click</li>
              <li>• Timestamp tự động hiển thị múi giờ của người xem</li>
              <li>• Code block hỗ trợ syntax highlight (js, py, cs...)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
