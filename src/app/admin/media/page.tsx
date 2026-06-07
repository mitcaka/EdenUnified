import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MediaHubClient from './MediaHubClient'

export default async function MediaHubPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    redirect('/admin')
  }

  return <MediaHubClient />
}
