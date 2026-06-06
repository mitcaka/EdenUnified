import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    console.log(`[Media Proxy] Requested path:`, path.join('/'))
    
    // Backward compatibility: if only 1 segment is provided, assume it's in CMS_Media
    // If 2 segments are provided (e.g., CMS_Banners/filename.jpg), use them directly
    const remotePath = path.length === 1 
      ? `CMS_Media/${path[0]}`
      : path.join('/')

    const webdav = new WebdavAdapter()
    const buffer = await webdav.downloadBuffer(remotePath)
    
    // Determine content type based on extension
    const ext = remotePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'png') contentType = 'image/png'
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'svg') contentType = 'image/svg+xml'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error: any) {
    console.error('Media proxy error:', error)
    return new NextResponse('File not found or error fetching', { status: error.status || 500 })
  }
}
