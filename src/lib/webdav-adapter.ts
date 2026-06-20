/**
 * WebDAV Adapter for Nextcloud - TypeScript version
 * Ported from EdenLogBridge/WebdavAdapter.js
 */

export interface WebdavFileItem {
  name: string
  href: string       // full DAV href path
  remotePath: string // path relative to DAV base (e.g. "Team_Media/general/file.mp4")
  isDir: boolean
  size: number       // bytes, 0 for dirs
  lastModified: string // ISO 8601
  contentType: string
}

class WebdavError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'WebdavError'
  }
}

export class WebdavAdapter {
  private ncBase: string
  private ncUser: string
  private ncPass: string
  private davBase: string
  private authHeader: string

  constructor(config?: { NC_BASE?: string; NC_USER?: string; NC_PASS?: string; DAV?: string }) {
    this.ncBase = config?.NC_BASE || process.env.NC_BASE || ''
    this.ncUser = config?.NC_USER || process.env.NC_USER || ''
    this.ncPass = config?.NC_PASS || process.env.NC_PASS || ''
    this.davBase = config?.DAV || process.env.DAV || `${this.ncBase}/remote.php/dav/files/${this.ncUser}`

    if (!this.ncBase || !this.ncUser || !this.ncPass) {
      throw new Error('Thiếu cấu hình WebDAV (NC_BASE, NC_USER, NC_PASS)')
    }

    this.authHeader = `Basic ${Buffer.from(`${this.ncUser}:${this.ncPass}`).toString('base64')}`
  }

