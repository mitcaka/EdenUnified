'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getSession()
  if (!session || !['OWNER', 'ADMIN'].includes(session.role)) {
    redirect('/login')
  }
  return session
}

// ===== SiteSettings =====
export async function updateSiteSetting(formData: FormData) {
  await requireAdmin()
  const key = formData.get('key') as string
  const value = formData.get('value') as string
  await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value, type: 'string' } })
  revalidatePath('/admin/content/settings')
  revalidatePath('/')
}

function generateSlug(text: string) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ===== News =====
export async function createNews(formData: FormData) {
  const session = await requireAdmin()
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)
  
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const coverImageUrl = (formData.get('coverImageUrl') as string) || null
  const status = formData.get('status') as string || 'draft'
  
  await prisma.newsPost.create({
    data: { title, slug, excerpt, content, coverImageUrl, status, publishedAt: status === 'published' ? new Date() : null, authorId: session.id }
  })
  revalidatePath('/admin/content/news')
  revalidatePath('/news')
  redirect('/admin/content/news')
}

export async function updateNews(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)
  
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const coverImageUrl = (formData.get('coverImageUrl') as string) || null
  const status = formData.get('status') as string || 'draft'
  
  const existing = await prisma.newsPost.findUnique({ where: { id } })
  await prisma.newsPost.update({
    where: { id },
    data: { title, slug, excerpt, content, coverImageUrl, status, publishedAt: status === 'published' && !existing?.publishedAt ? new Date() : existing?.publishedAt }
  })
  revalidatePath('/admin/content/news')
  revalidatePath('/news')
  redirect('/admin/content/news')
}

export async function deleteNews(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  await prisma.newsPost.delete({ where: { id } })
  revalidatePath('/admin/content/news')
  revalidatePath('/news')
}

// ===== Pages =====
export async function updatePage(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)
  
  const content = formData.get('content') as string
  const seoTitle = (formData.get('seoTitle') as string) || null
  const seoDescription = (formData.get('seoDescription') as string) || null
  const status = formData.get('status') as string || 'draft'
  
  await prisma.page.update({
    where: { id },
    data: { title, slug, content, seoTitle, seoDescription, status, publishedAt: status === 'published' ? new Date() : null }
  })
  revalidatePath('/admin/content/pages')
  revalidatePath('/how-to-join')
  revalidatePath('/rp-guide')
  redirect('/admin/content/pages')
}

// ===== Rule Categories =====
export async function createRuleCategory(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(name)
  await prisma.ruleCategory.create({
    data: {
      name,
      slug,
      description: (formData.get('description') as string) || null,
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    }
  })
  revalidatePath('/admin/content/rules')
  redirect('/admin/content/rules')
}

export async function deleteRuleCategory(formData: FormData) {
  await requireAdmin()
  const id = parseInt(formData.get('id') as string)
  const count = await prisma.rule.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new Error('Không thể xoá danh mục đang chứa luật. Vui lòng xoá hoặc chuyển các luật sang danh mục khác trước.')
  }
  await prisma.ruleCategory.delete({ where: { id } })
  revalidatePath('/admin/content/rules')
}

// ===== Rules =====
export async function createRule(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)

  await prisma.rule.create({
    data: {
      title,
      slug,
      content: formData.get('content') as string,
      severity: formData.get('severity') as string || 'info',
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
      categoryId: parseInt(formData.get('categoryId') as string),
    }
  })
  revalidatePath('/admin/content/rules')
  revalidatePath('/rules')
  redirect('/admin/content/rules')
}

export async function updateRule(formData: FormData) {
  await requireAdmin()
  const id = parseInt(formData.get('id') as string)
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)

  await prisma.rule.update({
    where: { id },
    data: {
      title,
      slug,
      content: formData.get('content') as string,
      severity: formData.get('severity') as string || 'info',
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
      categoryId: parseInt(formData.get('categoryId') as string),
    }
  })
  revalidatePath('/admin/content/rules')
  revalidatePath('/rules')
  redirect('/admin/content/rules')
}

