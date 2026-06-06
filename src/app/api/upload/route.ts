import { NextResponse } from 'next/server'
import { WebdavAdapter } from '@/lib/webdav-adapter'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'CMS_Media'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate a unique safe filename
    const ext = file.name.split('.').pop()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(`.${ext}`, '')
    const fileName = `${Date.now()}-${safeName}.${ext}`
    const remotePath = `${folder}/${fileName}`

    const webdav = new WebdavAdapter()
    await webdav.uploadFile(remotePath, buffer)
    
    // Trả về proxy url để hiển thị ảnh
    // Bỏ folder nếu là CMS_Media để backward compatible
    const proxyUrl = folder === 'CMS_Media' ? `/api/media/${fileName}` : `/api/media/${folder}/${fileName}`
    return NextResponse.json({ url: proxyUrl })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
