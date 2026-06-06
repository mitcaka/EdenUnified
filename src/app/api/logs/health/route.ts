import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() {
  return new WebdavAdapter()
}

function getRemoteBase() {
  return process.env.REMOTE_BASE || 'pz-logs/eden'
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role)) {
    return null
  }
  return session
}

// GET /api/logs/health
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const webdav = getWebdav()
    const connected = await webdav.testConnection()
    return NextResponse.json({
      status: connected ? 'ok' : 'disconnected',
      storage: connected ? 'connected' : 'unreachable',
      remote_base: getRemoteBase(),
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
  }
}
