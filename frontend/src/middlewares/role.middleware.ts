import { getSessionFn } from '@/servers/user.functions'
import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

export const clientMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSessionFn()

  if (session?.user.role === 'client') {
    // This sends the user to login instead of showing an error page
    throw redirect({
      to: '/',
    })
  }

  return next({
    context: {
      session: session,
    },
  })
})

export const adminMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSessionFn()

  if (session?.user.role === 'admin') {
    // This sends the user to login instead of showing an error page
    throw redirect({
      to: '/',
    })
  }

  return next({
    context: {
      session: session,
    },
  })
})

export const clinAdminMiddleware = createMiddleware().server(
  async ({ next }) => {
    const session = await getSessionFn()

    if (session?.user.role === 'clinAdmin') {
      // This sends the user to login instead of showing an error page
      throw redirect({
        to: '/',
      })
    }

    return next({
      context: {
        session: session,
      },
    })
  },
)
