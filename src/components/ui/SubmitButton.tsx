'use client'

import { useFormStatus } from 'react-dom'
import { Save } from 'lucide-react'
import { cloneElement, isValidElement } from 'react'

export default function SubmitButton({ 
  text = 'Lưu Thay Đổi', 
  icon,
  formAction,
  variant = 'primary'
}: { 
  text?: string, 
  icon?: any,
  formAction?: any,
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'success'
}) {
  const { pending } = useFormStatus()
  
  const baseClasses = "flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold shadow-sm transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    warning: "bg-yellow-500 text-white shadow-yellow-200 hover:bg-yellow-600",
    danger: "bg-red-500 text-white shadow-red-200 hover:bg-red-600",
    success: "bg-green-600 text-white shadow-green-200 hover:bg-green-700"
  }

  const iconClass = `h-4 w-4 ${pending ? 'animate-pulse' : ''}`

  return (
    <button 
      type="submit" 
      disabled={pending}
      formAction={formAction}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {icon ? (
        isValidElement(icon) ? cloneElement(icon, { className: iconClass } as any) : icon
      ) : (
        <Save className={iconClass} />
      )}
      {pending ? 'Đang xử lý...' : text}
    </button>
  )
}
