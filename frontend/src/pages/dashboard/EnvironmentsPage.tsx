import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Trash2, Edit, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { environmentsApi, projectsApi } from '@/lib/api'
import { toCamelCase } from '@/lib/string-utils'
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
import { Label } from '@/components/ui/label'

interface Environment {
  id: number
  name: string
  key: string
  createdAt: string
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newEnvironment, setNewEnvironment] = useState({
    name: '',
    key: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = await projectsApi.getAll()
        if (projects.length > 0) {
          const firstProjectId = projects[0].id
          setProjectId(firstProjectId)
          const envs = await environmentsApi.getByProject(firstProjectId)
          setEnvironments(envs)
        }
      } catch (error) {
        console.error('Failed to fetch environments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateEnvironment = async () => {
    if (!newEnvironment.name || !newEnvironment.key || !projectId) return

    setIsCreating(true)
    try {
      await environmentsApi.create(projectId, {
        name: newEnvironment.name,
        key: newEnvironment.key,
      })

      setIsCreateDialogOpen(false)
      setNewEnvironment({ name: '', key: '' })

      // Refresh environments
      const envs = await environmentsApi.getByProject(projectId)
      setEnvironments(envs)
    } catch (error) {
      console.error('Failed to create environment:', error)
      alert('Failed to create environment. Key might already exist.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleNameChange = (name: string) => {
    setNewEnvironment({
      name,
      key: toCamelCase(name),
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Environments</h1>
            <p className="text-muted-foreground mt-1">
              Manage deployment environments for your feature flags
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Environment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Environment</DialogTitle>
                <DialogDescription>
                  Add a new environment to manage feature flag states
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Environment Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Development, Testing, Staging, Production"
                    value={newEnvironment.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">Environment Key</Label>
                  <Input
                    id="key"
                    placeholder="environment-key"
                    value={newEnvironment.key}
                    onChange={(e) =>
                      setNewEnvironment({ ...newEnvironment, key: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from name, but you can customize it
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEnvironment}
                  disabled={!newEnvironment.name || !newEnvironment.key || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Environment'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Environments Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : environments.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Environments</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Create your first environment to start managing feature flags across different
              deployment stages.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Environment
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Environment Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {environments.map((env) => (
                  <TableRow key={env.id}>
                    <TableCell className="font-medium">{env.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {env.key}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={env.key === 'production' ? 'default' : 'secondary'}
                        className={
                          env.key === 'production'
                            ? 'bg-green-500 hover:bg-green-600'
                            : ''
                        }
                      >
                        {env.key === 'production' ? 'Live' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">About Environments</h3>
          <p className="text-sm text-muted-foreground">
            Environments allow you to manage feature flags across different deployment stages.
            Each environment can have different flag states, enabling you to test features
            before releasing them to production. Enter any name you want - common examples
            include Development, Testing, Staging, and Production.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
