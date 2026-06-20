import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'

const CONTENT_TYPE_MAP: Record<string, string> = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  // Audio
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  // Docs
  pdf: 'application/pdf',
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const joined = path.join('/')
    console.log(`[Media Proxy] Requested path:`, joined)

    // Backward compatibility: if only 1 segment, assume CMS_Media
    const remotePath = path.length === 1 ? `CMS_Media/${path[0]}` : joined

    const ext = remotePath.split('.').pop()?.toLowerCase() || ''
    const contentType = CONTENT_TYPE_MAP[ext] || 'application/octet-stream'

    const isVideo = contentType.startsWith('video/')

    const webdav = new WebdavAdapter()

    if (isVideo) {
      // Video streaming với Range header support — pipe trực tiếp, không buffer vào RAM
      const rangeHeader = request.headers.get('range') || undefined
      const upstreamResponse = await webdav.downloadStream(remotePath, rangeHeader)

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Content-Encoding': 'identity', // Ngăn Next.js nén video
      }

      // Chuyển tiếp headers quan trọng từ Nextcloud
      const contentLength = upstreamResponse.headers.get('content-length')
      const contentRange = upstreamResponse.headers.get('content-range')
      if (contentLength) headers['Content-Length'] = contentLength
      if (contentRange) headers['Content-Range'] = contentRange

      // Pipe stream trực tiếp — không buffer vào RAM
      // Trả đúng status: 206 nếu có Range request, 200 nếu không
      const status = rangeHeader && upstreamResponse.status === 206 ? 206 : upstreamResponse.status

      return new NextResponse(upstreamResponse.body, {
        status,
        headers,
      })
    }

    // Với file không phải video (ảnh, v.v.) — buffer bình thường vì nhỏ
    const buffer = await webdav.downloadBuffer(remotePath)
    return new NextResponse(new Uint8Array(buffer), {
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

