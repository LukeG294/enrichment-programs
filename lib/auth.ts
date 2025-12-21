export const API_BASE_URL = "https://api.ckpnt.com"

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
  campus_id?: string | null
  profilepicture?: string
}

const ACCESS_TOKEN_COOKIE = "access_token"
const USER_STORAGE_KEY = "ckpnt_user"

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null
  }

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") {
    return
  }

  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`
}

export const storeSession = (token: string, user: AuthenticatedUser) => {
  if (typeof window === "undefined") {
    return
  }

  setCookie(ACCESS_TOKEN_COOKIE, token)
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export const getStoredUser = (): AuthenticatedUser | null => {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as AuthenticatedUser
  } catch {
    return null
  }
}

export const getAccessToken = () => getCookie(ACCESS_TOKEN_COOKIE)

export class Auth {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      const error: any = new Error(data?.message || "Unable to login")
      if (typeof data?.code !== "undefined") {
        error.code = data.code
      }

      throw error
    }

    return data as { success: boolean; token: string; user: AuthenticatedUser }
  }

  async setPassword(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      const error: any = new Error(data?.message || "Unable to set password")
      if (typeof data?.code !== "undefined") {
        error.code = data.code
      }

      throw error
    }

    return data as { success: boolean; message: string }
  }
}
