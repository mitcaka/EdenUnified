import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Dự án' }

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { deleteProject } from '@/app/actions/project'
import { getSession } from '@/lib/auth'

export default async function ProjectsPage() {
  const session = await getSession()
  const canEdit = session?.role === 'OWNER' || session?.role === 'ADMIN'

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Dự án</h1>
        {canEdit && (
          <Link
            href="/admin/projects/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Thêm Dự án
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tên Dự án</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mô tả</th>
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Hành động</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{project.description}</td>
                {canEdit && (
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/admin/projects/${project.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">Sửa</Link>
                    <form action={async () => {
                      'use server'
                      await deleteProject(project.id)
                    }} className="inline">
                      <button type="submit" className="text-red-600 hover:text-red-900">Xóa</button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dự án nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
