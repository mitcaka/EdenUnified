'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ProjectSchema } from '@/lib/validations'

function checkPermission(role: string) {
  if (role !== 'OWNER' && role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function createProject(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  checkPermission(session.role)

  const parseResult = ProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const { name, description } = parseResult.data

  await prisma.project.create({
    data: { name, description },
  })

  revalidatePath('/projects')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  checkPermission(session.role)

  const parseResult = ProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parseResult.success) {
    throw new Error(parseResult.error.issues[0].message)
  }

  const { name, description } = parseResult.data

  await prisma.project.update({
    where: { id },
    data: { name, description },
  })

  revalidatePath('/projects')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  checkPermission(session.role)

  await prisma.project.delete({ where: { id } })
  revalidatePath('/projects')
}
