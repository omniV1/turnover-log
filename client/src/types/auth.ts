export interface AuthResponse {
  token: string
  email: string
  displayName: string
  expiresAtUtc: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  supervisorEmail: string
  displayName?: string
}
