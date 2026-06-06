import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() { return new WebdavAdapter() }
function getRemoteBase() { return process.env.REMOTE_BASE || 'pz-logs/eden' }

// GET /api/logs/latest/[type] — Get latest server-console or latest errors
export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await params
  const fileName = type === 'errors' ? 'latest_errors.log' : 'latest.log'

  try {
    const webdav = getWebdav()
    const content = await webdav.downloadText(`${getRemoteBase()}/${fileName}`)
    return NextResponse.json({ content, file: fileName, lines: content.split('\n').length })
  } catch (err: any) {
    if (err.status === 404) return NextResponse.json({ content: '', file: fileName, lines: 0 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
