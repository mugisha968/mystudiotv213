import { ApiError } from './http.js'
import { LANGUAGES, type LanguageCode } from '../types.js'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function asString(
  value: unknown,
  field: string,
  maxLength = 240,
): string {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'invalid_request', `${field} must be a string`)
  }
  if (!value.trim()) {
    throw new ApiError(400, 'invalid_request', `${field} is required`)
  }
  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    throw new ApiError(
      400,
      'invalid_request',
      `${field} is too long (max ${maxLength} characters)`,
    )
  }
  return trimmed
}

export function asOptionalString(
  value: unknown,
  field: string,
  maxLength?: number,
): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') {
    throw new ApiError(400, 'invalid_request', `${field} must be a string`)
  }
  const trimmed = value.trim()
  if (!trimmed) return null
  if (maxLength && trimmed.length > maxLength) {
    throw new ApiError(
      400,
      'invalid_request',
      `${field} is too long (max ${maxLength} characters)`,
    )
  }
  return trimmed
}

export function asLanguage(value: unknown): LanguageCode {
  if (typeof value !== 'string' || !(LANGUAGES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'invalid_request', 'Invalid language')
  }
  return value as LanguageCode
}

export function asBoolean(value: unknown, field: string, fallback = false): boolean {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  throw new ApiError(400, 'invalid_request', `${field} must be a boolean`)
}

export function asStringArray(
  value: unknown,
  field: string,
  maxItems = 20,
): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'invalid_request', `${field} must be an array`)
  }
  if (value.length > maxItems) {
    throw new ApiError(400, 'invalid_request', `${field} has too many items`)
  }
  const out: string[] = []
  for (const item of value) {
    if (typeof item !== 'string' || !item.trim()) continue
    const trimmed = item.trim()
    if (!out.includes(trimmed)) out.push(trimmed)
  }
  return out
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidYouTubeUrl(value: string): boolean {
  const trimmed = value.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return true
  const tryUrl = (() => {
    try {
      return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    } catch {
      return null
    }
  })()
  if (!tryUrl) return false
  const host = tryUrl.hostname.replace(/^www\./, '')
  return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com'
}

export function asId(value: unknown, field: string): number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number.parseInt(value, 10)
  throw new ApiError(400, 'invalid_request', `${field} must be a positive integer`)
}

export function asOptionalId(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === '') return null
  return asId(value, field)
}

export function parseRouteId(value: unknown): number {
  if (typeof value === 'string' || typeof value === 'number') {
    if (typeof value === 'number') return Number.isInteger(value) ? value : Number.NaN
    const n = Number.parseInt(value, 10)
    return Number.isFinite(n) ? n : Number.NaN
  }
  if (Array.isArray(value)) {
    const first = value[0]
    return first !== undefined ? parseRouteId(first) : Number.NaN
  }
  return Number.NaN
}