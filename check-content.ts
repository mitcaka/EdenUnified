import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const post = await prisma.newsPost.findFirst({ orderBy: { createdAt: 'desc' } })
  if (post) {
    console.log('=== CONTENT (first 800 chars) ===')
    console.log(post.content?.substring(0, 800))
    console.log('\n=== Has <br> tags? ===', post.content?.includes('<br>'))
    console.log('=== Has <br/> tags? ===', post.content?.includes('<br/>'))
  }
  await prisma.$disconnect()
}

main().catch(console.error)
