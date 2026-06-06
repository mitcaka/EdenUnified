import { updateUser } from '@/app/actions/user'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SubmitButton from '@/components/ui/SubmitButton'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    notFound()
  }

  // Bind the id to the action
  const updateUserWithId = updateUser.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sửa Nhân sự: {user.username}</h1>
        <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-900">Quay lại</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form action={updateUserWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tài khoản (Không đổi)</label>
            <input type="text" disabled defaultValue={user.username} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ tên</label>
            <input name="name" type="text" required defaultValue={user.name} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
            <select name="role" required defaultValue={user.role} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="MEMBER">MEMBER</option>
              <option value="VIEWER">VIEWER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OWNER">OWNER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discord User ID</label>
            <input name="discordUserId" type="text" defaultValue={user.discordUserId || ''} placeholder="Ví dụ: 123456789012345678" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <p className="mt-1 text-xs text-gray-500">Dùng để tag Discord khi được giao việc. Chỉ nhập ID số, không nhập @name.</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" id="isActive" defaultChecked={user.isActive} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Kích hoạt tài khoản</label>
          </div>
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Đổi mật khẩu (Bỏ trống nếu không đổi)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input name="password" type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="pt-4">
            <SubmitButton text="Lưu thay đổi" />
          </div>
        </form>
      </div>
    </div>
  )
}
