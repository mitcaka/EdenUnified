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
      // Video streaming with Range header support
      const rangeHeader = request.headers.get('range') || undefined
      const upstreamResponse = await webdav.downloadStream(remotePath, rangeHeader)

      // Pipe response headers relevant to range/content
      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Content-Encoding': 'identity', // Prevent Next.js from compressing video
      }

      const contentLength = upstreamResponse.headers.get('content-length')
      const contentRange = upstreamResponse.headers.get('content-range')
      if (contentLength) headers['Content-Length'] = contentLength
      if (contentRange) headers['Content-Range'] = contentRange

      // Tải nội dung stream/chunk vào memory buffer trước khi gửi để tránh lỗi đứt luồng của Next.js
      const arrayBuffer = await upstreamResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Stream body trực tiếp bằng NextResponse với Buffer
      return new NextResponse(new Uint8Array(buffer), {
        status: upstreamResponse.status,
        headers,
      })
    }

    // For non-video files, buffer (images etc.)
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
