import { updateProject } from '@/app/actions/project'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SubmitButton from '@/components/ui/SubmitButton'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    redirect('/projects')
  }

  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id } })

  if (!project) {
    notFound()
  }

  const updateProjectWithId = updateProject.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sửa Dự án</h1>
        <Link href="/admin/projects" className="text-sm text-gray-500 hover:text-gray-900">Quay lại</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form action={updateProjectWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên Dự án</label>
            <input name="name" type="text" required defaultValue={project.name} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea name="description" rows={4} defaultValue={project.description || ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          <div className="pt-4">
            <SubmitButton text="Lưu thay đổi" />
          </div>
        </form>
      </div>
    </div>
  )
}
