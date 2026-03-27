import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import Header from '@/components/Header'

import appCss from '@/styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { NotFound } from '@/components/NotFound'
import { AuthResponse } from '@/servers/types'
import { getSessionFn } from '@/servers/user.functions'
import { Toaster } from '@/components/ui/sonner'

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

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        <Toaster />
        {/* <TanStackDevtools
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
        /> */}
        <Scripts />
      </body>
    </html>
  )
}
