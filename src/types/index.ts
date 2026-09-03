export const ROLES = ['admin', 'manager', 'journalist'] as const

export type UserRole = (typeof ROLES)[number]

export const ACCOUNT_STATUSES = ['active', 'inactive', 'pending'] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]

export const LANGUAGES = ['rw', 'en', 'fr'] as const

export type LanguageCode = (typeof LANGUAGES)[number]

export interface Profile {
  id: number
  email: string
  full_name: string
  role: UserRole
  avatar_path: string | null
  bio: string | null
  verified: boolean
  blue_badge: boolean
  preferred_language: LanguageCode
  status: AccountStatus
  created_at: string
  updated_at: string
}

export interface JournalistWithCount extends Profile {
  articleCount: number
}

export interface Category {
  id: number
  slug: string
  name_key: string
  description_key: string | null
  created_at: string
  updated_at: string
  publishedCount: number
}

export interface ArticleAuthor {
  id: number
  full_name: string
  avatar_path: string | null
  bio: string | null
  verified: boolean
  blue_badge: boolean
  role: UserRole
  status: AccountStatus
  created_at: string
}

export interface ArticleCategory {
  id: number
  slug: string
  name_key: string
}

export interface Article {
  id: number
  author_id: number
  category_id: number | null
  title: string
  slug: string
  content: string
  featured_image: string | null
  images: string[]
  youtube_url: string | null
  article_language: LanguageCode
  status: ArticleStatus
  featured: boolean
  breaking_news: boolean
  views: number
  tags: string[]
  published_at: string | null
  created_at: string
  updated_at: string
  author: ArticleAuthor
  category: ArticleCategory | null
}

export interface ArticleInput {
  title?: string
  content?: string
  category_id?: number | null
  featured_image?: string | null
  images?: string[]
  tags?: string[]
  youtube_url?: string | null
  article_language?: LanguageCode
  status?: ArticleStatus
  author_id?: number
}

export interface CategoryInput {
  name: string
  slug?: string
  description?: string
}

export interface PersonInput {
  email?: string
  full_name?: string
  password?: string
  bio?: string
  avatar_path?: string | null
  status?: AccountStatus
  verified?: boolean
  blue_badge?: boolean
  preferred_language?: LanguageCode
}

export interface MediaItem {
  url: string
  user_id: number | null
  size_bytes: number
  modified_at: string
  kind: 'avatar' | 'article-image'
}

export interface AdminStats {
  managers: number
  journalists: number
  users: number
  publishedArticles: number
  draftArticles: number
  archivedArticles: number
  articles: number
  categories: number
  activeSessions: number
}

export interface ManagerStats {
  journalists: number
  publishedArticles: number
  draftArticles: number
  archivedArticles: number
  articles: number
  categories: number
}

export interface JournalistStats {
  publishedArticles: number
  draftArticles: number
  archivedArticles: number
  articles: number
}

export type Stats = AdminStats | ManagerStats | JournalistStats

export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  admin: 'roles.admin',
  manager: 'roles.manager',
  journalist: 'roles.journalist',
}

export const STATUS_LABEL_KEYS: Record<ArticleStatus, string> = {
  draft: 'status.draft',
  published: 'status.published',
  archived: 'status.archived',
}

export const LANGUAGE_LABEL_KEYS: Record<LanguageCode, string> = {
  rw: 'languages.rw',
  en: 'languages.en',
  fr: 'languages.fr',
}

export const AD_SLOTS = [
  'top-banner',
  'sidebar-top',
  'sidebar-bottom',
  'in-feed-1',
  'in-feed-2',
  'article-top',
  'article-mid',
  'mobile-banner',
  'footer-above',
] as const

export type AdSlot = (typeof AD_SLOTS)[number]

export const AD_TYPES = ['image', 'html'] as const

export type AdType = (typeof AD_TYPES)[number]

export interface Advertisement {
  id: number
  title: string
  image_url: string
  link_url: string | null
  slot: AdSlot
  ad_type: AdType
  html_content: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AdvertisementInput {
  title?: string
  image_url?: string
  link_url?: string | null
  slot?: AdSlot
  ad_type?: AdType
  html_content?: string | null
  is_active?: boolean
  sort_order?: number
}