'use client'

import { useState, useCallback, useEffect } from 'react'
import { Clock, Copy, Check, RefreshCw } from 'lucide-react'
import {
  TIMESTAMP_FLAGS,
  TimestampFlag,
  formatDiscordTimestamp,
  getTimestampPreview,
  copyToClipboard,
} from '@/lib/discordMarkdown'

// Helper: format Date to local datetime-local input value
function dateToInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function DiscordTimestamp() {
  const [date, setDate] = useState<Date>(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now
  })
  const [flag, setFlag] = useState<TimestampFlag>('R')
  const [copied, setCopied] = useState(false)

  const timestampString = formatDiscordTimestamp(date, flag)
  const preview = getTimestampPreview(date, flag)

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(timestampString)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [timestampString])

  const handleNow = () => {
    const now = new Date()
    now.setSeconds(0, 0)
    setDate(now)
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[300px]">
        {/* Placeholder to prevent layout shift */}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
          <Clock className="h-4 w-4 text-indigo-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Discord Timestamp</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Date/Time Picker */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Chọn ngày & giờ
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateToInputValue(date)}
              onChange={(e) => {
                const val = e.target.value
                if (val) setDate(new Date(val))
              }}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              onClick={handleNow}
              title="Dùng thời gian hiện tại"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Hiện tại
            </button>
          </div>
        </div>

        {/* Format flags */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Định dạng hiển thị
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {TIMESTAMP_FLAGS.map(({ flag: f, label, example }) => (
              <button
                key={f}
                onClick={() => setFlag(f)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  flag === f
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{label}</span>
                <span className={`font-mono text-xs ${flag === f ? 'text-indigo-500' : 'text-gray-400'}`}>
                  {example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview + Output */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
          {/* Discord preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Hiển thị trong Discord:</span>
            <span className="rounded-md bg-[#5865f2]/10 px-2 py-0.5 text-xs font-semibold text-[#5865f2]">
              {preview}
            </span>
          </div>

          {/* Output string */}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 select-all">
              {timestampString}
            </code>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Đã copy!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
