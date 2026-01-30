import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client-order')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Client Order Page</div>
}
