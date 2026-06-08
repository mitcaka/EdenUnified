'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

import Image from 'next/image'
import { BRAND } from '@/lib/brand'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await login(formData)
    },
    null
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          <Image src="/logo.svg" alt="TaskForge Logo" width={56} height={56} className="mb-4" />
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            {BRAND.name}
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-slate-500">
            {BRAND.tagline}
          </p>
        </div>
        <form className="mt-2 space-y-4" action={action}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Tài khoản
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Tài khoản (admin)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-sm text-red-500 text-center">{state.error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
