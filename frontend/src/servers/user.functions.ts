import { createServerFn } from '@tanstack/react-start'
import axios from 'axios'
import {
  AuthResponse,
  createHeader,
  LoginResponse,
  LogoutResponse,
} from './types'
import { UserRegistSchema, UserLoginSchema } from '@backend/schemas/user.schema'
import {
  setCookie,
  getCookie,
  deleteCookie,
} from '@tanstack/react-start/server'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthResponse | null> => {
    try {
      const token = getCookie('token')

      if (!token) {
        return null
      }

      const response = await axios.get<AuthResponse>(
        `${process.env.BACKEND_URL}/api/users/getSession/${token}`,
        { withCredentials: true },
      )

      if (!response.data || !response.data.session) {
        return null
      }

      setCookie('token', response.data.session.token, {
        path: '/',
        expires: new Date(response.data.session.expiresAt),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })

      return response.data
    } catch (error) {
      console.error('Session fetch failed:', error)
      // Clear the invalid cookie
      setCookie('token', '', { path: '/', expires: new Date(0) })
      return null
    }
  },
)

export const logoutUser = createServerFn({ method: 'POST' }).handler(
  async (): Promise<LogoutResponse | null | void> => {
    const logoutResponse = await axios.post<LogoutResponse>(
      `${process.env.BACKEND_URL}/api/auth/sign-out`,
      {},
      { headers: createHeader(), withCredentials: true },
    )

    console.log(logoutResponse.data)

    deleteCookie('token')

    return logoutResponse.data
  },
)

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UserRegistSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/sign-up/email`,
        {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
        },
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend Error:', error.response?.data)
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
      console.error('Server Fn Error:', error)
      throw new Error('Internal Server Error')
    }
  })

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UserLoginSchema.parse(data))
  .handler(async ({ data }): Promise<AuthResponse | null> => {
    try {
      // 1. Get the initial token
      const loginResponse = await axios.post<LoginResponse>(
        `${process.env.BACKEND_URL}/api/auth/sign-in/email`,
        { email: data.email, password: data.password },
        { headers: createHeader() },
      )

      const sessionResponse = await axios.get<AuthResponse>(
        `${process.env.BACKEND_URL}/api/users/getSession/${loginResponse.data.token}`,
      )

      if (!sessionResponse.data || !sessionResponse.data.session) {
        return null
      }

      // 3. Set the final, session-aware cookie
      setCookie('token', sessionResponse.data.session.token, {
        path: '/',
        expires: new Date(sessionResponse.data.session.expiresAt),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })

      // 4. Return the session data
      return sessionResponse.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend Error:', error.response?.data)
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      console.error('Server Fn Error:', error)
      throw new Error('Internal Server Error')
    }
  })
