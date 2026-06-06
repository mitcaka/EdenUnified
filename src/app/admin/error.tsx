'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-red-50 p-4 mb-4 text-red-500 ring-8 ring-red-50/50">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra!</h2>
      <div className="text-gray-600 max-w-md mx-auto mb-8 bg-white p-4 rounded-xl border border-red-100 shadow-sm font-medium text-sm text-red-600">
        {error.message || 'Hệ thống gặp sự cố, vui lòng thử lại sau.'}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang trước
        </button>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại thao tác
        </button>
      </div>
    </div>
  )
}
