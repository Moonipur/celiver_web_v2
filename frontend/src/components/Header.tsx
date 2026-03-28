import { useState } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { Menu, X, Bell, Search, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutUser } from '@/servers/user.functions'
import { useRouter } from '@tanstack/react-router'

const routeApi = getRouteApi('__root__')

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
]

const navLinksAdmin = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/report', label: 'Report' },
]

const navLinksClinAdmin = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/client-order', label: 'Order' },
  // { to: '/clinical-data', label: 'Clinical' },
  { to: '/about', label: 'About' },
]

const navLinksSuperAdmin = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/client-order', label: 'Order' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/report', label: 'Report' },
  // { to: '/clinical-data', label: 'Clinical' },
  { to: '/admin-management', label: 'Admin' },
]

interface NavLink {
  to: string
  label: string
}

export default function Header() {
  const router = useRouter()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { session } = routeApi.useLoaderData()
  const isAuthenticated = !!session?.session?.token

  const user = session?.user
  const navLink: NavLink[] =
    user?.role === 'client'
      ? navLinks
      : user?.role === 'admin'
        ? navLinksAdmin
        : user?.role === 'clinAdmin'
          ? navLinksClinAdmin
          : navLinksSuperAdmin

  const handleLogout = async () => {
    await logoutUser()

    localStorage.clear()
    sessionStorage.clear()

    await router.invalidate()
    await navigate({ to: '/login' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center justify-between gap-12">
          {/* --- Logo --- */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">CEliver</span>
          </Link>

          {/* --- Desktop Navigation --- */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLink.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeProps={{ className: 'text-primary font-semibold' }}
                  inactiveProps={{
                    className:
                      'text-muted-foreground hover:text-primary transition-colors',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : (
            <></>
          )}
        </div>

        {/* --- Right Side Actions --- */}
        <div className="flex items-center gap-3">
          {/* Search (Desktop only) */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {isAuthenticated ? (
            /* --- LOGGED IN STATE --- */
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>

              {/* --- DROPDOWN MENU START --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image || 'https://github.com/shadcn.png'}
                        alt={user?.name || 'user'}
                      />
                      <AvatarFallback>
                        {user?.name?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {/* Moon Sutthittha */}
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {/* moon@celiver.com */}
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Profile Link */}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout Button */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* --- DROPDOWN MENU END --- */}
            </div>
          ) : (
            /* --- LOGGED OUT STATE --- */
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Nav Links */}
            <div className="flex flex-col space-y-3">
              {navLink.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            <div className="border-t pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || 'https://github.com/shadcn.png'}
                      alt={user?.name || 'user'}
                    />
                    <AvatarFallback>
                      {user?.name?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>My Profile</span>
                </Link>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
