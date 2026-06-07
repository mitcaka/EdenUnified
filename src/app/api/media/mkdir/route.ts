import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

/**
 * POST /api/media/mkdir
 * Body: { remotePath: "Team_Media/my-new-folder" }
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

    // Phải nằm trong Team_Media/
    if (!remotePath.startsWith('Team_Media/') && remotePath !== 'Team_Media') {
      return NextResponse.json({ error: 'Chỉ được tạo thư mục trong Team_Media/' }, { status: 403 })
    }

    const webdav = new WebdavAdapter()
    await webdav.createDirectoryRecursive(remotePath)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mkdir error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create directory' },
      { status: 500 }
    )
  }
}
