import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/report')({
  component: ReportLayout,
})

function ReportLayout() {
  return (
    <div>
      {/* If this Outlet is missing, $lotId.tsx will never render! */}
      <Outlet />
    </div>
  )
}
