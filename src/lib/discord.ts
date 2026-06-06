import { prisma } from './prisma'

// Interface cho payload Discord Webhook
interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  color?: number
  fields?: DiscordEmbedField[]
  timestamp?: string
}

interface DiscordPayload {
  content?: string
  embeds?: DiscordEmbed[]
  allowed_mentions?: {
    users?: string[]
  }
}

// Hàm gửi request base
async function sendDiscordWebhookMessage(payload: DiscordPayload) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    const isEnabled = process.env.DISCORD_NOTIFY_ENABLED === 'true'

    if (!isEnabled || !webhookUrl) {
      return // Skip silently if not configured or disabled
    }

    // Fire and forget, don't await to avoid blocking the main thread
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(error => {
      console.error('Lỗi khi gửi Discord webhook (Fetch error):', error.message)
    })
  } catch (error) {
    console.error('Lỗi khi chuẩn bị Discord webhook:', error)
  }
}

// Các màu sắc tương ứng priority
const PRIORITY_COLORS = {
  LOW: 0x808080,      // Xám
  MEDIUM: 0x3498db,   // Xanh dương
  HIGH: 0xe67e22,     // Cam
  CRITICAL: 0xe74c3c, // Đỏ
}

const getTaskUrl = (taskId: string) => {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3001'
  return `${baseUrl}/tasks/${taskId}`
}

// 1. Giao task / Đổi người nhận
export async function sendTaskAssignedNotification(taskId: string, actorId: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true }
    })
    const actor = await prisma.user.findUnique({ where: { id: actorId } })

    if (!task || !task.assignee || !actor) return

    const assignee = task.assignee
    let content = ''
    let allowedMentions: any = {}

    if (assignee.discordUserId) {
      content = `<@${assignee.discordUserId}> bạn vừa được giao một nhiệm vụ mới.`
      allowedMentions = { users: [assignee.discordUserId] }
    } else {
      content = `Người nhận việc: **${assignee.name}**`
    }

    await sendDiscordWebhookMessage({
      content,
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title: `Nhiệm vụ mới: ${task.title}`,
          description: task.description ? (task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description) : 'Không có mô tả',
          url: getTaskUrl(task.id),
          color: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.MEDIUM,
          fields: [
            { name: 'Dự án', value: task.project?.name || 'Không có', inline: true },
            { name: 'Độ ưu tiên', value: task.priority, inline: true },
            { name: 'Trạng thái', value: task.status, inline: true },
            { name: 'Hạn chót', value: task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có', inline: true },
            { name: 'Point', value: task.pointEstimate.toString(), inline: true },
            { name: 'Người giao', value: actor.name, inline: true },
          ]
        }
      ]
    })
  } catch (error) {
    console.error('Lỗi sendTaskAssignedNotification:', error)
  }
}

// 2. Gửi test/review (kèm note)
export async function sendTaskReviewRequestedNotification(taskId: string, actorId: string, noteContent?: string, hasEvidence: boolean = false) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { reviewer: true, project: true }
    })
    const actor = await prisma.user.findUnique({ where: { id: actorId } })

    if (!task || !actor) return

    let content = `**${actor.name}** vừa gửi yêu cầu review nhiệm vụ.`
    let allowedMentions: any = {}

    if (task.reviewer && task.reviewer.discordUserId) {
      content = `<@${task.reviewer.discordUserId}> có yêu cầu review nhiệm vụ từ **${actor.name}**.`
      allowedMentions = { users: [task.reviewer.discordUserId] }
    } else if (task.reviewer) {
      content += ` Người duyệt: **${task.reviewer.name}**`
    }

    const fields: DiscordEmbedField[] = [
      { name: 'Dự án', value: task.project?.name || 'Không có', inline: true },
      { name: 'Trạng thái', value: task.status, inline: true },
    ]

    if (noteContent) {
      fields.push({ name: 'Ghi chú', value: noteContent.length > 200 ? noteContent.substring(0, 200) + '...' : noteContent, inline: false })
    }
    
    if (hasEvidence) {
      fields.push({ name: 'Minh chứng', value: '📎 Có đính kèm minh chứng', inline: false })
    }

    await sendDiscordWebhookMessage({
      content,
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title: `Yêu cầu duyệt: ${task.title}`,
          url: getTaskUrl(task.id),
          color: PRIORITY_COLORS.MEDIUM,
          fields
        }
      ]
    })
  } catch (error) {
    console.error('Lỗi sendTaskReviewRequestedNotification:', error)
  }
}

// 3. Trả về yêu cầu sửa (Returned)
export async function sendTaskReturnedNotification(taskId: string, actorId: string, reason: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true }
    })
    const actor = await prisma.user.findUnique({ where: { id: actorId } })

    if (!task || !task.assignee || !actor) return

    let content = `**${actor.name}** yêu cầu sửa lại nhiệm vụ.`
    let allowedMentions: any = {}

    if (task.assignee.discordUserId) {
      content = `<@${task.assignee.discordUserId}> nhiệm vụ của bạn cần sửa lại.`
      allowedMentions = { users: [task.assignee.discordUserId] }
    }

    await sendDiscordWebhookMessage({
      content,
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title: `Yêu cầu sửa lại: ${task.title}`,
          url: getTaskUrl(task.id),
          color: PRIORITY_COLORS.HIGH, // Cảnh báo
          fields: [
            { name: 'Lý do trả về', value: reason.length > 200 ? reason.substring(0, 200) + '...' : reason, inline: false },
          ]
        }
      ]
    })
  } catch (error) {
    console.error('Lỗi sendTaskReturnedNotification:', error)
  }
}

// 4. Duyệt xong (Done)
export async function sendTaskDoneNotification(taskId: string, actorId: string, pointActual: number, note?: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true }
    })
    const actor = await prisma.user.findUnique({ where: { id: actorId } })

    if (!task || !task.assignee || !actor) return

    let content = `Nhiệm vụ đã được duyệt hoàn thành bởi **${actor.name}**.`
    let allowedMentions: any = {}

    if (task.assignee.discordUserId) {
      content = `Tuyệt vời <@${task.assignee.discordUserId}>! Nhiệm vụ của bạn đã được duyệt Done.`
      allowedMentions = { users: [task.assignee.discordUserId] }
    }

    const fields: DiscordEmbedField[] = [
      { name: 'Người làm', value: task.assignee.name, inline: true },
      { name: 'Điểm thực tế', value: `${pointActual}pt`, inline: true },
    ]

    if (note) {
      fields.push({ name: 'Nhận xét', value: note.length > 200 ? note.substring(0, 200) + '...' : note, inline: false })
    }

    await sendDiscordWebhookMessage({
      content,
      allowed_mentions: allowedMentions,
      embeds: [
        {
          title: `✅ Đã duyệt xong: ${task.title}`,
          url: getTaskUrl(task.id),
          color: 0x2ecc71, // Xanh lá cây
          fields
        }
      ]
    })
  } catch (error) {
    console.error('Lỗi sendTaskDoneNotification:', error)
  }
}
