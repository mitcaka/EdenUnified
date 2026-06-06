'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { UserSchema, UpdateUserSchema } from '@/lib/validations'

export async function createUser(formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  const parseResult = UserSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    name: formData.get('name'),
    role: formData.get('role'),
    isActive: formData.get('isActive') === 'on',
    discordUserId: formData.get('discordUserId'),
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const { username, password, name, role, isActive, discordUserId } = parseResult.data

  if (role === 'OWNER' && session.role !== 'OWNER') {
    throw new Error('Chỉ OWNER mới có thể tạo tài khoản OWNER')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { username, passwordHash, name, role, isActive, discordUserId: discordUserId || null },
  })

  revalidatePath('/users')
  redirect('/admin/users')
}

export async function updateUser(id: string, formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  const parseResult = UpdateUserSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role'),
    password: formData.get('password'),
    isActive: formData.get('isActive') === 'on',
    discordUserId: formData.get('discordUserId'),
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const { name, role, password, isActive, discordUserId } = parseResult.data

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) throw new Error('Không tìm thấy tài khoản')

  if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
    throw new Error('Chỉ OWNER mới có thể sửa tài khoản OWNER')
  }

  if (role === 'OWNER' && session.role !== 'OWNER') {
    throw new Error('Chỉ OWNER mới có thể cấp quyền OWNER')
  }

  if (targetUser.role === 'OWNER' && (role !== 'OWNER' || !isActive)) {
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER', isActive: true } })
    if (ownerCount <= 1) {
      throw new Error('Không thể gỡ quyền hoặc vô hiệu hóa OWNER cuối cùng của hệ thống')
    }
  }

  const data: any = { name, role, isActive, discordUserId: discordUserId || null }
  if (password && password.length >= 6) {
    data.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data,
  })

  revalidatePath('/users')
  redirect('/admin/users')
}

export async function deleteUser(id: string) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) throw new Error('Không tìm thấy tài khoản')

  if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
    throw new Error('Chỉ OWNER mới có thể xóa tài khoản OWNER')
  }

  if (targetUser.role === 'OWNER') {
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } })
    if (ownerCount <= 1) {
      throw new Error('Không thể xóa OWNER cuối cùng của hệ thống')
    }
  }

  await prisma.user.delete({ where: { id } })
  revalidatePath('/users')
}

export async function updateMyProfile(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  if (session.role === 'VIEWER') throw new Error('Bạn không có quyền cập nhật hồ sơ')

  const discordUserId = formData.get('discordUserId') as string || ''
  
  // Validate basic format
  if (discordUserId && !/^\d{15,25}$/.test(discordUserId)) {
    throw new Error('Discord ID không hợp lệ. Vui lòng chỉ nhập số (15-25 ký tự).')
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { discordUserId: discordUserId || null }
  })

  revalidatePath('/profile')
  revalidatePath('/users')
}
