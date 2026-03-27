import { getSessionFn } from '@/servers/user.functions'
import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSessionFn()

  if (!session || !session?.user) {
    // This sends the user to login instead of showing an error page
    throw redirect({
      to: '/login',
    })
  }

  return next({
    context: {
      session,
    },
  })
})
