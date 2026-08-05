import { Node, mergeAttributes, nodeInputRule, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { formatDiscordTimestamp } from '@/lib/discordMarkdown'

export const DISCORD_TIMESTAMP_REGEX = /<t:(\d+)(?::([tTdDfFR]))?>/g

export const DiscordTimestamp = Node.create({
  name: 'discordTimestamp',

  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      timestamp: {
        default: null,
      },
      format: {
        default: 'f',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="discord-timestamp"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'discord-timestamp' }), '']
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiscordTimestampView)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: DISCORD_TIMESTAMP_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return {
            timestamp: match[1],
            format: match[2] || 'f',
          }
        },
      }),
    ]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: DISCORD_TIMESTAMP_REGEX,
        type: this.type,
        getAttributes: (match) => {
          return {
            timestamp: match[1],
            format: match[2] || 'f',
          }
        },
      }),
    ]
  },
})

// React component to render the Discord timestamp pill inside the editor
function DiscordTimestampView({ node }: any) {
  const { timestamp, format } = node.attrs
  
  if (!timestamp) return null

  // Use the existing formatDiscordTimestamp function to render it
  const date = new Date(parseInt(timestamp) * 1000)
  const formattedText = formatDiscordTimestamp(date, format)

  return (
    <NodeViewWrapper as="span" className="inline-block px-1.5 py-0.5 mx-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-md cursor-pointer transition-colors align-baseline select-all">
      {formattedText}
    </NodeViewWrapper>
  )
}
