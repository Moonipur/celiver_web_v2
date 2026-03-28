import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Building2,
  Users,
  Trash2,
  Plus,
  Edit,
  DatabaseBackup,
  RefreshCcw,
} from 'lucide-react'

// Shadcn UI Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getSessionFn } from '@/servers/user.functions'
import {
  CreateOrg,
  DashboardAdmin,
  DeleteOrg,
  DeleteUser,
  UpdateOrg,
  UpdateUser,
} from '@/servers/admin.function'
import { Organization, User } from '@/servers/types'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin-management')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }

    if (
      session?.user.role === 'client' ||
      session?.user.role === 'admin' ||
      session?.user.role === 'clinAdmin'
    ) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  loader: async () => {
    return {
      matrix: await DashboardAdmin(),
    }
  },
  component: AdminDashboardComponent,
})

function AdminDashboardComponent() {
  const router = useRouter()
  const { matrix } = Route.useLoaderData()

  // Organization Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  // Updated initial state to use slug and biobank
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    biobank: '',
  })

  // User Dialog States
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const deleteUserMutation = useMutation({
    mutationFn: DeleteUser,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User deleted', { position: 'top-center' })
        router.invalidate()
      } else {
        toast.error('Fail to delete user!', { position: 'top-center' })
      }
    },
    onError: () =>
      toast.error('Something went wrong', { position: 'top-center' }),
  })

  const updateUserMutation = useMutation({
    mutationFn: UpdateUser,
    onSuccess: (res) => {
      if (res.success) {
        router.invalidate()
        setIsEditUserDialogOpen(false)
        setEditingUser(null)
        toast.success('User updated', { position: 'top-center' })
      } else {
        toast.error('Fail to edit user!', { position: 'top-center' })
      }
    },
    onError: () =>
      toast.error('Something went wrong', { position: 'top-center' }),
  })

  // --- Handlers for User Management ---
  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate({ data: userId })
  }

  const openEditUserDialog = (user: User) => {
    setEditingUser({ ...user })
    setIsEditUserDialogOpen(true)
  }

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        data: { ...editingUser },
      })
    }
  }

  const deleteOrgMutation = useMutation({
    mutationFn: DeleteOrg,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Organization deleted', { position: 'top-center' })

        router.invalidate()

        // 2. Close the dialog
        setIsAddDialogOpen(false)
        setNewOrg({ name: '', slug: '', biobank: '' })
      } else {
        toast.error('Fail to delete organization!', { position: 'top-center' })
      }
    },
    onError: () =>
      toast.error('Something went wrong', { position: 'top-center' }),
  })

  // --- Handlers for Organization Management ---
  const handleDeleteOrg = (orgId: string) => {
    deleteOrgMutation.mutate({ data: orgId })
  }

  const createOrgMutation = useMutation({
    mutationFn: CreateOrg,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Organization created', { position: 'top-center' })

        router.invalidate()

        // 2. Close the dialog
        setIsAddDialogOpen(false)
        setNewOrg({ name: '', slug: '', biobank: '' })
      } else {
        toast.error('Fail to create organization!', { position: 'top-center' })
      }
    },
    onError: () =>
      toast.error('Something went wrong', { position: 'top-center' }),
  })

  // --- Updated Handler ---
  const handleAddOrg = () => {
    // Basic validation
    if (!newOrg.name || !newOrg.slug) {
      return toast.error('Name and Slug are required', {
        position: 'top-center',
      })
    }

    createOrgMutation.mutate({
      data: { name: newOrg.name, slug: newOrg.slug, biobank: newOrg.biobank },
    })
  }

  const openEditDialog = (org: Organization) => {
    setEditingOrg({ ...org })
    setIsEditDialogOpen(true)
  }

  const updateOrgMutation = useMutation({
    mutationFn: UpdateOrg,
    onSuccess: (res) => {
      if (res.success) {
        // 1. Tell TanStack Router to re-run the loader
        router.invalidate()

        // 2. Clean up UI
        setIsEditDialogOpen(false)
        setEditingOrg(null)
        toast.success('Organization updated', { position: 'top-center' })
      } else {
        toast.error('Fail to edit organization!', { position: 'top-center' })
      }
    },
  })

  // --- Triggered by the "Save Changes" button ---
  const handleUpdateOrg = () => {
    if (editingOrg) {
      updateOrgMutation.mutate({ data: { ...editingOrg } })
    }
  }

  const roleLabels: Record<string, string> = {
    client: 'Client',
    admin: 'Admin',
    clinAdmin: 'Clinical Admin',
    superAdmin: 'Super Admin',
  }

  // --- 1. Handle Null/Empty State ---
  if (!matrix.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-6 bg-muted rounded-full">
          {/* Lucide icon for empty data */}
          <DatabaseBackup className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            No Data Available
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We couldn't retrieve the admin matrix. This might be due to a
            connection error or an empty database.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Retry
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create First Org
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button variant="outline">Download Report</Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Users
          </TabsTrigger>
          <TabsTrigger
            value="organizations"
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" /> Organizations
          </TabsTrigger>
        </TabsList>

        {/* --- USERS TAB --- */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View users, manage verification status, edit details, and
                  remove accounts.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {user.isVerified ? (
                          <Badge
                            variant="secondary"
                            className="border-green-400 text-green-600 w-20 justify-center"
                          >
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-destructive border-destructive/20 w-20 justify-center"
                          >
                            Unverified
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium text-muted-foreground">
                          {matrix.data.orgs.find(
                            (org) => org.id === user.organizationId,
                          )?.name || '-'}
                        </span>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditUserDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ORGANIZATIONS TAB --- */}
        <TabsContent value="organizations" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organization Directory</CardTitle>
                <CardDescription>
                  Manage active organizations, update details, and manage
                  directories.
                </CardDescription>
              </div>

              {/* ADD ORGANIZATION DIALOG */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Organization</DialogTitle>
                    <DialogDescription>
                      Create a new organization in the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="org-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="org-name"
                        value={newOrg.name}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, name: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>

                    {/* NEW SLUG FIELD */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="org-slug" className="text-right">
                        Slug
                      </Label>
                      <Input
                        id="org-slug"
                        value={newOrg.slug}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, slug: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="e.g. acme-corp"
                      />
                    </div>

                    {/* NEW BIOBANK FIELD */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="org-biobank" className="text-right">
                        Biobank
                      </Label>
                      <Input
                        id="org-biobank"
                        value={newOrg.biobank}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, biobank: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="e.g. Primary Biobank"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddOrg}>Save Organization</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Biobank</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.data.orgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-md">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        {org.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-md">
                          {org.slug}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {org.biobank}
                      </TableCell>
                      <TableCell>{org.members} users</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(org)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteOrg(org.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT USER DIALOG */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to {editingUser?.name}'s details here.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-user-name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Organization</Label>
                <Select
                  value={editingUser.organizationId}
                  onValueChange={(val) =>
                    setEditingUser({ ...editingUser, organizationId: val })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {matrix.data.orgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val) =>
                    setEditingUser({
                      ...editingUser,
                      role: val as
                        | 'client'
                        | 'admin'
                        | 'clinAdmin'
                        | 'superAdmin',
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="clinAdmin">Clinical Admin</SelectItem>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select
                  value={editingUser.isVerified ? 'verified' : 'unverified'}
                  onValueChange={(val) =>
                    setEditingUser({
                      ...editingUser,
                      isVerified: val === 'verified',
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT ORGANIZATION DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Make changes to {editingOrg?.name}'s details here.
            </DialogDescription>
          </DialogHeader>
          {editingOrg && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-org-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-org-name"
                  value={editingOrg.name}
                  onChange={(e) =>
                    setEditingOrg({ ...editingOrg, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* EDIT SLUG FIELD */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-org-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="edit-org-slug"
                  value={editingOrg.slug}
                  onChange={(e) =>
                    setEditingOrg({ ...editingOrg, slug: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* EDIT BIOBANK FIELD */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-org-biobank" className="text-right">
                  Biobank
                </Label>
                <Input
                  id="edit-org-biobank"
                  value={editingOrg.biobank}
                  onChange={(e) =>
                    setEditingOrg({ ...editingOrg, biobank: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateOrg}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
