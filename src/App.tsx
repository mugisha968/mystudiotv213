import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { RedirectIfAuthenticated, RequireAuth } from '@/auth/guards'
import { useAuth } from '@/auth/AuthContext'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AboutPage } from '@/pages/public/AboutPage'
import { ArticlePage } from '@/pages/public/ArticlePage'
import { CategoriesPage } from '@/pages/public/CategoriesPage'
import { CategoryPage } from '@/pages/public/CategoryPage'
import { HomePage } from '@/pages/public/HomePage'
import { JournalistProfilePage } from '@/pages/public/JournalistProfilePage'
import { JournalistsPage } from '@/pages/public/JournalistsPage'
import { NewsPage } from '@/pages/public/NewsPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { SearchPage } from '@/pages/public/SearchPage'
import { VideosPage } from '@/pages/public/VideosPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import type { UserRole } from '@/types'

const ROLES = ['admin', 'manager', 'journalist'] as const

function isUserRole(value: string | undefined): value is UserRole {
  return value !== undefined && (ROLES as readonly string[]).includes(value)
}

function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return null
  return <Navigate to={`/dashboard/${user.role}/overview`} replace />
}

function DashboardRoute() {
  const params = useParams<{ role: string; section?: string }>()

  if (!isUserRole(params.role)) {
    return (
      <RequireAuth>
        <NotFoundPage />
      </RequireAuth>
    )
  }

  return (
    <RequireAuth roles={[params.role as UserRole]}>
      <DashboardPage role={params.role as UserRole} />
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<ArticlePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="journalists" element={<JournalistsPage />} />
        <Route path="journalists/:id" element={<JournalistProfilePage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="forgot-password"
          element={
            <RedirectIfAuthenticated>
              <ForgotPasswordPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="reset-password"
          element={
            <RedirectIfAuthenticated>
              <ResetPasswordPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <DashboardRedirect />
          </RequireAuth>
        }
      />
      <Route path="dashboard/:role/:section?" element={<DashboardRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}