import { createFileRoute } from '@tanstack/react-router'
// import {} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div>
      <h1>App Home Page</h1>
    </div>
  )
}
