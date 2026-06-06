'use client'

import { ReactNode } from 'react'
import { updateSiteSetting } from '@/app/actions/cms'
import toast from 'react-hot-toast'

export default function SettingsForm({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  const handleSubmit = async (formData: FormData) => {
    const promise = updateSiteSetting(formData)
    toast.promise(promise, {
      loading: 'Đang lưu...',
      success: 'Đã lưu thiết lập!',
      error: 'Lỗi khi lưu!'
    })
  }

  return (
    <form action={handleSubmit} className={className}>
      {children}
    </form>
  )
}
