export const ROLES = ['admin', 'manager', 'journalist'] as const

export type UserRole = (typeof ROLES)[number]

export const ACCOUNT_STATUSES = ['active', 'inactive', 'pending'] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const ARTICLE_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'archived',
] as const

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]

export const LANGUAGES = ['rw', 'en', 'fr'] as const

export type LanguageCode = (typeof LANGUAGES)[number]

export interface ProfileRow {
  id: number
  email: string
  full_name: string
  role: UserRole
  password_hash: string
  avatar_path: string | null
  bio: string | null
  verified: 0 | 1
  blue_badge: 0 | 1
  preferred_language: LanguageCode
  status: AccountStatus
  created_at: string
  updated_at: string
}

export interface PublicProfile {
  id: number
  email?: string
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

export interface CategoryRow {
  id: number
  slug: string
  name_key: string
  description_key: string | null
  created_at: string
  updated_at: string
}

export interface ArticleRow {
  id: number
  author_id: number
  category_id: number | null
  title: string
  slug: string
  content: string
  featured_image: string | null
  images: string
  youtube_url: string | null
  article_language: LanguageCode
  status: ArticleStatus
  featured: 0 | 1
  breaking_news: 0 | 1
  views: number
  tags: string
  published_at: string | null
  scheduled_at: string | null
  submitted_at: string | null
  reviewed_by: number | null
  reviewed_at: string | null
  reject_reason: string | null
  created_at: string
  updated_at: string
}

export interface ArticleWithRelations
  extends Omit<
    ArticleRow,
    'images' | 'featured' | 'tags' | 'breaking_news' | 'reviewed_by'
  > {
  images: string[]
  featured: boolean
  breaking_news: boolean
  tags: string[]
  reviewed_by: Partial<ArticleAuthor> | null
  author: ArticleAuthor
  category: ArticleCategory | null
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

export interface AdvertisementRow {
  id: number
  title: string
  image_url: string
  link_url: string | null
  slot: AdSlot
  ad_type: AdType
  html_content: string | null
  is_active: 0 | 1
  sort_order: number
  created_at: string
  updated_at: string
}

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