import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Trash2, Edit, Loader2, ShieldAlert } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useProjectStore } from '@/store/projectStore'
import { toCamelCase } from '@/lib/string-utils'
import { DEFAULT_ENVIRONMENT_KEYS } from '@/types'
import type { Environment } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const isDefaultEnvironment = (key: string) =>
  DEFAULT_ENVIRONMENT_KEYS.includes(key as (typeof DEFAULT_ENVIRONMENT_KEYS)[number])

export default function EnvironmentsPage() {
  const { t } = useTranslation()
  const {
    environments,
    loading,
    selectedProject,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useProjectStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newEnvironment, setNewEnvironment] = useState({
    name: '',
    key: '',
    requireConfirmation: false,
  })
  const [envToDelete, setEnvToDelete] = useState<Environment | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [envToEdit, setEnvToEdit] = useState<Environment | null>(null)
  const [editForm, setEditForm] = useState({ name: '', key: '', requireConfirmation: false })
  const [isEditing, setIsEditing] = useState(false)

  const handleCreateEnvironment = async () => {
    if (!newEnvironment.name || !newEnvironment.key || !selectedProject) return

    setIsCreating(true)
    try {
      await createEnvironment(selectedProject.id, {
        name: newEnvironment.name,
        key: newEnvironment.key,
        requireConfirmation: newEnvironment.requireConfirmation,
      })

      setIsCreateDialogOpen(false)
      setNewEnvironment({ name: '', key: '', requireConfirmation: false })
    } catch (error) {
      console.error('Failed to create environment:', error)
      alert('Failed to create environment. Key might already exist.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditEnvironment = async () => {
    if (!envToEdit || !editForm.name || !editForm.key) return

    setIsEditing(true)
    try {
      await updateEnvironment(envToEdit.id, {
        name: editForm.name,
        key: editForm.key,
        requireConfirmation: editForm.requireConfirmation,
      })
      setEnvToEdit(null)
      setEditForm({ name: '', key: '', requireConfirmation: false })
    } catch (error) {
      console.error('Failed to update environment:', error)
      alert('Failed to update environment. Key might already exist.')
    } finally {
      setIsEditing(false)
    }
  }

  const openEditDialog = (env: Environment) => {
    setEnvToEdit(env)
    setEditForm({ name: env.name, key: env.key, requireConfirmation: env.requireConfirmation })
  }

  const confirmDeleteEnvironment = async () => {
    if (!envToDelete || isDefaultEnvironment(envToDelete.key)) return

    try {
      await deleteEnvironment(envToDelete.id)
      setEnvToDelete(null)
      setDeleteConfirmation('')
    } catch (error) {
      console.error('Failed to delete environment:', error)
      alert('Failed to delete environment.')
    }
  }

  const handleNameChange = (name: string) => {
    setNewEnvironment({
      ...newEnvironment,
      name,
      key: toCamelCase(name),
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('environments.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('environments.subtitle')}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t('environments.newEnvironment')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('environments.createEnvironment')}</DialogTitle>
                <DialogDescription>{t('environments.createDesc')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('environments.environmentName')}</Label>
                  <Input
                    id="name"
                    placeholder={t('environments.namePlaceholder')}
                    value={newEnvironment.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">{t('environments.environmentKey')}</Label>
                  <Input
                    id="key"
                    value={newEnvironment.key}
                    disabled
                  />
                  <p className="text-muted-foreground text-xs">{t('environments.keyAutoGenerated')}</p>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="requireConfirmation" 
                    checked={newEnvironment.requireConfirmation}
                    onCheckedChange={(checked) => setNewEnvironment({ ...newEnvironment, requireConfirmation: !!checked })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="requireConfirmation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('environments.requireConfirmation')}
                    </label>
                    <p className="text-muted-foreground text-xs">
                      {t('environments.requireConfirmationDesc')}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleCreateEnvironment}
                  disabled={!newEnvironment.name || !newEnvironment.key || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.creating')}
                    </>
                  ) : (
                    t('environments.createEnvironment')
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-muted-foreground py-12 text-center">{t('common.loading')}</div>
        ) : environments.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <Layers className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">{t('environments.noEnvironments')}</h3>
            <p className="text-muted-foreground mx-auto mb-4 max-w-md">
              {t('environments.noEnvironmentsDesc')}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('environments.createEnvironment')}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>{t('environments.name')}</TableHead>
                  <TableHead>{t('environments.key')}</TableHead>
                  <TableHead>{t('environments.status')}</TableHead>
                  <TableHead>{t('environments.requireConfirmation')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {environments.map((env) => (
                  <TableRow key={env.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {env.name}
                        {isDefaultEnvironment(env.key) && (
                          <Badge variant="outline" className="text-xs">
                            {t('environments.default')}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {env.key}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={env.key === 'production' ? 'default' : 'secondary'}
                        className={
                          env.key === 'production' ? 'bg-green-500 hover:bg-green-600' : ''
                        }
                      >
                        {env.key === 'production' ? t('common.live') : t('common.active')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {env.requireConfirmation ? (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10">
                          {t('common.active')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDefaultEnvironment(env.key)}
                          onClick={() => openEditDialog(env)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDefaultEnvironment(env.key)}
                          onClick={() => setEnvToDelete(env)}
                        >
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

        <div className="bg-muted/50 rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">{t('environments.infoTitle')}</h3>
          <p className="text-muted-foreground text-sm">{t('environments.infoDesc')}</p>
        </div>
      </div>

      <Dialog
        open={!!envToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setEnvToEdit(null)
            setEditForm({ name: '', key: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('environments.editEnvironment')}</DialogTitle>
            <DialogDescription>{t('environments.editDesc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t('environments.environmentName')}</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ name: e.target.value, key: toCamelCase(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-key">{t('environments.environmentKey')}</Label>
              <Input
                id="edit-key"
                value={editForm.key}
                disabled
              />
              <p className="text-muted-foreground text-xs">{t('environments.keyAutoGenerated')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnvToEdit(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleEditEnvironment}
              disabled={!editForm.name || !editForm.key || isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!envToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setEnvToDelete(null)
            setDeleteConfirmation('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('environments.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {envToDelete && isDefaultEnvironment(envToDelete.key) ? (
                <span className="flex items-center gap-2 text-amber-500">
                  <ShieldAlert className="h-4 w-4" />
                  {t('environments.deleteProtected')}
                </span>
              ) : (
                t('environments.deleteWarning')
              )}
            </AlertDialogDescription>
            {envToDelete && !isDefaultEnvironment(envToDelete.key) && (
              <div className="mt-4 w-full">
                <Label htmlFor="confirm-env-delete" className="mb-2 block">
                  <Trans
                    i18nKey="environments.deleteInstruction"
                    values={{ name: envToDelete.name }}
                    components={{ strong: <span className="font-mono font-bold" /> }}
                  />
                </Label>
                <Input
                  id="confirm-env-delete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={envToDelete.name}
                  className="w-full"
                />
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            {envToDelete && !isDefaultEnvironment(envToDelete.key) && (
              <AlertDialogAction
                variant="destructive"
                onClick={confirmDeleteEnvironment}
                disabled={deleteConfirmation !== envToDelete.name}
              >
                {t('environments.deleteAction')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
