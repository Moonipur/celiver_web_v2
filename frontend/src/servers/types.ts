import { auth } from '@backend/lib/auth'

export type AuthResponse = typeof auth.$Infer.Session

export interface SessionType {
  session: AuthResponse | null
}

export function createHeader() {
  return {
    Origin: process.env.BACKEND_URL,
    'Content-Type': 'application/json',
  }
}

export function createHeaderTotken(token: string) {
  return {
    Origin: process.env.BACKEND_URL,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}
