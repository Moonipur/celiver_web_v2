import { getSessionFn } from '@/servers/user.functions'
import { createMiddleware } from '@tanstack/react-start'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSessionFn()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    return next({ context: { session: session.session, user: session.user } })
  },
)
