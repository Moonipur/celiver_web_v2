import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import * as React from 'react'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Mail,
  Building2,
  Contact,
} from 'lucide-react'
import { authMiddleware } from '@/middlewares/auth.middleware'
export const Route = createFileRoute('/profile')({
  server: { middleware: [authMiddleware] },
  loader: ({ context }) => {
    return {
      session: context.session,
    }
  },
  component: ProfileComponent,
})

function ProfileComponent() {
  const router = useRouter()
  const navigate = useNavigate()
  const { session } = Route.useLoaderData()
  const [firstName, lastName] = session?.user.name.split(' ') ?? []

  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const values = Object.fromEntries(formData.entries())

    try {
      console.log(values)

      await router.invalidate()

      await navigate({ to: '/' })
    } catch (err) {
      console.error(err)
      setError('Failed to login. Please try again.')
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-primary" />
            Edit Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={firstName}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={lastName}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="text"
                  className="pl-9 pr-10"
                  placeholder={session?.user.email}
                  disabled
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  className="pl-9 pr-10"
                  placeholder={`${session?.org.name} (${session?.org.hCode})`}
                  disabled
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Contact className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="role"
                  name="role"
                  type="text"
                  className="pl-9 pr-10"
                  placeholder={`${session?.user.role}`}
                  disabled
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-9 pr-10"
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Minimum 8 characters recommended.
              </p>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <hr className="my-4" />

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button">
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
