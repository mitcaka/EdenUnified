import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'CMS_Media'

    const webdav = new WebdavAdapter()

    try {
      const allItems = await webdav.listWithDetails(folder)

      // Lọc bỏ chính thư mục root (item đầu tiên thường là folder được PROPFIND)
      const children = allItems.filter(item => item.remotePath !== folder && item.remotePath !== folder + '/')

      const files = children
        .filter(item => !item.isDir)
        .map(item => {
          const proxyUrl = `/api/media/${item.remotePath}`
          return {
            name: item.name,
            url: proxyUrl,
            remotePath: item.remotePath,
            size: item.size,
            lastModified: item.lastModified,
            contentType: item.contentType,
          }
        })

      const folders = children
        .filter(item => item.isDir)
        .map(item => ({
          name: item.name,
          remotePath: item.remotePath,
          lastModified: item.lastModified,
        }))

      return NextResponse.json({ files, folders })
    } catch (e: any) {
      if (e.status === 404) {
        return NextResponse.json({ files: [], folders: [] })
      }
      throw e
    }
  } catch (error) {
    console.error('List media error:', error)
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 })
  }
}
