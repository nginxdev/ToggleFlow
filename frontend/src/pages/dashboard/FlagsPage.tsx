import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreVertical, Plus, Loader2, Flag } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useFlagStore } from '@/store/flagStore'
import { useProjectStore } from '@/store/projectStore'
import { toCamelCase } from '@/lib/string-utils'
import type { FeatureFlag } from '@/types'

export default function FlagsPage() {
  const { t } = useTranslation()
  const { selectedProject } = useProjectStore()
  const { flags, loading, fetchFlags, createFlag, toggleFlag, deleteFlag } = useFlagStore()

  const [togglingFlags, setTogglingFlags] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newFlag, setNewFlag] = useState({ name: '', key: '', description: '' })

  const [flagToDelete, setFlagToDelete] = useState<FeatureFlag | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (selectedProject) {
      fetchFlags(selectedProject.id)
    }
  }, [selectedProject, fetchFlags])

  const handleNameChange = (name: string) => {
    setNewFlag({ ...newFlag, name, key: toCamelCase(name) })
  }

  const handleCreateFlag = async () => {
    if (!newFlag.name || !newFlag.key || !selectedProject) return

    setIsCreating(true)
    try {
      await createFlag(selectedProject.id, {
        name: newFlag.name,
        key: newFlag.key,
        description: newFlag.description || undefined,
        type: 'boolean',
        defaultValue: 'false',
      })
      setIsCreateDialogOpen(false)
      setNewFlag({ name: '', key: '', description: '' })
    } catch (error) {
      console.error('Failed to create flag:', error)
      alert(t('flags.createError'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleFlag = async (flagId: string, environmentId: string, currentState: boolean) => {
    const toggleKey = `${flagId}-${environmentId}`
    setTogglingFlags((prev) => new Set(prev).add(toggleKey))

    try {
      await toggleFlag(flagId, environmentId, currentState)
    } finally {
      setTogglingFlags((prev) => {
        const newSet = new Set(prev)
        newSet.delete(toggleKey)
        return newSet
      })
    }
  }

  const confirmDeleteFlag = async () => {
    if (!flagToDelete) return

    try {
      await deleteFlag(flagToDelete.id)
      setFlagToDelete(null)
      setDeleteConfirmation('')
    } catch (error) {
      console.error('Failed to delete flag:', error)
    }
  }

  if (loading && !flags.length) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('flags.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('flags.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('flags.newFlag')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('flags.createFlag')}</DialogTitle>
                  <DialogDescription>{t('flags.createDesc')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="flag-name">{t('flags.flagName')}</Label>
                    <Input
                      id="flag-name"
                      placeholder={t('flags.namePlaceholder')}
                      value={newFlag.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="flag-key">{t('flags.flagKey')}</Label>
                    <Input id="flag-key" value={newFlag.key} disabled />
                    <p className="text-muted-foreground text-xs">
                      {t('flags.keyAutoGenerated')}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="flag-desc">{t('flags.description')}</Label>
                    <Input
                      id="flag-desc"
                      placeholder={t('flags.descriptionPlaceholder')}
                      value={newFlag.description}
                      onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateFlag}
                    disabled={!newFlag.name || !newFlag.key || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.creating')}
                      </>
                    ) : (
                      t('flags.createFlag')
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {flags.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <Flag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">{t('flags.noFlags')}</h3>
            <p className="text-muted-foreground mx-auto mb-4 max-w-md">{t('flags.noFlagsDesc')}</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('flags.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('flags.name')}</TableHead>
                  <TableHead>{t('flags.key')}</TableHead>
                  <TableHead>{t('flags.type')}</TableHead>
                  <TableHead>{t('flags.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => {
                  const productionState = flag.flagStates?.find(
                    (state) => state.environment.key === 'production',
                  )
                  const isEnabled = productionState?.isEnabled || false
                  const toggleKey = `${flag.id}-${productionState?.environmentId}`

                  return (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium">
                        <Link to={`/dashboard/flags/${flag.id}`} className="hover:underline">
                          {flag.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {flag.key}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{flag.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isEnabled}
                            disabled={togglingFlags.has(toggleKey)}
                            onCheckedChange={() =>
                              productionState &&
                              handleToggleFlag(flag.id, productionState.environmentId, isEnabled)
                            }
                          />
                          <span className="text-muted-foreground text-sm">
                            {isEnabled ? t('flags.enabled') : t('flags.disabled')}
                          </span>
                          {togglingFlags.has(toggleKey) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/flags/${flag.id}`}>
                                {t('common.viewDetails')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setFlagToDelete(flag)}
                            >
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">{t('flags.infoTitle')}</h3>
          <p className="text-muted-foreground text-sm">{t('flags.infoDesc')}</p>
        </div>
      </div>

      <AlertDialog
        open={!!flagToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setFlagToDelete(null)
            setDeleteConfirmation('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flags.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('flags.deleteWarning')}</AlertDialogDescription>
            {flagToDelete && (
              <div className="mt-4 w-full">
                <Label htmlFor="confirm-flag-delete" className="mb-2 block">
                  <Trans
                    i18nKey="flags.deleteInstruction"
                    values={{ name: flagToDelete.name }}
                    components={{ strong: <span className="font-mono font-bold" /> }}
                  />
                </Label>
                <Input
                  id="confirm-flag-delete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={flagToDelete.name}
                  className="w-full"
                />
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            {flagToDelete && (
              <AlertDialogAction
                variant="destructive"
                onClick={confirmDeleteFlag}
                disabled={deleteConfirmation !== flagToDelete.name}
              >
                {t('flags.deleteAction')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
