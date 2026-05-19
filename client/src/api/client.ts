const baseUrl = import.meta.env.VITE_API_URL ?? ''

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}
