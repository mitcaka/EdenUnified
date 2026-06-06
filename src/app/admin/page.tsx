import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMyWorkData, getManagementData, getViewerData } from '@/lib/dashboardQueries'
import MyWorkDashboard from '@/components/dashboard/MyWorkDashboard'
import ManagementDashboard from '@/components/dashboard/ManagementDashboard'
import ViewerDashboard from '@/components/dashboard/ViewerDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const currentUser = { id: session.id, role: session.role }

  if (session.role === 'MEMBER') {
    const data = await getMyWorkData(session.id)
    return <MyWorkDashboard data={data} currentUser={currentUser} />
  }

  if (session.role === 'OWNER' || session.role === 'ADMIN') {
    const data = await getManagementData(session.id)
    return <ManagementDashboard data={data} currentUser={currentUser} />
  }

  if (session.role === 'VIEWER') {
    const data = await getViewerData()
    return <ViewerDashboard data={data} currentUser={currentUser} />
  }

  // Fallback
  return <div className="p-8 text-center text-gray-500">Vai trò không hợp lệ.</div>
}
