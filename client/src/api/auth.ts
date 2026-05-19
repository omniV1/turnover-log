import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import { apiPost } from './client'

export function login(request: LoginRequest) {
  return apiPost<AuthResponse>('/api/auth/login', request)
}

export function register(request: RegisterRequest) {
  return apiPost<AuthResponse>('/api/auth/register', request)
}
