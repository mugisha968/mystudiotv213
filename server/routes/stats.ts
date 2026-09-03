import { Router } from 'express'

import { getCurrentUser, requireAuth } from '../auth/guards.js'
import { db } from '../db/index.js'

export const statsRouter = Router()

statsRouter.get('/', requireAuth, (_req, res) => {
  const user = getCurrentUser(res)

  if (user.role === 'admin') {
    const totals = db
      .prepare(
        `select
          (select count(*) from profiles where role = 'manager') as managers,
          (select count(*) from profiles where role = 'journalist') as journalists,
          (select count(*) from profiles) as users,
          (select count(*) from articles where status = 'published') as published,
          (select count(*) from articles where status = 'draft') as drafts,
          (select count(*) from articles where status = 'archived') as archived,
          (select count(*) from articles) as articles,
          (select count(*) from categories) as categories,
          (select count(*) from sessions) as active_sessions`,
      )
      .get() as {
      managers: number
      journalists: number
      users: number
      published: number
      drafts: number
      archived: number
      articles: number
      categories: number
      active_sessions: number
    }
    res.json({
      stats: {
        managers: totals.managers,
        journalists: totals.journalists,
        users: totals.users,
        publishedArticles: totals.published,
        draftArticles: totals.drafts,
        archivedArticles: totals.archived,
        articles: totals.articles,
        categories: totals.categories,
        activeSessions: totals.active_sessions,
      },
    })
    return
  }

  if (user.role === 'manager') {
    const totals = db
      .prepare(
        `select
          (select count(*) from profiles where role = 'journalist') as journalists,
          (select count(*) from articles where status = 'published') as published,
          (select count(*) from articles where status = 'draft') as drafts,
          (select count(*) from articles where status = 'archived') as archived,
          (select count(*) from articles) as articles,
          (select count(*) from categories) as categories`,
      )
      .get() as {
      journalists: number
      published: number
      drafts: number
      archived: number
      articles: number
      categories: number
    }
    res.json({
      stats: {
        journalists: totals.journalists,
        publishedArticles: totals.published,
        draftArticles: totals.drafts,
        archivedArticles: totals.archived,
        articles: totals.articles,
        categories: totals.categories,
      },
    })
    return
  }

  const totals = db
    .prepare(
      `select
        (select count(*) from articles where author_id = ? and status = 'published') as published,
        (select count(*) from articles where author_id = ? and status = 'draft') as drafts,
        (select count(*) from articles where author_id = ? and status = 'archived') as archived,
        (select count(*) from articles where author_id = ?) as articles`,
    )
    .get(user.id, user.id, user.id, user.id) as {
    published: number
    drafts: number
    archived: number
    articles: number
  }
  res.json({
    stats: {
      publishedArticles: totals.published,
      draftArticles: totals.drafts,
      archivedArticles: totals.archived,
      articles: totals.articles,
    },
  })
})