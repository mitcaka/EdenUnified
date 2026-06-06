import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() { return new WebdavAdapter() }
function getRemoteBase() { return process.env.REMOTE_BASE || 'pz-logs/eden' }

// GET /api/logs/dates — List available log dates
export async function GET() {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const webdav = getWebdav()
    const hrefs = await webdav.list(`${getRemoteBase()}/hourly`)
    const dates = hrefs
      .map(h => h.split('/').filter(Boolean).pop() || '')
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort((a, b) => b.localeCompare(a))
    return NextResponse.json({ dates })
  } catch (err: any) {
    if (err.status === 404) return NextResponse.json({ dates: [] })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
