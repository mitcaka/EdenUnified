'use client'

import { useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import dynamic from 'next/dynamic'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Quote,
  List,
  ListOrdered,
  Copy,
  Check,
  EyeOff,
  Minus,
  Eraser,
  Smile,
  Maximize2,
  Minimize2,
  Palette,
  X,
} from 'lucide-react'
import { editorJsonToDiscordMarkdown, copyToClipboard, DISCORD_ANSI_COLORS } from '@/lib/discordMarkdown'
import { DiscordTimestamp } from './extensions/DiscordTimestamp'

// ─── Dynamic Emoji Picker (client-only) ─────────────────────────────────────────
const EmojiPicker = dynamic(
  async () => {
    const { default: Picker } = await import('@emoji-mart/react')
    const data = (await import('@emoji-mart/data')).default
    // eslint-disable-next-line react/display-name
    return function EmojiPickerWrapper(props: { onEmojiSelect: (e: { native: string }) => void; onClose: () => void }) {
      return (
        <div className="relative">
          <button
            onClick={props.onClose}
            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
          <Picker
            data={data}
            onEmojiSelect={props.onEmojiSelect}
            locale="vi"
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )
    }
  },
  { ssr: false }
)

// ─── Custom Spoiler Mark ────────────────────────────────────────────────────────

const SpoilerMark = Mark.create({
  name: 'spoiler',
  parseHTML() {
    return [{ tag: 'span[data-spoiler]' }]
  },
  renderHTML() {
    return ['span', { 'data-spoiler': '', class: 'discord-spoiler' }, 0]
  },
  addInputRules() {
    return [markInputRule({ find: /\|\|([^|]+)\|\|$/, type: this.type })]
  },
  addPasteRules() {
    return [markPasteRule({ find: /\|\|([^|]+)\|\|/g, type: this.type })]
  },
})

// ─── Toolbar Button ─────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all text-sm font-medium
        ${isActive
          ? 'bg-[#5865f2] text-white shadow-sm shadow-[#5865f2]/30'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="h-5 w-px bg-gray-200 mx-0.5" />
}

// ─── Color Picker Dropdown ──────────────────────────────────────────────────────

