import { clearSession, getToken } from '../auth/storage'

const baseUrl = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearSession()
    throw new ApiError('Unauthorized', 401)
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

type HttpMethod = 'GET' | 'POST' | 'PATCH'

async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...authHeaders(),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return handleResponse<T>(res)
}

export function apiGet<T>(path: string) {
  return apiRequest<T>('GET', path)
}

export function apiPost<T>(path: string, body: unknown) {
  return apiRequest<T>('POST', path, body)
}

export function apiPatch<T>(path: string) {
  return apiRequest<T>('PATCH', path)
}
