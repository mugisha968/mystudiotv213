import { db } from './index.js'
import { serializeArticle } from '../util/serialize.js'
import type {
  ArticleRow,
  ArticleWithRelations,
  CategoryRow,
  ProfileRow,
} from '../types.js'

export interface ArticleQuery {
  from?: string
  where?: string
  params?: Array<string | number>
  order?: string
  limitOffset?: string
}

const DEFAULT_ORDER = 'order by a.published_at desc'

export function queryArticles(query: ArticleQuery): ArticleWithRelations[] {
  const { from = '', where = '', params = [], order = DEFAULT_ORDER, limitOffset = '' } = query

  const sql = [
    'select a.* from articles a',
    from,
    where ? `where ${where}` : '',
    order,
    limitOffset,
  ]
    .filter(Boolean)
    .join(' ')

  const rows = db.prepare(sql).all(...params) as ArticleRow[]
  if (rows.length === 0) return []

  const authorIds = [...new Set(rows.map((row) => row.author_id))]
  const categoryIds = [
    ...new Set(
      rows
        .map((row) => row.category_id)
        .filter((id): id is number => id !== null),
    ),
  ]
  const reviewerIds = [
    ...new Set(
      rows
        .map((row) => row.reviewed_by)
        .filter((id): id is number => id !== null),
    ),
  ]

  const authors = fetchProfilesByIds(authorIds)
  const categories = fetchCategoriesByIds(categoryIds)
  const reviewers = fetchProfilesByIds(reviewerIds)

  return rows.map((row) =>
    serializeArticle(
      row,
      authors.get(row.author_id),
      row.category_id !== null ? categories.get(row.category_id) : undefined,
      row.reviewed_by !== null ? reviewers.get(row.reviewed_by) : null,
    ),
  )
}

export function countArticles(
  from: string,
  where: string,
  params: Array<string | number>,
): number {
  const sql = [
    'select count(*) as total from articles a',
    from,
    where ? `where ${where}` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const row = db.prepare(sql).get(...params) as { total: number } | undefined
  return row?.total ?? 0
}

function fetchProfilesByIds(ids: number[]): Map<number, ProfileRow> {
  if (ids.length === 0) return new Map()
  const placeholders = ids.map(() => '?').join(',')
  const rows = db
    .prepare(`select * from profiles where id in (${placeholders})`)
    .all(...ids) as ProfileRow[]
  return new Map(rows.map((row) => [row.id, row]))
}

function fetchCategoriesByIds(ids: number[]): Map<number, CategoryRow> {
  if (ids.length === 0) return new Map()
  const placeholders = ids.map(() => '?').join(',')
  const rows = db
    .prepare(`select * from categories where id in (${placeholders})`)
    .all(...ids) as CategoryRow[]
  return new Map(rows.map((row) => [row.id, row]))
}