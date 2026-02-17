import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  ChevronRight,
  Settings as SettingsIcon,
  Users,
  GitBranch,
  History,
  Activity,
  Plus,
  Copy,
  Check,
  Terminal,
  Loader2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlagStore } from '@/store/flagStore'

export default function FlagDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedFlag: flag, loading, fetchFlag, toggleFlag, updateFlag, deleteFlag } =
    useFlagStore()
  const [activeTab, setActiveTab] = useState('targeting')
  const [selectedEnvId, setSelectedEnvId] = useState<string>('')
  const [isToggling, setIsToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [originalForm, setOriginalForm] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (id) {
      fetchFlag(id)
    }
  }, [id, fetchFlag])

  useEffect(() => {
    if (flag && !selectedEnvId) {
      const project = flag.project
      if (project && project.environments && project.environments.length > 0) {
        setSelectedEnvId(project.environments[0].id)
      }
    }
  }, [flag, selectedEnvId])

  useEffect(() => {
    if (flag) {
      const formData = { name: flag.name, description: flag.description || '' }
      setEditForm(formData)
      setOriginalForm(formData)
    }
  }, [flag])

  const handleToggleStatus = async (checked: boolean) => {
    if (!selectedEnvId || !id) return

    setIsToggling(true)
    try {
      await toggleFlag(id, selectedEnvId, !checked)
    } catch (error) {
      console.error('Failed to update flag status:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleCopyKey = async () => {
    if (!flag) return
    await navigator.clipboard.writeText(flag.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveSettings = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await updateFlag(id, {
        name: editForm.name,
        description: editForm.description || undefined,
      })
      setOriginalForm({ ...editForm })
    } catch (error) {
      console.error('Failed to update flag:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFlag = async () => {
    if (!flag) return
    try {
      await deleteFlag(flag.id)
      navigate('/dashboard/flags')
    } catch (error) {
      console.error('Failed to delete flag:', error)
    }
  }

  const hasChanges =
    editForm.name !== originalForm.name || editForm.description !== originalForm.description

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!flag) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">{t('flagDetails.notFound')}</p>
        </div>
      </DashboardLayout>
    )
  }

  const currentFlagState = flag.flagStates?.find((s: any) => s.environmentId === selectedEnvId)
  const isEnabled = currentFlagState?.isEnabled || false

  const tabs = [
    {
      id: 'targeting',
      label: t('flagDetails.tabs.targeting'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'variations',
      label: t('flagDetails.tabs.variations'),
      icon: <GitBranch className="h-4 w-4" />,
    },
    { id: 'rules', label: t('flagDetails.tabs.rules'), icon: <Terminal className="h-4 w-4" /> },
    { id: 'history', label: t('flagDetails.tabs.history'), icon: <History className="h-4 w-4" /> },
    {
      id: 'settings',
      label: t('flagDetails.tabs.settings'),
      icon: <SettingsIcon className="h-4 w-4" />,
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Link to="/dashboard/flags" className="hover:text-foreground transition-colors">
            {t('nav.featureFlags')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{flag.name}</span>
        </nav>

        <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary hidden h-12 w-12 items-center justify-center sm:flex">
              <GitBranch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{flag.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <code className="text-muted-foreground bg-muted px-1.5 py-0.5 font-mono text-sm">
                  {flag.key}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-[10px] font-bold tracking-wider uppercase"
                >
                  {flag.type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('flagDetails.selectEnvironment')} />
              </SelectTrigger>
              <SelectContent>
                {flag.project?.environments?.map((env: any) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="bg-muted/50 border-border mr-4 flex items-center gap-2 border px-3 py-1.5">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {t('flagDetails.status')}
              </span>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleStatus}
                disabled={isToggling}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  isEnabled ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {isEnabled ? t('flagDetails.servingOn') : t('flagDetails.servingOff')}
              </span>
            </div>
          </div>
        </div>

        <div className="border-border no-scrollbar flex items-center gap-1 overflow-x-auto border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-2">
          {activeTab === 'targeting' && (
            <div className="grid gap-6">
              <section className="border-border bg-card border">
                <div className="border-border flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Users className="text-primary h-5 w-5" />
                    <h3 className="font-bold">{t('flagDetails.targeting.title')}</h3>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('flagDetails.targeting.addUsers')}
                  </Button>
                </div>
                <div className="bg-muted/20 p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t('flagDetails.targeting.noUsers')}
                  </p>
                </div>
              </section>

              <section className="border-border bg-card border">
                <div className="border-border flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="text-primary h-5 w-5" />
                    <h3 className="font-bold">{t('flagDetails.targeting.defaultRule')}</h3>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm font-medium">
                      {t('flagDetails.targeting.whenOn')}
                    </span>
                    <div className="flex flex-1 gap-2">
                      <Button
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary"
                      >
                        {t('flagDetails.targeting.serve')}
                      </Button>
                      <Button variant="ghost" className="flex-1 items-center justify-between px-4">
                        <span>true</span>
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm font-medium">
                      {t('flagDetails.targeting.whenOff')}
                    </span>
                    <div className="flex flex-1 gap-2">
                      <Button variant="secondary" disabled>
                        {t('flagDetails.targeting.serve')}
                      </Button>
                      <Button variant="ghost" className="flex-1 items-center justify-between px-4">
                        <span>false</span>
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'variations' && (
            <section className="border-border bg-card border">
              <div className="border-border flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <GitBranch className="text-primary h-5 w-5" />
                  <h3 className="font-bold">{t('flagDetails.variations.title')}</h3>
                </div>
              </div>
              <div className="p-0">
                <div className="text-muted-foreground border-border bg-muted/30 grid grid-cols-12 gap-4 border-b p-4 text-xs font-semibold tracking-widest uppercase">
                  <div className="col-span-3">{t('flagDetails.variations.variationColumn')}</div>
                  <div className="col-span-7">{t('flagDetails.variations.descriptionColumn')}</div>
                </div>
                <div className="divide-border divide-y">
                  {(flag.variations || []).map((variation: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 items-center gap-4 p-4">
                      <div className="col-span-3">
                        <code className="text-primary font-mono text-[13px] font-bold">
                          {JSON.stringify(variation.value)}
                        </code>
                      </div>
                      <div className="col-span-7 text-sm">
                        {variation.name || variation.description || '-'}
                      </div>
                    </div>
                  ))}
                  {(!flag.variations || flag.variations.length === 0) && (
                    <div className="text-muted-foreground p-4 text-center text-sm">
                      {t('flagDetails.variations.noVariations')}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <div className="grid gap-6">
              <section className="border-border bg-card border">
                <div className="border-border flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="text-primary h-5 w-5" />
                    <h3 className="font-bold">{t('flagDetails.settings.general')}</h3>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-flag-name">{t('flags.flagName')}</Label>
                    <Input
                      id="edit-flag-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-flag-key">{t('flags.flagKey')}</Label>
                    <Input id="edit-flag-key" value={flag.key} disabled />
                    <p className="text-muted-foreground text-xs">
                      {t('flagDetails.settings.keyReadOnly')}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-flag-desc">{t('flags.description')}</Label>
                    <Input
                      id="edit-flag-desc"
                      value={editForm.description}
                      placeholder={t('flags.descriptionPlaceholder')}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={!hasChanges || isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        t('common.save')
                      )}
                    </Button>
                  </div>
                </div>
              </section>

              <section className="border-destructive/20 bg-card border">
                <div className="border-destructive/20 flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Trash2 className="text-destructive h-5 w-5" />
                    <h3 className="text-destructive font-bold">
                      {t('flagDetails.settings.dangerZone')}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">{t('flagDetails.settings.deleteFlag')}</p>
                    <p className="text-muted-foreground text-sm">
                      {t('flagDetails.settings.deleteDesc')}
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false)
            setDeleteConfirmation('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flags.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('flags.deleteWarning')}</AlertDialogDescription>
            <div className="mt-4 w-full">
              <Label htmlFor="confirm-detail-delete" className="mb-2 block">
                <Trans
                  i18nKey="flags.deleteInstruction"
                  values={{ name: flag.name }}
                  components={{ strong: <span className="font-mono font-bold" /> }}
                />
              </Label>
              <Input
                id="confirm-detail-delete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={flag.name}
                className="w-full"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteFlag}
              disabled={deleteConfirmation !== flag.name}
            >
              {t('flags.deleteAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
