import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Nhân sự' }

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { deleteUser } from '@/app/actions/user'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    redirect('/admin')
  }

  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Nhân sự</h1>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Thêm nhân sự
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">{user.role}</span>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">Discord:</span>
              {user.discordUserId ? (
                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Đã thiết lập</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded text-xs">Chưa có</span>
              )}
            </div>

            <div className="flex gap-2 border-t pt-3">
              <Link href={`/admin/users/${user.id}/edit`} className="flex-1 text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-colors">Sửa</Link>
              <form action={async () => {
                'use server'
                await deleteUser(user.id)
              }} className="flex-1">
                <button type="submit" className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors">Xóa</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tài khoản</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Discord</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{user.role}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {user.discordUserId ? (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Đã thiết lập</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded text-xs">Chưa có</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">Sửa</Link>
                  <form action={async () => {
                    'use server'
                    await deleteUser(user.id)
                  }} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
