import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'CMS_Media'

    const webdav = new WebdavAdapter()
    
    // Đảm bảo thư mục tồn tại, nếu không có thì list sẽ lỗi 404, ta catch trả về mảng rỗng
    try {
      const items = await webdav.list(folder)
      
      // items trả về từ webdav.list bao gồm cả đường dẫn của chính folder đó (thường ở index 0)
      // Ta cần lọc ra những item là file (không kết thúc bằng '/') và map thành URL proxy
      const files = items
        .filter(item => !item.endsWith('/'))
        .map(item => {
          // Lấy tên file từ path (vd: /remote.php/dav/files/user/CMS_Media/image.jpg -> image.jpg)
          const parts = item.split('/')
          const name = parts[parts.length - 1]
          const proxyUrl = folder === 'CMS_Media' ? `/api/media/${name}` : `/api/media/${folder}/${name}`
          return {
            name,
            url: proxyUrl
          }
        })

      return NextResponse.json({ files })
    } catch (e: any) {
      if (e.status === 404) {
        return NextResponse.json({ files: [] }) // Thư mục chưa có file nào
      }
      throw e
    }

  } catch (error) {
    console.error('List media error:', error)
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 })
  }
}
