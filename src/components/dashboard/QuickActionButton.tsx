'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type ActionFunction = (taskId: string) => Promise<{ success?: boolean; error?: string }>

export default function QuickActionButton({ 
  taskId, 
  action, 
  label, 
  variant = 'primary'
}: { 
  taskId: string
  action: ActionFunction
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleAction = () => {
    setStatus('idle')
    startTransition(async () => {
      try {
        const result = await action(taskId)
        if (result.error) {
          setStatus('error')
          setErrorMessage(result.error)
          setTimeout(() => setStatus('idle'), 3000)
        } else {
          setStatus('success')
          setTimeout(() => setStatus('idle'), 2000)
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage('Có lỗi xảy ra')
        setTimeout(() => setStatus('idle'), 3000)
      }
    })
  }

  const baseClasses = "relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 overflow-hidden"
  const variantClasses = {
    primary: "bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-inset ring-blue-600/10",
    secondary: "bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-inset ring-gray-500/10",
    success: "bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-inset ring-green-600/10",
    warning: "bg-orange-50 text-orange-700 hover:bg-orange-100 ring-1 ring-inset ring-orange-600/10",
  }

  return (
    <button
      onClick={handleAction}
      disabled={isPending || status === 'success'}
      className={`${baseClasses} ${variantClasses[variant]} disabled:opacity-70 disabled:cursor-not-allowed group`}
    >
      <span className={`flex items-center gap-1.5 ${status !== 'idle' ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {label}
      </span>

      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </span>
      )}

      {status === 'success' && (
        <span className="absolute inset-0 flex items-center justify-center bg-green-500 text-white">
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> OK
        </span>
      )}

      {status === 'error' && (
        <span className="absolute inset-0 flex items-center justify-center bg-red-500 text-white text-[10px] whitespace-nowrap px-1 cursor-help" title={errorMessage}>
          <XCircle className="h-3 w-3 mr-0.5" /> Lỗi
        </span>
      )}
    </button>
  )
}
