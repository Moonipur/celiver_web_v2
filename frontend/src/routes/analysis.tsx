import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/analysis')({
  component: AnalysisLayout,
})

function AnalysisLayout() {
  return (
    <div>
      {/* If this Outlet is missing, $lotId.tsx will never render! */}
      <Outlet />
    </div>
  )
}
