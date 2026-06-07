import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

/**
 * POST /api/media/share
 * Body: { remotePath: "Team_Media/general/file.mp4" }
 * 
 * Tạo public share link qua Nextcloud OCS Share API
 * Trả về link dạng https://driver.webtui.vn/s/XXXXX để nhúng Discord
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { remotePath } = body

    if (!remotePath || typeof remotePath !== 'string') {
      return NextResponse.json({ error: 'remotePath is required' }, { status: 400 })
    }

    const webdav = new WebdavAdapter()
    const result = await webdav.createPublicShare(remotePath)

    // Tạo link proxy trực tiếp có đuôi file thật để Discord có thể nhúng inline (hiển thị ảnh/video trực tiếp)
    const appBaseUrl = process.env.APP_BASE_URL || ''
    // Nếu appBaseUrl có thì dùng, nếu không thì dùng origin tĩnh (trong Next.js API route khó lấy origin động tự động)
    // Tốt nhất là dùng relative path để frontend tự prepend origin nếu cần, nhưng ta cứ dùng process.env
    const fileName = remotePath.split('/').pop() || 'file'
    const directProxyUrl = `${appBaseUrl}/api/public/${result.token}/${encodeURIComponent(fileName)}`

    return NextResponse.json({
      ...result,
      directDownloadUrl: directProxyUrl
    })
  } catch (error: any) {
    console.error('Share API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create share link' },
      { status: 500 }
    )
  }
}
