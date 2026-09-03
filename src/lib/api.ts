const DEFAULT_API_URL =
  import.meta.env.PROD
    ? 'https://mystudiotv213.onrender.com'
    : 'http://localhost:4000'

export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  DEFAULT_API_URL
)

/**
 * Resolve a possibly-relative media path (e.g. `/uploads/article-images/...`)
 * against the API origin. In production the frontend is served from a
 * different host than the backend, so relative `/uploads` paths must be
 * pointed at the Render origin. Absolute URLs are passed through unchanged.
 */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return path
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

interface ErrorBody {
  error?: { message?: string; code?: string }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'content-type': 'application/json' }
        : {}),
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const errorBody = (body ?? {}) as ErrorBody
    throw new ApiError(
      response.status,
      errorBody.error?.code ?? 'request_failed',
      errorBody.error?.message ?? 'Request failed',
    )
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
