import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'

export async function GET(
  request: Request,
  { params }: { params: { token: string; filename: string } }
) {
  try {
    const { token, filename } = params
    
    // Khởi tạo WebdavAdapter chỉ để lấy được config NC_BASE
    const webdav = new WebdavAdapter()
    const ncBase = webdav.getNcBase()
    
    // Lấy luồng dữ liệu public từ Nextcloud Share
    const downloadUrl = `${ncBase}/s/${token}/download`
    const upstreamResponse = await fetch(downloadUrl, { method: 'GET' })
    
    if (!upstreamResponse.ok) {
      return new NextResponse('Not Found', { status: upstreamResponse.status })
    }
    
    // Chuyển tiếp các header nhưng ép Content-Disposition thành inline
    // Việc này giúp Discord và Trình duyệt hiển thị ảnh/video trực tiếp thay vì bắt tải về
    const headers = new Headers(upstreamResponse.headers)
    headers.set('Content-Disposition', `inline; filename="${filename}"`)
    
    // Ngăn chặn Next.js tự động nén (gzip) đối với ảnh/video gây lỗi file
    headers.set('Content-Encoding', 'identity')
    headers.set('Cache-Control', 'public, max-age=86400')
    
    // Tải nội dung stream vào memory buffer trước khi gửi
    const arrayBuffer = await upstreamResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    return new NextResponse(new Uint8Array(buffer), {
      status: upstreamResponse.status,
      headers
    })
  } catch (error) {
    console.error('Public proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
