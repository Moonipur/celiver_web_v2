import { createMiddleware } from '@tanstack/react-start'
import { getEvent } from 'vinxi/http'
import { auth } from '@backend/lib/auth'

export async function getSessionFn() {
  const event = getEvent()

  return await auth.api.getSession({
    headers: event.headers,
  })
}

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSessionFn()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    return next({ context: { session: session.session, user: session.user } })
  },
)
