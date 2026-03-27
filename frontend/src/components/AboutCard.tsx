import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function AboutCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
