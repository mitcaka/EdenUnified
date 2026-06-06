import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() { return new WebdavAdapter() }
function getRemoteBase() { return process.env.REMOTE_BASE || 'pz-logs/eden' }

// GET /api/logs/hourly?date=YYYY-MM-DD — List hourly log files for a date
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date param' }, { status: 400 })

  try {
    const webdav = getWebdav()
    const hrefs = await webdav.list(`${getRemoteBase()}/hourly/${date}`)
    const files = hrefs
      .map(h => h.split('/').filter(Boolean).pop() || '')
      .filter(f => f.endsWith('.log'))
      .sort()
    return NextResponse.json({ date, files })
  } catch (err: any) {
    if (err.status === 404) return NextResponse.json({ date, files: [] })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
