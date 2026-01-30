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

type UserRole =
  | 'client'
  | 'admin'
  | 'clinAdmin'
  | 'superAdmin'
  | null
  | undefined

export type AuthResponse = {
  session: {
    id: string
    createdAt: string
    updatedAt: string
    userId: string
    expiresAt: string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  }
  user: {
    id: string
    createdAt: string
    updatedAt: string
    email: string
    emailVerified: boolean
    name: string
    image?: string | null
    role: UserRole
  }
}
