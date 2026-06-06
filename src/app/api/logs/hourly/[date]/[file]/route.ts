import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() { return new WebdavAdapter() }
function getRemoteBase() { return process.env.REMOTE_BASE || 'pz-logs/eden' }

// GET /api/logs/hourly/[date]/[file] — Download an hourly log file content
export async function GET(_request: NextRequest, { params }: { params: Promise<{ date: string; file: string }> }) {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, file } = await params

  try {
    const webdav = getWebdav()
    const content = await webdav.downloadText(`${getRemoteBase()}/hourly/${date}/${file}`)
    return NextResponse.json({ content, date, file, lines: content.split('\n').length })
  } catch (err: any) {
    if (err.status === 404) return NextResponse.json({ content: '', date, file, lines: 0 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
