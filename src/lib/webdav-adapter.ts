/**
 * WebDAV Adapter for Nextcloud - TypeScript version
 * Ported from EdenLogBridge/WebdavAdapter.js
 */

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

  private _getFullUrl(remotePath: string): string {
    if (!remotePath) return this.davBase
    return `${this.davBase}/${this._encodePath(remotePath)}`
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
        if (!response.ok && ![200, 201, 204, 207].includes(response.status)) {
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

  async downloadText(remotePath: string): Promise<string> {
    const response = await this._request('GET', remotePath)
    return await response.text()
  }

  async createDirectory(remotePath: string): Promise<void> {
    try {
      await this._request('MKCOL', remotePath)
    } catch (e: any) {
      if (e.status !== 405) throw e // 405 Method Not Allowed means it already exists
    }
  }

  async uploadFile(remotePath: string, buffer: Buffer | Uint8Array | string): Promise<void> {
    // Tự động thử tạo thư mục cha nếu có
    const parts = remotePath.split('/')
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join('/')
      await this.createDirectory(dirPath)
    }

    await this._request('PUT', remotePath, {
      body: buffer,
      headers: { 'Content-Type': 'application/octet-stream' }
    })
  }

  async downloadBuffer(remotePath: string): Promise<Buffer> {
    const response = await this._request('GET', remotePath)
    return Buffer.from(await response.arrayBuffer())
  }
}
