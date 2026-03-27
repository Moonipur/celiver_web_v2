import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/tracking')({
  component: TrackingLayout,
})

function TrackingLayout() {
  return (
    <div>
      {/* If this Outlet is missing, $lotId.tsx will never render! */}
      <Outlet />
    </div>
  )
}
