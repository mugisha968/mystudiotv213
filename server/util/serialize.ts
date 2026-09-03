import type {
  ArticleAuthor,
  ArticleCategory,
  ArticleRow,
  ArticleWithRelations,
  CategoryRow,
  ProfileRow,
  PublicProfile,
} from '../types.js'
export function parseTags(tags: string): string[] {
  try {
    const parsed: unknown = JSON.parse(tags)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    avatar_path: row.avatar_path,
    bio: row.bio,
    verified: row.verified === 1,
    blue_badge: row.blue_badge === 1,
    preferred_language: row.preferred_language,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function parseImages(images: string): string[] {
  try {
    const parsed: unknown = JSON.parse(images)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function toArticleAuthor(row: ProfileRow): ArticleAuthor {
  return {
    id: row.id,
    full_name: row.full_name,
    avatar_path: row.avatar_path,
    bio: row.bio,
    verified: row.verified === 1,
    blue_badge: row.blue_badge === 1,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
  }
}

export function toArticleCategory(row: CategoryRow): ArticleCategory {
  return { id: row.id, slug: row.slug, name_key: row.name_key }
}

export function serializeArticle(
  row: ArticleRow,
  author: ProfileRow | undefined,
  category: CategoryRow | undefined,
  reviewer?: ProfileRow | null,
): ArticleWithRelations {
  const fallbackAuthor = (id: number): ArticleAuthor => ({
    id,
    full_name: '',
    avatar_path: null,
    bio: null,
    verified: false,
    blue_badge: false,
    role: 'journalist',
    status: 'active',
    created_at: '',
  })

  return {
    id: row.id,
    author_id: row.author_id,
    category_id: row.category_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    featured_image: row.featured_image,
    images: parseImages(row.images),
    youtube_url: row.youtube_url,
    article_language: row.article_language,
    status: row.status,
    featured: row.featured === 1,
    breaking_news: row.breaking_news === 1,
    views: row.views,
    tags: parseTags(row.tags),
    published_at: row.published_at,
    scheduled_at: row.scheduled_at,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    reject_reason: row.reject_reason,
    reviewed_by: reviewer ? toArticleAuthor(reviewer) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: author ? toArticleAuthor(author) : fallbackAuthor(row.author_id),
    category: category ? toArticleCategory(category) : null,
  }
}