import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { updateMyProfile } from '@/app/actions/user'
import SubmitButton from '@/components/ui/SubmitButton'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Hồ sơ cá nhân</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form action={updateMyProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tài khoản</label>
              <input type="text" disabled defaultValue={user.username} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ tên</label>
              <input type="text" disabled defaultValue={user.name} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vai trò</label>
              <input type="text" disabled defaultValue={user.role} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kết nối Discord</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cấu hình Discord ID để nhận thông báo (được tag trực tiếp) khi có công việc mới được giao hoặc yêu cầu review.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Discord User ID</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input 
                  name="discordUserId" 
                  type="text" 
                  disabled={session.role === 'VIEWER'}
                  defaultValue={user.discordUserId || ''} 
                  placeholder="Ví dụ: 123456789012345678" 
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" 
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Để lấy ID: Bật Developer Mode trong Discord &rarr; Chuột phải vào tên bạn &rarr; Chọn Copy User ID.
              </p>
            </div>
          </div>

          {session.role !== 'VIEWER' && (
            <div className="pt-2">
              <SubmitButton text="Lưu cấu hình" />
            </div>
          )}
          {session.role === 'VIEWER' && (
            <p className="text-sm text-red-500">Bạn không có quyền cập nhật cấu hình này.</p>
          )}
        </form>
      </div>
    </div>
  )
}
