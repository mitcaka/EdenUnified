import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { Toaster } from 'react-hot-toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardShell role={session.role} name={session.name}>
      {children}
      <Toaster position="bottom-right" />
    </DashboardShell>
  )
}