  private _encodePath(remotePath: string): string {
    const normalizedPath = remotePath.replace(/\\/g, '/')
    const cleanPath = normalizedPath.replace(/\/+/g, '/').replace(/^\//, '')
    return cleanPath.split('/').map(part => encodeURIComponent(part)).join('/')
  }

  _getFullUrl(remotePath: string): string {
    if (!remotePath) return this.davBase
    return `${this.davBase}/${this._encodePath(remotePath)}`
  }

  getNcBase(): string {
    return this.ncBase
  }

  async _request(method: string, remotePath: string, options: any = {}, retries = 3): Promise<Response> {
    const url = this._getFullUrl(remotePath)
    const fetchOptions: any = {
      method,
      headers: {
        Authorization: this.authHeader,
        ...(options.headers || {}),
      },
      ...(options.timeout !== 0 ? { signal: AbortSignal.timeout(options.timeout || 30000) } : {}),
      ...options.fetchOptions,
    }

    if (options.body) {
      fetchOptions.body = options.body
    }

    let lastError: Error | null = null
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, fetchOptions)
        if (!response.ok && ![200, 201, 204, 206, 207].includes(response.status)) {
          if (method === 'MKCOL' && response.status === 405) {
            return response // Directory already exists
          }
          throw new WebdavError(`WebDAV ${method} failed: ${response.status} ${response.statusText}`, response.status)
        }
        return response
      } catch (err: any) {
        lastError = err
        if (err instanceof WebdavError && [401, 403, 404, 409].includes(err.status)) {
          throw err
        }
        console.warn(`[WebDAV] Retry ${i + 1}/${retries} cho lệnh ${method} ${remotePath}: ${err.message}`)
        await new Promise(res => setTimeout(res, 1500 * (i + 1)))
      }
    }
    throw lastError!
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this._request('PROPFIND', '', { headers: { Depth: '0' } })
      return res.status === 207
    } catch {
      return false
    }
  }

  /**
   * List thư mục — trả về mảng href thô (backward compat)
   */
  async list(remotePath: string): Promise<string[]> {
    const response = await this._request('PROPFIND', remotePath, { headers: { Depth: '1' } })
    const xml = await response.text()
    const hrefRegex = /<[a-z0-9]*:?href[^>]*>([^<]+)<\/[a-z0-9]*:?href>/gi
    const hrefs: string[] = []
    let match
    while ((match = hrefRegex.exec(xml)) !== null) {
      hrefs.push(decodeURIComponent(match[1]))
    }
    return hrefs
  }

  /**
   * List thư mục với metadata đầy đủ (name, size, contentType, isDir, lastModified)
   */
  async listWithDetails(remotePath: string): Promise<WebdavFileItem[]> {
    const response = await this._request('PROPFIND', remotePath, {
      headers: {
        Depth: '1',
        'Content-Type': 'application/xml',
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:displayname/>
    <d:getcontentlength/>
    <d:getcontenttype/>
    <d:getlastmodified/>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`,
    })
    const xml = await response.text()

    // Parse PROPFIND multi-status XML
    const responseBlocks = xml.match(/<[a-z0-9]*:?response[^>]*>[\s\S]*?<\/[a-z0-9]*:?response>/gi) || []

    const davPathPrefix = `/remote.php/dav/files/${encodeURIComponent(this.ncUser)}/`
    const davPathPrefixDecoded = `/remote.php/dav/files/${this.ncUser}/`

    const items: WebdavFileItem[] = []

    for (const block of responseBlocks) {
      const hrefMatch = block.match(/<[a-z0-9]*:?href[^>]*>([^<]+)<\/[a-z0-9]*:?href>/i)
      if (!hrefMatch) continue
      const href = decodeURIComponent(hrefMatch[1].trim())

      // Lấy remotePath (path sau DAV base)
      let remotePart = href
      if (remotePart.startsWith(davPathPrefix)) {
        remotePart = remotePart.slice(davPathPrefix.length)
      } else if (remotePart.startsWith(davPathPrefixDecoded)) {
        remotePart = remotePart.slice(davPathPrefixDecoded.length)
      }
      // Remove trailing slash
      const remotePathClean = remotePart.replace(/\/$/, '')

      const isDir = /<[a-z0-9]*:?collection\s*\/>/.test(block)

      const sizeMatch = block.match(/<[a-z0-9]*:?getcontentlength[^>]*>([^<]+)<\/[a-z0-9]*:?getcontentlength>/i)
      const size = sizeMatch ? parseInt(sizeMatch[1].trim(), 10) : 0

      const ctMatch = block.match(/<[a-z0-9]*:?getcontenttype[^>]*>([^<]+)<\/[a-z0-9]*:?getcontenttype>/i)
      const contentType = ctMatch ? ctMatch[1].trim() : (isDir ? 'httpd/unix-directory' : 'application/octet-stream')

      const lmMatch = block.match(/<[a-z0-9]*:?getlastmodified[^>]*>([^<]+)<\/[a-z0-9]*:?getlastmodified>/i)
      const lastModified = lmMatch ? new Date(lmMatch[1].trim()).toISOString() : new Date().toISOString()

      const nameParts = remotePathClean.split('/')
      const name = nameParts[nameParts.length - 1] || remotePathClean

      items.push({
        name,
        href,
        remotePath: remotePathClean,
        isDir,
        size,
        lastModified,
        contentType,
      })
    }

    return items
  }

  async downloadText(remotePath: string): Promise<string> {
    const response = await this._request('GET', remotePath)
    return await response.text()
  }

  async downloadBuffer(remotePath: string): Promise<Buffer> {
    const response = await this._request('GET', remotePath)
    return Buffer.from(await response.arrayBuffer())
  }

  /**
   * Download stream với Range header hỗ trợ (dùng cho video streaming)
   * Trả về Response gốc để caller có thể pipe
   */
  async downloadStream(remotePath: string, rangeHeader?: string): Promise<Response> {
    const headers: Record<string, string> = {}
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }
    const response = await this._request('GET', remotePath, { headers, timeout: 0 }, 1)
    return response
  }

  async createDirectory(remotePath: string): Promise<void> {
    try {
      await this._request('MKCOL', remotePath)
    } catch (e: any) {
      if (e.status !== 405) throw e // 405 Method Not Allowed means it already exists
    }
  }

  async createDirectoryRecursive(remotePath: string): Promise<void> {
    const parts = remotePath.replace(/\\/g, '/').split('/').filter(p => p.length > 0)
    let current = ''
    for (const part of parts) {
      current += (current ? '/' : '') + part
      await this.createDirectory(current)
    }
  }

  async uploadFile(remotePath: string, body: Buffer | Uint8Array | string | ReadableStream | any, size?: number): Promise<void> {
    // Tự động tạo thư mục cha nếu cần
    const parts = remotePath.split('/')
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join('/')
      await this.createDirectoryRecursive(dirPath)
    }

    const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

    if (size !== undefined && size > CHUNK_SIZE && Buffer.isBuffer(body)) {
      // Chunked upload protocol
      const uid = 'chunk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8)
      const uploadBaseUrl = `${this.ncBase}/remote.php/dav/uploads/${this.ncUser}/${uid}`

      // 1. Create chunking directory
      const mkcolRes = await fetch(uploadBaseUrl, {
        method: 'MKCOL',
        headers: { Authorization: this.authHeader }
      })
      if (!mkcolRes.ok && ![200, 201, 204, 405].includes(mkcolRes.status)) {
        throw new Error(`Failed to create chunk directory: ${mkcolRes.status}`)
      }

      // 2. Upload chunks sequentially
      const numChunks = Math.ceil(size / CHUNK_SIZE)
      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, size)
        const chunkBuf = body.slice(start, end)
        
        // Pad the chunk index to 16 characters (e.g. "0000000000000000", "0000000000000001")
        const chunkName = i.toString().padStart(16, '0')
        
        // Retry logic for each chunk
        let lastErr
        for (let retry = 0; retry < 3; retry++) {
          try {
            const res = await fetch(`${uploadBaseUrl}/${chunkName}`, {
              method: 'PUT',
              headers: { Authorization: this.authHeader, 'Content-Length': chunkBuf.length.toString() },
              body: chunkBuf
            })
            if (!res.ok && ![200, 201, 204].includes(res.status)) throw new Error(`Chunk ${i} failed: ${res.status}`)
            lastErr = null
            break // Success
          } catch(e) {
            lastErr = e
            await new Promise(r => setTimeout(r, 1000 * (retry + 1)))
          }
        }
        if (lastErr) throw lastErr
      }

      // 3. Assemble file (MOVE)
      const destUrl = this._getFullUrl(remotePath)
      const moveRes = await fetch(`${uploadBaseUrl}/.file`, {
        method: 'MOVE',
        headers: { Authorization: this.authHeader, Destination: destUrl }
      })
      if (!moveRes.ok && ![200, 201, 204].includes(moveRes.status)) {
        throw new Error(`Failed to assemble chunks: ${moveRes.status}`)
      }
      return
    }

    const options: any = {
      body: body,
      headers: { 'Content-Type': 'application/octet-stream' },
      timeout: 0, // No timeout for large uploads
    }

    if (size !== undefined && size > 0) {
      options.headers['Content-Length'] = size.toString()
    }

    // Node.js fetch requires duplex: 'half' when the body is a stream (Web or Node Stream)
    if (body && (typeof (body as any).getReader === 'function' || typeof (body as any).read === 'function')) {
      options.fetchOptions = { duplex: 'half' }
    }

    await this._request('PUT', remotePath, options)
  }

  async delete(remotePath: string): Promise<void> {
    try {
      await this._request('DELETE', remotePath)
    } catch (err: any) {
      if (err.status !== 404) throw err
    }
  }

  async move(remoteFrom: string, remoteTo: string, overwrite = true): Promise<void> {
    const destUrl = this._getFullUrl(remoteTo)
    await this._request('MOVE', remoteFrom, {
      headers: {
        Destination: destUrl,
        Overwrite: overwrite ? 'T' : 'F',
      },
    })
  }

  /**
   * Tạo public share link qua Nextcloud OCS Share API
   * Trả về: { shareUrl, directDownloadUrl, token }
   */
  async createPublicShare(remotePath: string): Promise<{
    shareUrl: string
    directDownloadUrl: string
    token: string
  }> {
    // Nextcloud OCS Share API v2 — single call with format=json
    const ocsUrl = `${this.ncBase}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json`

    // Path phải bắt đầu bằng / và là path tương đối với Nextcloud user root
    const fullPath = `/${remotePath.replace(/^\//, '')}`

    const body = new URLSearchParams({
      path: fullPath,
      shareType: '3', // 3 = public link
      permissions: '1', // 1 = read only
    })

    const response = await fetch(ocsUrl, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    })

    const text = await response.text()

    if (!response.ok) {
      throw new Error(`OCS Share API failed: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`)
    }

    let token = ''
    let url = ''

    try {
      const json = JSON.parse(text)
      // Check OCS status
      const ocsStatus = json?.ocs?.meta?.statuscode
      if (ocsStatus && ocsStatus !== 100 && ocsStatus !== 200) {
        throw new Error(`OCS API error ${ocsStatus}: ${json?.ocs?.meta?.message || 'Unknown error'}`)
      }
      token = json?.ocs?.data?.token || ''
      url = json?.ocs?.data?.url || ''
    } catch (parseErr: any) {
      if (parseErr.message.startsWith('OCS API error')) throw parseErr
      // Fallback: parse XML
      const tokenMatch = text.match(/<token>([^<]+)<\/token>/)
      const urlMatch = text.match(/<url>([^<]+)<\/url>/)
      token = tokenMatch?.[1] || ''
      url = urlMatch?.[1] || ''
    }

    if (!token && !url) {
      throw new Error('Failed to get share token from Nextcloud OCS API. Response: ' + text.slice(0, 200))
    }

    const shareUrl = url || `${this.ncBase}/s/${token}`
    const directDownloadUrl = `${shareUrl}/download`

    return { shareUrl, directDownloadUrl, token }
  }
}
