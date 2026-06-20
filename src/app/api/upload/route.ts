import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

// Route segment config: tắt body size limit mặc định (~4MB) để cho phép upload video lớn
export const maxDuration = 300 // 5 minutes (cho chunked upload / video lớn)

// Tắt body parser mặc định của Next.js, xử lý stream trực tiếp
// Điều này bỏ giới hạn 4MB mặc định của API Routes
export const dynamic = 'force-dynamic'


const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'image/avif',
]
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
  'video/avi', 'video/x-msvideo',
]
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

// MEMBER chỉ được upload vào các folder được phép này
const MEMBER_ALLOWED_FOLDERS = ['Team_Media/tasks']

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdminOrOwner = session.role === 'OWNER' || session.role === 'ADMIN'

    const { searchParams } = new URL(request.url)
    const isRaw = searchParams.get('raw') === 'true'

    let fileStream: any
    let fileName = ''
    let mimeType = ''
    let folder = 'CMS_Media'
    let size = 0

    if (isRaw) {
      folder = searchParams.get('folder') || 'CMS_Media'
      fileName = searchParams.get('name') || 'upload.bin'
      mimeType = searchParams.get('type') || request.headers.get('content-type') || ''
      
      const arrayBuffer = await request.arrayBuffer()
      fileStream = Buffer.from(arrayBuffer)
      size = fileStream.length
    } else {
      // Fallback for older components still using FormData
      const formData = await request.formData()
      const file = formData.get('file') as File
      folder = (formData.get('folder') as string) || 'CMS_Media'
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      fileName = file.name
      mimeType = file.type || ''
      fileStream = file.stream()
      size = file.size
    }

    if (!fileStream && !isRaw) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Permission check: MEMBER chỉ được upload vào MEMBER_ALLOWED_FOLDERS
    if (!isAdminOrOwner) {
      const isAllowedFolder = MEMBER_ALLOWED_FOLDERS.some(
        allowed => folder === allowed || folder.startsWith(allowed + '/')
      )
      if (!isAllowedFolder) {
        return NextResponse.json(
          { error: 'Bạn không có quyền upload vào thư mục này' },
          { status: 403 }
        )
      }
    }

    // File type validation
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType) ||
      ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Loại file không được hỗ trợ: ${mimeType || ext}. Chỉ chấp nhận ảnh và video.` },
        { status: 400 }
      )
    }

    // Generate a unique safe filename
    const safeBaseName = fileName
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\-_.]/g, '_')
      .slice(0, 60)
    const newFileName = `${Date.now()}-${safeBaseName}.${ext}`
    const remotePath = `${folder}/${newFileName}`

    const webdav = new WebdavAdapter()
    // Directly stream the body to WebDAV with size to avoid chunked transfer issues
    await webdav.uploadFile(remotePath, fileStream, size)

    // Proxy URL for serving the file
    const proxyUrl = `/api/media/${remotePath}`

    return NextResponse.json({
      url: proxyUrl,
      remotePath,
      name: newFileName,
      size: size,
      type: isVideo ? 'video' : 'image',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