function ColorPicker({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentColor = editor?.getAttributes('textStyle').color as string | undefined

  const handleColor = (hex: string) => {
    if (!editor) return
    if (currentColor === hex) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(hex).run()
    }
    setOpen(false)
  }

  const handleClear = () => {
    editor?.chain().focus().unsetColor().run()
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Màu chữ (Discord ANSI)"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 w-8 flex-col items-center justify-center rounded-lg transition-all gap-0.5
          ${open ? 'bg-[#5865f2] text-white shadow-sm shadow-[#5865f2]/30' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
      >
        <Palette className="h-3.5 w-3.5" />
        {/* Color indicator underline */}
        <span
          className="block h-1 w-5 rounded-full transition-colors"
          style={{ backgroundColor: currentColor ?? 'transparent', border: currentColor ? 'none' : '1px solid #d1d5db' }}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-20 w-52 rounded-xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/80">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Màu Discord ANSI
            </p>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {DISCORD_ANSI_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => handleColor(c.hex)}
                  className={`h-5 w-5 rounded-full border-2 transition-all hover:scale-110 ${
                    currentColor === c.hex ? 'border-[#5865f2] scale-110' : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: c.preview }}
                />
              ))}
            </div>
            {currentColor && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-lg border border-gray-200 py-1 text-xs text-gray-500 hover:bg-gray-50 transition"
              >
                Xóa màu
              </button>
            )}
            <p className="mt-2 text-[9px] text-gray-400 leading-tight">
              ⚠ Màu chỉ hiển thị trong Discord khi dùng <code className="font-mono">```ansi```</code> block
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Composer Component ────────────────────────────────────────────────────

export default function DiscordComposer() {
  const [discordMarkdown, setDiscordMarkdown] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [charCount, setCharCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: false,
      }),
      Underline,
      TextStyle,
      Color,
      SpoilerMark,
      DiscordTimestamp,
      Placeholder.configure({
        placeholder: 'Soạn thảo bài đăng Discord của bạn... (hỗ trợ **bold**, *italic*, ||spoiler||)',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'discord-editor focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON()
      const md = editorJsonToDiscordMarkdown(json as Parameters<typeof editorJsonToDiscordMarkdown>[0])
      setDiscordMarkdown(md)
      setCharCount(md.length)
    },
    immediatelyRender: false,
  })

  const handleCopy = useCallback(async () => {
    if (!discordMarkdown) return
    const ok = await copyToClipboard(discordMarkdown)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [discordMarkdown])

  const handleClear = useCallback(() => {
    editor?.commands.clearContent()
    setDiscordMarkdown('')
    setCharCount(0)
  }, [editor])

  const handleEmojiSelect = useCallback((emoji: { native: string }) => {
    editor?.chain().focus().insertContent(emoji.native).run()
    setShowEmojiPicker(false)
  }, [editor])

  if (!editor) return null

  const isDiscordLimit = charCount > 2000

  // ── Shared Toolbar ─────────────────────────────────────────────────────────────

  const toolbar = (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-2xl border border-b-0 border-gray-200 bg-gray-50 px-3 py-2">
      {/* Heading dropdown */}
      <select
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : '0'
        }
        onChange={(e) => {
          const val = e.target.value
          if (val === '0') {
            editor.chain().focus().setParagraph().run()
          } else {
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(val) as 1 | 2 | 3 })
              .run()
          }
        }}
        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 focus:border-[#5865f2] focus:outline-none focus:ring-1 focus:ring-[#5865f2]/30 transition mr-1"
      >
        <option value="0">Thường</option>
        <option value="1">Tiêu đề lớn</option>
        <option value="2">Tiêu đề vừa</option>
        <option value="3">Tiêu đề nhỏ (-#)</option>
      </select>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B) → **text**">
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I) → *text*">
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U) → __text__">
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough → ~~text~~">
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleMark('spoiler').run()} isActive={editor.isActive('spoiler')} title="Spoiler → ||text||">
        <EyeOff className="h-4 w-4" />
      </ToolbarButton>

      {/* Color picker */}
      <ColorPicker editor={editor} />

      <ToolbarDivider />

      {/* Code */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code → `text`">
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block → ```code```">
        <Code2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote → > text">
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Danh sách → - item">
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Danh sách số → 1. item">
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang → ---">
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Emoji Picker Button */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowEmojiPicker((v) => !v)}
          isActive={showEmojiPicker}
          title="Chèn emoji 😊"
        >
          <Smile className="h-4 w-4" />
        </ToolbarButton>
        {showEmojiPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
            <div className="absolute left-0 top-10 z-20 rounded-xl overflow-hidden shadow-2xl shadow-gray-300/50 border border-gray-200">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </>
        )}
      </div>

      <ToolbarDivider />

      {/* Utilities */}
      <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Xóa định dạng">
        <Eraser className="h-4 w-4" />
      </ToolbarButton>

      {/* Fullscreen toggle */}
      <ToolbarButton
        onClick={() => setIsFullscreen((v) => !v)}
        title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Phóng to trình soạn thảo'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </ToolbarButton>
    </div>
  )

  // ── Bottom Bar ─────────────────────────────────────────────────────────────────

  const bottomBar = (
    <div className="flex items-center justify-between rounded-b-2xl border border-t-0 border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium tabular-nums ${isDiscordLimit ? 'text-red-500' : 'text-gray-400'}`}>
          {charCount} / 2000
        </span>
        {isDiscordLimit && (
          <span className="text-xs text-red-500 font-medium">⚠ Vượt giới hạn Discord</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
        >
          Xóa tất cả
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            showPreview ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
        >
          {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!discordMarkdown}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" />Đã copy!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" />Copy Discord Markdown</>
          )}
        </button>
      </div>
    </div>
  )

  // ── Markdown Preview ───────────────────────────────────────────────────────────

  const preview = showPreview && (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Raw Discord Markdown
        </span>
        <span className="text-xs text-gray-400">Paste nội dung này vào Discord</span>
      </div>
      <pre className="min-h-[80px] overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-gray-700 selection:bg-[#5865f2]/20">
        {discordMarkdown || (
          <span className="text-gray-300 italic">Chưa có nội dung...</span>
        )}
      </pre>
    </div>
  )

  // ── FULLSCREEN MODE ────────────────────────────────────────────────────────────

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-sm font-semibold text-gray-700">Discord Post Composer</span>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 transition"
            title="Thoát toàn màn hình (Esc)"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Thu nhỏ
          </button>
        </div>

        {/* Fullscreen Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-3 py-2">
          {/* same toolbar elements — reuse via shared var */}
          <select
            value={
              editor.isActive('heading', { level: 1 }) ? '1'
              : editor.isActive('heading', { level: 2 }) ? '2'
              : editor.isActive('heading', { level: 3 }) ? '3'
              : '0'
            }
            onChange={(e) => {
              const val = e.target.value
              if (val === '0') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: Number(val) as 1 | 2 | 3 }).run()
            }}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 focus:border-[#5865f2] focus:outline-none mr-1"
          >
            <option value="0">Thường</option>
            <option value="1">Tiêu đề lớn</option>
            <option value="2">Tiêu đề vừa</option>
            <option value="3">Tiêu đề nhỏ (-#)</option>
          </select>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike"><Strikethrough className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleMark('spoiler').run()} isActive={editor.isActive('spoiler')} title="Spoiler"><EyeOff className="h-4 w-4" /></ToolbarButton>
          <ColorPicker editor={editor} />
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><Code className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block"><Code2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote"><Quote className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="List"><List className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="HR"><Minus className="h-4 w-4" /></ToolbarButton>
          <ToolbarDivider />
          <div className="relative">
            <ToolbarButton onClick={() => setShowEmojiPicker((v) => !v)} isActive={showEmojiPicker} title="Emoji 😊">
              <Smile className="h-4 w-4" />
            </ToolbarButton>
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute left-0 top-10 z-20 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                </div>
              </>
            )}
          </div>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear format"><Eraser className="h-4 w-4" /></ToolbarButton>
        </div>

        {/* Fullscreen Editor */}
        <div className="flex flex-1 overflow-hidden">
          <EditorContent
            editor={editor}
            className="flex-1 overflow-y-auto px-8 py-6 text-base leading-relaxed text-gray-800"
          />
          <div className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50 flex flex-col">
            {showPreview && (
              <div className="flex-1 border-b border-gray-200">
                <div className="border-b border-gray-200 bg-white px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
                </div>
                <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-gray-700">
                  {discordMarkdown || <span className="text-gray-300 italic">Chưa có nội dung...</span>}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Bottom */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium tabular-nums ${isDiscordLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {charCount} / 2000
            </span>
            {isDiscordLimit && <span className="text-xs text-red-500 font-medium">⚠ Vượt giới hạn</span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleClear} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 transition">Xóa tất cả</button>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${showPreview ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}>
              {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!discordMarkdown}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {copied ? <><Check className="h-3.5 w-3.5" />Đã copy!</> : <><Copy className="h-3.5 w-3.5" />Copy Discord Markdown</>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── NORMAL MODE ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-0">
      {toolbar}

      {/* Editor Area */}
      <div className="relative min-h-[220px] rounded-none border border-gray-200 bg-white">
        <EditorContent
          editor={editor}
          className="min-h-[220px] px-4 py-3 text-sm leading-relaxed text-gray-800"
        />
      </div>

      {bottomBar}
      {preview}
    </div>
  )
}