export async function deleteRule(formData: FormData) {
  await requireAdmin()
  await prisma.rule.delete({ where: { id: parseInt(formData.get('id') as string) } })
  revalidatePath('/admin/content/rules')
  revalidatePath('/rules')
}

// ===== Guide Categories =====
export async function createGuideCategory(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(name)
  await prisma.guideCategory.create({
    data: {
      name,
      slug,
      description: (formData.get('description') as string) || null,
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    }
  })
  revalidatePath('/admin/content/guides')
  redirect('/admin/content/guides/categories')
}

export async function deleteGuideCategory(formData: FormData) {
  await requireAdmin()
  const id = parseInt(formData.get('id') as string)
  const count = await prisma.guide.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new Error('Không thể xoá danh mục đang chứa bài hướng dẫn.')
  }
  await prisma.guideCategory.delete({ where: { id } })
  revalidatePath('/admin/content/guides')
}

// ===== Guides =====
export async function createGuide(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)

  await prisma.guide.create({
    data: {
      title,
      slug,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      difficulty: formData.get('difficulty') as string || 'beginner',
      coverImageUrl: (formData.get('coverImageUrl') as string) || null,
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
      categoryId: parseInt(formData.get('categoryId') as string),
    }
  })
  revalidatePath('/admin/content/guides')
  revalidatePath('/guides')
  redirect('/admin/content/guides')
}

export async function updateGuide(formData: FormData) {
  await requireAdmin()
  const id = parseInt(formData.get('id') as string)
  const title = formData.get('title') as string
  let slug = formData.get('slug') as string
  if (!slug) slug = generateSlug(title)

  await prisma.guide.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      difficulty: formData.get('difficulty') as string || 'beginner',
      coverImageUrl: (formData.get('coverImageUrl') as string) || null,
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
      categoryId: parseInt(formData.get('categoryId') as string),
    }
  })
  revalidatePath('/admin/content/guides')
  revalidatePath('/guides')
  redirect('/admin/content/guides')
}

export async function deleteGuide(formData: FormData) {
  await requireAdmin()
  await prisma.guide.delete({ where: { id: parseInt(formData.get('id') as string) } })
  revalidatePath('/admin/content/guides')
  revalidatePath('/guides')
}

// ===== Media =====
export async function createMedia(formData: FormData) {
  await requireAdmin()
  await prisma.mediaItem.create({
    data: {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      type: formData.get('type') as string || 'image',
      mediaUrl: formData.get('mediaUrl') as string,
      thumbnailUrl: (formData.get('thumbnailUrl') as string) || null,
      tags: formData.get('tags') as string || null,
      isFeatured: formData.get('isFeatured') === 'on',
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    }
  })
  revalidatePath('/admin/content/gallery')
  revalidatePath('/gallery')
  redirect('/admin/content/gallery')
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin()
  await prisma.mediaItem.delete({ where: { id: parseInt(formData.get('id') as string) } })
  revalidatePath('/admin/content/gallery')
  revalidatePath('/gallery')
}

// ===== FAQ =====
export async function createFaq(formData: FormData) {
  await requireAdmin()
  await prisma.faq.create({
    data: {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      category: formData.get('category') as string || 'General',
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    }
  })
  revalidatePath('/admin/content/faq')
  revalidatePath('/faq')
  redirect('/admin/content/faq')
}

export async function updateFaq(formData: FormData) {
  await requireAdmin()
  const id = parseInt(formData.get('id') as string)
  await prisma.faq.update({
    where: { id },
    data: {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      category: formData.get('category') as string || 'General',
      sortOrder: parseInt(formData.get('sortOrder') as string || '0'),
    }
  })
  revalidatePath('/admin/content/faq')
  revalidatePath('/faq')
  redirect('/admin/content/faq')
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin()
  await prisma.faq.delete({ where: { id: parseInt(formData.get('id') as string) } })
  revalidatePath('/admin/content/faq')
  revalidatePath('/faq')
}
