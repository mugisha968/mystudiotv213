import { api } from './api'
import type {
  AdminStats,
  Advertisement,
  AdvertisementInput,
  Article,
  ArticleInput,
  ArticleStatus,
  Category,
  CategoryInput,
  JournalistStats,
  JournalistWithCount,
  ManagerStats,
  MediaItem,
  PersonInput,
  Profile,
  Stats,
} from '@/types'

export interface ArticleListParams {
  category?: string
  author?: number | string
  language?: string
  q?: string
  limit?: number
  offset?: number
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const articlesApi = {
  list: (params: ArticleListParams = {}) =>
    api.get<{ articles: Article[]; total: number }>(
      `/api/articles${buildQuery({ ...params })}`,
    ),
  bySlug: (slug: string) =>
    api.get<{ article: Article }>(`/api/articles/${encodeURIComponent(slug)}`),
  featured: (limit = 6) =>
    api.get<{ articles: Article[] }>(`/api/articles/featured${buildQuery({ limit })}`),
  breaking: (limit = 5) =>
    api.get<{ articles: Article[] }>(`/api/articles/breaking${buildQuery({ limit })}`),
  popular: (limit = 10) =>
    api.get<{ articles: Article[] }>(`/api/articles/popular${buildQuery({ limit })}`),
  videos: (limit = 12) =>
    api.get<{ articles: Article[] }>(`/api/articles/videos${buildQuery({ limit })}`),
  journalistMine: (status?: ArticleStatus) =>
    api.get<{ articles: Article[] }>(
      `/api/articles/dashboard/journalist/articles${buildQuery({ status })}`,
    ),
  staffAll: (status?: ArticleStatus, featured?: boolean) =>
    api.get<{ articles: Article[] }>(
      `/api/articles/dashboard/articles${buildQuery({
        status,
        featured: featured === true ? 'true' : undefined,
      })}`,
    ),
  create: (input: ArticleInput) =>
    api.post<{ article: Article }>('/api/articles', input),
  update: (id: number, input: ArticleInput) =>
    api.put<{ article: Article }>(
      `/api/articles/dashboard/article/${id}`,
      input,
    ),
  remove: (id: number) =>
    api.del<void>(`/api/articles/dashboard/article/${id}`),
  publish: (id: number) =>
    api.post<{ article: Article }>(`/api/articles/dashboard/article/${id}/publish`),
  unpublish: (id: number) =>
    api.post<{ article: Article }>(`/api/articles/dashboard/article/${id}/unpublish`),
  archive: (id: number) =>
    api.post<{ article: Article }>(`/api/articles/dashboard/article/${id}/archive`),
  setFeatured: (id: number, featured: boolean) =>
    api.post<{ article: Article }>(
      `/api/articles/dashboard/article/${id}/featured`,
      { featured },
    ),
  setBreaking: (id: number, breaking: boolean) =>
    api.post<{ article: Article }>(
      `/api/articles/dashboard/article/${id}/breaking`,
      { breaking },
    ),
}

export const categoriesApi = {
  list: () => api.get<{ categories: Category[] }>('/api/categories'),
  create: (input: CategoryInput) =>
    api.post<{ category: Category }>('/api/categories', input),
  update: (id: number, input: CategoryInput) =>
    api.put<{ category: Category }>(`/api/categories/${id}`, input),
  remove: (id: number) => api.del<void>(`/api/categories/${id}`),
}

export const journalistsApi = {
  list: (verifiedOnly = false) =>
    api.get<{ journalists: JournalistWithCount[] }>(
      `/api/journalists${buildQuery({ verifiedOnly: verifiedOnly ? 'true' : undefined })}`,
    ),
  byId: (id: number | string) =>
    api.get<{ journalist: Profile; articleCount: number }>(
      `/api/journalists${buildQuery({ id })}`,
    ),
  staffList: () =>
    api.get<{ journalists: JournalistWithCount[] }>(
      '/api/journalists/dashboard/journalists',
    ),
  managersList: () =>
    api.get<{ managers: Profile[] }>('/api/journalists/dashboard/managers'),
  create: (input: PersonInput) =>
    api.post<{ journalist: JournalistWithCount }>(
      '/api/journalists/dashboard/journalists',
      input,
    ),
  update: (id: number, input: PersonInput) =>
    api.patch<{ journalist: JournalistWithCount }>(
      `/api/journalists/dashboard/journalists/${id}`,
      input,
    ),
  remove: (id: number) =>
    api.del<void>(`/api/journalists/dashboard/journalists/${id}`),
}

export const managersApi = {
  list: () => api.get<{ managers: Profile[] }>('/api/managers'),
  create: (input: PersonInput) =>
    api.post<{ manager: Profile }>('/api/managers', input),
  update: (id: number, input: PersonInput) =>
    api.patch<{ manager: Profile }>(`/api/managers/${id}`, input),
  remove: (id: number) => api.del<void>(`/api/managers/${id}`),
}

export const uploadsApi = {
  list: () => api.get<{ media: MediaItem[] }>('/api/uploads'),
  upload: (file: File, dest: 'avatar' | 'article-image') => {
    const form = new FormData()
    form.append('file', file)
    form.append('dest', dest)
    return api.postForm<{ url: string }>('/api/uploads', form)
  },
}

export const authApi = {
  me: () => api.get<{ user: Profile }>('/api/auth/me'),
  login: (email: string, password: string) =>
    api.post<{ user: Profile }>('/api/auth/login', { email, password }),
  logout: () => api.post<void>('/api/auth/logout'),
  requestReset: (email: string) =>
    api.post<{ ok: true }>('/api/auth/reset-password', { email }),
  confirmReset: (token: string, password: string) =>
    api.post<{ ok: true }>('/api/auth/reset-password/confirm', {
      token,
      password,
    }),
  updateMe: (input: PersonInput) =>
    api.patch<{ user: Profile }>('/api/auth/me', input),
  changePassword: (current_password: string, new_password: string) =>
    api.post<{ ok: true }>('/api/auth/change-password', {
      current_password,
      new_password,
    }),
}

export const statsApi = {
  get: () => api.get<{ stats: Stats }>('/api/dashboard/stats'),
}

export function isAdminStats(stats: Stats): stats is AdminStats {
  return 'managers' in stats && 'activeSessions' in stats
}

export function isManagerStats(stats: Stats): stats is ManagerStats {
  return 'journalists' in stats && !('activeSessions' in stats)
}

export function isJournalistStats(stats: Stats): stats is JournalistStats {
  return !('journalists' in stats) && !('activeSessions' in stats)
}

export const advertisementsApi = {
  activeBySlot: (slot: string) =>
    api.get<{ ads: Advertisement[] }>(`/api/advertisements/slot/${encodeURIComponent(slot)}`),
  allActive: () =>
    api.get<{ ads: Record<string, Advertisement[]> }>('/api/advertisements/active'),
  staffAll: () =>
    api.get<{ ads: Advertisement[] }>('/api/advertisements'),
  create: (input: AdvertisementInput) =>
    api.post<{ ad: Advertisement }>('/api/advertisements', input),
  update: (id: number, input: AdvertisementInput) =>
    api.put<{ ad: Advertisement }>(`/api/advertisements/${id}`, input),
  remove: (id: number) =>
    api.del<void>(`/api/advertisements/${id}`),
}