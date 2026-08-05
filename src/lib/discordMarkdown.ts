/**
 * discordMarkdown.ts
 * Converts Tiptap editor JSON to Discord Flavored Markdown (DFM).
 * Discord Markdown Reference:
 *   **bold**, *italic*, __underline__, ~~strike~~, ||spoiler||
 *   `inline code`, ```code block```, > blockquote
 *   - bullet list, 1. ordered list, -# small heading
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

// ─── Discord Timestamp ──────────────────────────────────────────────────────────

export type TimestampFlag = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'

export const TIMESTAMP_FLAGS: { flag: TimestampFlag; label: string; example: string }[] = [
  { flag: 't', label: 'Giờ ngắn', example: '16:20' },
  { flag: 'T', label: 'Giờ đầy đủ', example: '16:20:30' },
  { flag: 'd', label: 'Ngày ngắn', example: '20/04/2021' },
  { flag: 'D', label: 'Ngày đầy đủ', example: '20 April 2021' },
  { flag: 'f', label: 'Ngày + Giờ', example: '20 April 2021 16:20' },
  { flag: 'F', label: 'Ngày + Giờ đầy đủ', example: 'Tuesday, 20 April 2021 16:20' },
  { flag: 'R', label: 'Tương đối', example: '2 months ago' },
]

export function formatDiscordTimestamp(date: Date, flag: TimestampFlag): string {
  const unix = Math.floor(date.getTime() / 1000)
  return `<t:${unix}:${flag}>`
}

export function getTimestampPreview(date: Date, flag: TimestampFlag): string {
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' })
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSecs = Math.round(diffMs / 1000)

  if (flag === 'R') {
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)
    if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second')
    if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute')
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
    return rtf.format(diffDays, 'day')
  }

  const options: Intl.DateTimeFormatOptions = (() => {
    switch (flag) {
      case 't': return { hour: '2-digit', minute: '2-digit' }
      case 'T': return { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      case 'd': return { day: '2-digit', month: '2-digit', year: 'numeric' }
      case 'D': return { day: 'numeric', month: 'long', year: 'numeric' }
      case 'f': return { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      case 'F': return { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      default: return {}
    }
  })()

  return new Intl.DateTimeFormat('vi-VN', options).format(date)
}

// ─── Discord ANSI Color Mapping ─────────────────────────────────────────────────
// Discord ANSI colors in ```ansi blocks use escape sequences: ESC[{code}m
// ESC = \u001b (Unicode escape)

export const DISCORD_ANSI_COLORS: {
  name: string
  hex: string
  ansiCode: string | number
  preview: string
}[] = [
  { name: 'Xám đậm',     hex: '#4f545c', ansiCode: 30, preview: '#4f545c' },
  { name: 'Đỏ',          hex: '#dc322f', ansiCode: 31, preview: '#dc322f' },
  { name: 'Xanh lá',     hex: '#859900', ansiCode: 32, preview: '#859900' },
  { name: 'Vàng',        hex: '#b58900', ansiCode: 33, preview: '#b58900' },
  { name: 'Xanh dương',  hex: '#268bd2', ansiCode: 34, preview: '#268bd2' },
  { name: 'Hồng/Tím',    hex: '#d33682', ansiCode: 35, preview: '#d33682' },
  { name: 'Xanh ngọc',   hex: '#2aa198', ansiCode: 36, preview: '#2aa198' },
  { name: 'Trắng',       hex: '#ffffff', ansiCode: 37, preview: '#aaaaaa' },
  // Bright variants (Discord doesn't support 90-97, so we use Bold 1;3x instead)
  { name: 'Xám sáng',    hex: '#657b83', ansiCode: '1;30', preview: '#657b83' },
  { name: 'Đỏ sáng',     hex: '#ff4444', ansiCode: '1;31', preview: '#ff4444' },
  { name: 'Xanh sáng',   hex: '#5bc96c', ansiCode: '1;32', preview: '#5bc96c' },
  { name: 'Vàng sáng',   hex: '#ffcc00', ansiCode: '1;33', preview: '#ffcc00' },
  { name: 'Xanh sáng',   hex: '#4fb3f6', ansiCode: '1;34', preview: '#4fb3f6' },
  { name: 'Hồng sáng',   hex: '#ff79c6', ansiCode: '1;35', preview: '#ff79c6' },
  { name: 'Ngọc sáng',   hex: '#7dd8d1', ansiCode: '1;36', preview: '#7dd8d1' },
  { name: 'Trắng sáng',  hex: '#f8f8f2', ansiCode: '1;37', preview: '#cccccc' },
]

function hexToAnsiCode(hex: string): string | number | null {
  const normalized = hex.toLowerCase()
  const match = DISCORD_ANSI_COLORS.find(
    (c) => c.hex.toLowerCase() === normalized
  )
  return match ? match.ansiCode : null
}

function applyMarks(text: string, marks: TiptapMark[]): string {
  let result = text
  let colorCode: string | number | null = null

  // Check for color first
  for (const mark of marks) {
    if (mark.type === 'textStyle') {
      const color = mark.attrs?.color as string | undefined
      if (color) {
        colorCode = hexToAnsiCode(color)
      }
    }
  }

  if (colorCode !== null) {
    // Discord ANSI blocks DO NOT support markdown (*, **, ~~).
    // But they DO support ANSI styles (1 for bold, 4 for underline).
    let styles = ''
    for (const mark of marks) {
      if (mark.type === 'bold') styles += '1;'
      if (mark.type === 'underline') styles += '4;'
      // italic, strike, spoiler do not have standard Discord ANSI equivalents, they will be ignored in ANSI
    }
    
    const finalCode = styles + colorCode.toString()
    const ESC = '\u001b'
    result = `${ESC}[${finalCode}m${result}${ESC}[0m`
  } else {
    // Apply standard Markdown if not colored
    for (const mark of marks) {
      switch (mark.type) {
        case 'bold':
          result = `**${result}**`
          break
        case 'italic':
          result = `*${result}*`
          break
        case 'underline':
          result = `__${result}__`
          break
        case 'strike':
          result = `~~${result}~~`
          break
        case 'spoiler':
          result = `||${result}||`
          break
        case 'code':
          result = `\`${result}\``
          break
      }
    }
  }

  return result
}


function hasColorMark(nodes: TiptapNode[]): boolean {
  return nodes.some(
    (n) => n.type === 'text' && n.marks?.some((m) => m.type === 'textStyle' && m.attrs?.color)
  )
}

function convertInlineNodes(nodes: TiptapNode[]): string {
  const parts = nodes.map((node) => {
    if (node.type === 'text') {
      const text = node.text ?? ''
      if (!node.marks || node.marks.length === 0) return text
      return applyMarks(text, node.marks)
    }
    if (node.type === 'hardBreak') return '\n'
    if (node.type === 'discordTimestamp') {
      const { timestamp, format } = node.attrs ?? {}
      if (!timestamp) return ''
      return `<t:${timestamp}:${format ?? 'f'}>`
    }
    return ''
  })

  const content = parts.join('')

  // If any node has color, wrap the whole inline in an ANSI code block
  if (hasColorMark(nodes)) {
    return `\`\`\`ansi\n${content}\n\`\`\``
  }

  return content
}

function convertNode(node: TiptapNode, listContext?: { ordered: boolean; depth: number }): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map((n) => convertNode(n)).join('\n')

    case 'paragraph': {
      if (!node.content || node.content.length === 0) return ''
      return convertInlineNodes(node.content)
    }

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      const text = convertInlineNodes(node.content ?? [])
      // Discord only supports -# for small headings, no standard # headings
      if (level >= 3) return `-# ${text}`
      // Levels 1-2: Discord renders # and ## as headers (new Discord feature)
      return `${'#'.repeat(level)} ${text}`
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map((n) => convertNode(n)).join('\n')
      return inner
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    }

    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? ''
      const code = (node.content ?? []).map((n) => n.text ?? '').join('')
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'bulletList': {
      return (node.content ?? [])
        .map((item) => {
          const inner = (item.content ?? []).map((n) => convertNode(n)).join('\n')
          return `- ${inner}`
        })
        .join('\n')
    }

    case 'orderedList': {
      return (node.content ?? [])
        .map((item, idx) => {
          const inner = (item.content ?? []).map((n) => convertNode(n)).join('\n')
          return `${idx + 1}. ${inner}`
        })
        .join('\n')
    }

    case 'listItem': {
      return (node.content ?? []).map((n) => convertNode(n)).join('\n')
    }

    case 'horizontalRule':
      return '---'

    case 'discordTimestamp': {
      const { timestamp, format } = node.attrs ?? {}
      if (!timestamp) return ''
      return `<t:${timestamp}:${format ?? 'f'}>`
    }

    default:
      // Fallback: try to extract inline text
      if (node.content) return convertInlineNodes(node.content)
      if (node.text) return node.text
      return ''
  }
}

/**
 * Convert Tiptap editor JSON to Discord Markdown string.
 */
export function editorJsonToDiscordMarkdown(json: TiptapNode): string {
  const lines = (json.content ?? []).map((node) => convertNode(node))
  // Filter out trailing empty lines but keep internal ones
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Copy text to clipboard (handles both modern and fallback).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}
