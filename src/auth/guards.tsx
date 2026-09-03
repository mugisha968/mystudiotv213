import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/types'

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8 text-brand-700" />
    </div>
  )
}

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode
  roles?: UserRole[]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoader />

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}