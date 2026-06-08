import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function getSecretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.warn('[AUTH WARNING] JWT_SECRET chưa được cấu hình trong .env, đang dùng key mặc định! Đây là lỗi bảo mật nghiêm trọng nếu chạy production.')
    return new TextEncoder().encode('eden-unified-secret-key-change-in-production')
  }
  return new TextEncoder().encode(secret)
}

export type SessionPayload = {
  id: string
  username: string
  role: string
  name: string
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, getSecretKey(), {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    console.error('JWT Decrypt Error:', error)
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  
  const payload = await decrypt(session)
  if (!payload) return null

  // Kiểm tra realtime xem user còn active không
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { isActive: true }
  })

  if (!user || !user.isActive) {
    return null
  }

  return payload
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt(payload)
  
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    // Chỉ bật secure khi website chạy HTTPS thực sự (set COOKIE_SECURE=true trong .env)
    // KHÔNG dùng NODE_ENV vì server có thể chạy production mode nhưng vẫn qua HTTP
    secure: process.env.COOKIE_SECURE === 'true',
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
