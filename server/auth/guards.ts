import type { NextFunction, Request, Response } from 'express'

import { getSessionUser } from './sessions.js'
import type { PublicProfile } from '../types.js'
import { ApiError } from '../util/http.js'
import { toPublicProfile } from '../util/serialize.js'

export function getUserFromRequest(req: Request): PublicProfile | null {
  const session = getSessionUser(req)
  if (!session) return null
  return toPublicProfile(session.profile)
}

export function getCurrentUser(res: Response): PublicProfile {
  return res.locals.user as PublicProfile
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getUserFromRequest(req)
  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Authentication required'))
    return
  }
  res.locals.user = user
  next()
}

export function requireRole(...roles: PublicProfile['role'][]): (
  _req: Request,
  res: Response,
  next: NextFunction,
) => void {
  return (_req, res, next) => {
    const user = res.locals.user as PublicProfile | undefined
    if (!user) {
      next(new ApiError(401, 'unauthorized', 'Authentication required'))
      return
    }
    if (!roles.includes(user.role) || user.status !== 'active') {
      next(new ApiError(403, 'forbidden', 'You do not have permission to do this'))
      return
    }
    next()
  }
}

export function requireActiveStaff(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = res.locals.user as PublicProfile | undefined
  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Authentication required'))
    return
  }
  if ((user.role !== 'admin' && user.role !== 'manager') || user.status !== 'active') {
    next(new ApiError(403, 'forbidden', 'Staff account is required'))
    return
  }
  next()
}

export function requireStaff(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = res.locals.user as PublicProfile | undefined
  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Authentication required'))
    return
  }
  if (user.role !== 'admin' && user.role !== 'manager') {
    next(new ApiError(403, 'forbidden', 'Staff account is required'))
    return
  }
  next()
}

export function requireActiveJournoOrStaff(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = res.locals.user as PublicProfile | undefined
  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Authentication required'))
    return
  }
  if (
    user.status !== 'active' ||
    (user.role !== 'journalist' && user.role !== 'admin' && user.role !== 'manager')
  ) {
    next(new ApiError(403, 'forbidden', 'An active content account is required'))
    return
  }
  next()
}

export function requireActiveJournalist(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = res.locals.user as PublicProfile | undefined
  if (!user) {
    next(new ApiError(401, 'unauthorized', 'Authentication required'))
    return
  }
  if (user.role !== 'journalist' || user.status !== 'active') {
    next(new ApiError(403, 'forbidden', 'Journalist account is required'))
    return
  }
  next()
}