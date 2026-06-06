import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { WebdavAdapter } from '@/lib/webdav-adapter'

function getWebdav() { return new WebdavAdapter() }
function getRemoteBase() { return process.env.REMOTE_BASE || 'pz-logs/eden' }

// GET /api/logs/search?q=keyword&date=YYYY-MM-DD — Search logs
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')
  const date = request.nextUrl.searchParams.get('date')
  const fileFilter = request.nextUrl.searchParams.get('file')
  if (!q) return NextResponse.json({ error: 'Missing search query' }, { status: 400 })

  try {
    const webdav = getWebdav()
    const results: Array<{ file: string; line: number; text: string }> = []

    // Search latest log
    if (!date && !fileFilter) {
      try {
        const latest = await webdav.downloadText(`${getRemoteBase()}/latest.log`)
        const lines = latest.split('\n')
        lines.forEach((text, i) => {
          if (text.toLowerCase().includes(q.toLowerCase())) {
            results.push({ file: 'latest.log', line: i + 1, text: text.trim() })
          }
        })
      } catch { /* skip if not found */ }
    }

    // Search hourly logs for specific date if provided
    if (date) {
      try {
        const hrefs = await webdav.list(`${getRemoteBase()}/hourly/${date}`)
        let files = hrefs.map(h => h.split('/').filter(Boolean).pop() || '').filter(f => f.endsWith('.log'))
        
        if (fileFilter) {
          files = files.filter(f => f.toLowerCase().includes(fileFilter.toLowerCase()))
        }

        for (const file of files.slice(0, 24)) {
          try {
            const content = await webdav.downloadText(`${getRemoteBase()}/hourly/${date}/${file}`)
            content.split('\n').forEach((text, i) => {
              if (text.toLowerCase().includes(q.toLowerCase())) {
                results.push({ file: `${date}/${file}`, line: i + 1, text: text.trim() })
              }
            })
          } catch { /* skip */ }
        }
      } catch { /* skip if date folder not found */ }
    }

    return NextResponse.json({ query: q, date, totalResults: results.length, results: results.slice(0, 500) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
