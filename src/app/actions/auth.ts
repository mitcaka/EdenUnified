'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginSchema } from '@/lib/validations'

export async function login(formData: FormData) {
  const parseResult = LoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message }
  }

  const { username, password } = parseResult.data

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || !user.isActive) {
    return { error: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatch) {
    return { error: 'Invalid credentials' }
  }

  await createSession({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  })

  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
