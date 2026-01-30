import { createServerFn } from '@tanstack/react-start'
import axios from 'axios'
import { AuthResponse, createHeader, createHeaderTotken } from './types'
import { UserRegistSchema, UserLoginSchema } from '@backend/schemas/user.schema'
import { setCookie, getCookie } from '@tanstack/react-start/server'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthResponse | null> => {
    try {
      const token = getCookie('token')

      const response = await axios.get<AuthResponse>(
        `${process.env.BACKEND_URL}/api/auth/get-session`,
        { headers: createHeaderTotken(token as string) },
      )

      return response.data
    } catch (error) {
      console.error('Session fetch failed:', error)
      return null
    }
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
        {
          headers: createHeader(),
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
  .handler(async ({ data }) => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/sign-in/email`,
        { email: data.email, password: data.password },
        { headers: createHeader() },
      )

      setCookie('token', response.data.token)

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend Error:', error.response?.data)
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      console.error('Server Fn Error:', error)
      throw new Error('Internal Server Error')
    }
  })

export const changeUserRole = createServerFn({
  method: 'POST',
}).handler(async () => {})
