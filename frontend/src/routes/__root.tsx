import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@frontend/components/Header'

import TanStackQueryDevtools from '@frontend/integrations/tanstack-query/devtools'

import appCss from '@frontend/styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { NotFound } from '@frontend/components/NotFound'
import { getSessionFn } from '@frontend/middlewares/auth.middleware'
import { AuthResponse } from '@frontend/servers/types'

interface MyRouterContext {
  queryClient: QueryClient
  session: AuthResponse
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const session = await getSessionFn()
    return {
      session,
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CEliver Analysis Website',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { session } = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <Header session={session} />
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
