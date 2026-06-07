import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

/**
 * DELETE /api/media/delete
 * Body: { remotePath: "Team_Media/general/file.mp4" }
 */
export async function DELETE(request: Request) {
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

    // Bảo vệ: không cho xóa các folder CMS quan trọng
    const PROTECTED_ROOTS = ['CMS_Media', 'CMS_Banners', 'CMS_Galleries']
    const isProtectedRoot = PROTECTED_ROOTS.some(r => remotePath === r)
    if (isProtectedRoot) {
      return NextResponse.json({ error: 'Không thể xóa thư mục CMS gốc' }, { status: 403 })
    }

    const webdav = new WebdavAdapter()
    await webdav.delete(remotePath)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete media error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete' },
      { status: 500 }
    )
  }
}
