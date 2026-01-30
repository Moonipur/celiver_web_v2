import { createServerFn } from '@tanstack/react-start'
import axios from 'axios'
import { createHeader } from './types'
import { UserRegistSchema } from '@backend/schemas/user.schema'

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

export const changeUserRole = createServerFn({
  method: 'POST',
}).handler(async () => [
  { id: 1, name: 'Teenage Dirtbag', artist: 'Wheatus' },
  { id: 2, name: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { id: 3, name: 'The Middle', artist: 'Jimmy Eat World' },
  { id: 4, name: 'My Own Worst Enemy', artist: 'Lit' },
  { id: 5, name: 'Fat Lip', artist: 'Sum 41' },
  { id: 6, name: 'All the Small Things', artist: 'blink-182' },
  { id: 7, name: 'Beverly Hills', artist: 'Weezer' },
])
