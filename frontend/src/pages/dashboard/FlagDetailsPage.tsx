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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlagStore } from '@/store/flagStore'
import { useSegmentStore } from '@/store/segmentStore'
import { DEFAULT_BOOLEAN_VARIATIONS } from '@/lib/constants'

export default function FlagDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedFlag: flag, loading, audits, fetchFlag, toggleFlag, updateFlag, updateFlagState, archiveFlag, unarchiveFlag, deleteFlag, fetchAudits } =
    useFlagStore()
  const { segments, fetchSegments } = useSegmentStore()
  const [activeTab, setActiveTab] = useState('targeting')
  const [selectedEnvId, setSelectedEnvId] = useState<string>('')
  const [isToggling, setIsToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [originalForm, setOriginalForm] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)

  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [showVariationDialog, setShowVariationDialog] = useState(false)
  const [editingVariation, setEditingVariation] = useState<{ id?: string, name: string, value: string, type?: string } | null>(null)
  
  // Local state for drafts
  const [draftVariations, setDraftVariations] = useState<any[]>([])
  const [draftRules, setDraftRules] = useState<any>({})
  const [isSavingVariations, setIsSavingVariations] = useState(false)
  const [isSavingRules, setIsSavingRules] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isSuperUser = currentUser.isSuperUser || currentUser.email === 'john.doe@toggleflow.com'

  useEffect(() => {
    if (id) {
      fetchFlag(id)
    }
  }, [id, fetchFlag])

  useEffect(() => {
    if (flag?.project?.id) {
      fetchSegments(flag.project.id)
    }
  }, [flag?.project?.id, fetchSegments])

  const handleAddSegmentTargeting = async (segmentId: string, variationId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting) currentRules.targeting = {}
    if (!currentRules.targeting.segments) currentRules.targeting.segments = []
    
    // Check if already exists
    if (currentRules.targeting.segments.some((s: any) => s.segmentId === segmentId)) return
    
    currentRules.targeting.segments.push({ segmentId, variationId })
    setDraftRules(currentRules)
  }

  const handleRemoveSegmentTargeting = async (segmentId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting?.segments) return
    
    currentRules.targeting.segments = currentRules.targeting.segments.filter((s: any) => s.segmentId !== segmentId)
    setDraftRules(currentRules)
  }

  const handleUpdateSegmentVariation = async (segmentId: string, variationId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting?.segments) return
    
    currentRules.targeting.segments = currentRules.targeting.segments.map((s: any) => 
      s.segmentId === segmentId ? { ...s, variationId } : s
    )
    setDraftRules(currentRules)
  }

  useEffect(() => {
    if (activeTab === 'history' && id) {
      fetchAudits(id)
    }
  }, [activeTab, id, fetchAudits])

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

  const currentFlagState = flag?.flagStates?.find((s: any) => s.environmentId === selectedEnvId)
  const isEnabled = currentFlagState?.isEnabled || false

  // Stabilize dependencies stringified
  const flagVariationsJson = JSON.stringify(flag?.variations || [])
  const flagRulesJson = JSON.stringify(currentFlagState?.rules || {})

  useEffect(() => {
    if (flag) {
      setDraftVariations(JSON.parse(flagVariationsJson))
    }
  }, [flagVariationsJson])

  useEffect(() => {
    if (currentFlagState) {
      setDraftRules(JSON.parse(flagRulesJson))
    }
  }, [flagRulesJson])

  const hasVariationChanges = flagVariationsJson !== JSON.stringify(draftVariations)
  const hasRuleChanges = flagRulesJson !== JSON.stringify(draftRules)

  const handleCancelVariations = () => {
    setDraftVariations(JSON.parse(flagVariationsJson))
  }

  const handleCancelRules = () => {
    setDraftRules(JSON.parse(flagRulesJson))
  }

  const handleSaveVariationsChanges = async () => {
    if (!id) return
    setIsSavingVariations(true)
    try {
      await updateFlag(id, { variations: draftVariations })
      // No need to setDraftVariations here as the useEffect will sync it when flag updates
    } catch (error) {
      console.error('Failed to update variations:', error)
    } finally {
      setIsSavingVariations(false)
    }
  }

  const handleSaveRulesChanges = async () => {
    if (!id || !selectedEnvId) return
    setIsSavingRules(true)
    try {
      await updateFlagState(id, selectedEnvId, { rules: draftRules })
    } catch (error) {
      console.error('Failed to update rules:', error)
    } finally {
      setIsSavingRules(false)
    }
  }

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

  const handleArchiveFlag = async () => {
    if (!flag) return
    try {
      await archiveFlag(flag.id)
      setShowArchiveDialog(false)
    } catch (error) {
      console.error('Failed to archive flag:', error)
    }
  }

  const handleRestoreFlag = async () => {
    if (!flag) return
    try {
      await unarchiveFlag(flag.id)
      setShowRestoreDialog(false)
    } catch (error) {
      console.error('Failed to restore flag:', error)
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

  const validateVariationValue = (value: string, type?: string) => {
    if (!type) return true
    try {
      switch (type) {
        case 'boolean':
          return value === 'true' || value === 'false'
        case 'number':
          return !isNaN(Number(value))
        case 'json':
          JSON.parse(value)
          return true
        case 'string':
        default:
          return true
      }
    } catch {
      return false
    }
  }

  const handleSaveVariation = async () => {
    if (!flag || !editingVariation) return
    
    let newVariations = [...(draftVariations || [])]
    if (editingVariation.id) {
      // Edit
      newVariations = newVariations.map(v => v.id === editingVariation.id ? { 
        ...v, 
        name: editingVariation.name, 
        value: editingVariation.value,
        type: editingVariation.type 
      } : v)
    } else {
      // Add
      newVariations.push({
        id: crypto.randomUUID(),
        name: editingVariation.name,
        value: editingVariation.value,
        type: editingVariation.type || 'string'
      })
    }
    
    if (!validateVariationValue(editingVariation.value, editingVariation.type || flag.type)) {
      alert(`Invalid value for type ${editingVariation.type || flag.type}`)
      return
    }
    
    setDraftVariations(newVariations)
    setShowVariationDialog(false)
    setEditingVariation(null)
  }



// ... (inside component)

  const handleDeleteVariation = async (variationId: string) => {
    if (!flag) return
    const variation = draftVariations?.find(v => v.id === variationId)
    
    // Only prevent deletion of default boolean variations defined in constants
    if (flag.type === 'boolean' && variation) {
      const isDefault = DEFAULT_BOOLEAN_VARIATIONS.some(
        (dv: { name: string; value: string }) => dv.name === variation.name && dv.value === variation.value
      )
      
      if (isDefault) {
        alert('Default boolean variations cannot be deleted')
        return
      }
    }
    
    const newVariations = (draftVariations || []).filter(v => v.id !== variationId)
    setDraftVariations(newVariations)
  }



  const handleUpdateDefaultVariation = async (variationId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || { targeting: {} }) }
    if (!currentRules.targeting) currentRules.targeting = {}
    currentRules.targeting.defaultVariationId = variationId
    
    setDraftRules(currentRules)
  }

  const handleUpdateOffVariation = async (variationId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || { targeting: {} }) }
    if (!currentRules.targeting) currentRules.targeting = {}
    currentRules.targeting.offVariationId = variationId
    
    setDraftRules(currentRules)
  }

  const handleAddRule = async () => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting) currentRules.targeting = {}
    if (!currentRules.targeting.rules) currentRules.targeting.rules = []
    
    currentRules.targeting.rules.push({
      id: crypto.randomUUID(),
      attribute: 'email',
      operator: 'endsWith',
      value: '@example.com',
      variationId: flag.variations?.[0]?.id || ''
    })
    
    setDraftRules(currentRules)
  }

  const handleUpdateRule = async (ruleId: string, updates: any) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting?.rules) return
    
    currentRules.targeting.rules = currentRules.targeting.rules.map((r: any) => 
      r.id === ruleId ? { ...r, ...updates } : r
    )
    
    setDraftRules(currentRules)
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!flag || !selectedEnvId) return
    
    let currentRules = { ...(draftRules || {}) }
    if (!currentRules.targeting?.rules) return
    
    currentRules.targeting.rules = currentRules.targeting.rules.filter((r: any) => r.id !== ruleId)
    
    setDraftRules(currentRules)
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
          {flag.isArchived && (
            <Badge variant="destructive" className="ml-2 uppercase tracking-widest text-[10px]">
              {t('flags.archivedTitle')}
            </Badge>
          )}
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
            <div className="bg-muted/30 border-border inline-flex items-center gap-3 rounded-none border px-4 py-1.5 transition-all hover:bg-muted/50">
              <span className="text-muted-foreground text-[10px] font-bold whitespace-nowrap tracking-widest uppercase">
                {t('flagDetails.status')}
              </span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggleStatus}
                  disabled={isToggling}
                />
                <span
                  className={cn(
                    'min-w-[40px] text-sm font-semibold transition-colors duration-200',
                    isEnabled ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {isEnabled ? t('flagDetails.servingOn') : t('flagDetails.servingOff')}
                </span>
              </div>
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
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <Users className="text-primary h-5 w-5" />
                    <h3 className="font-bold text-lg">{t('flagDetails.targeting.title')}</h3>
                  </div>
                  <div className="flex gap-2">
                    {hasRuleChanges && (
                      <Button
                        variant="ghost" 
                        onClick={handleCancelRules}
                        disabled={isSavingRules}
                      >
                        {t('common.cancel')}
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveRulesChanges} 
                      disabled={!hasRuleChanges || isSavingRules}
                      className="gap-2"
                    >
                      {isSavingRules ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {t('flagDetails.saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                

                <section className="border-border bg-card border rounded-lg overflow-hidden">
                <div className="border-border flex items-center justify-between border-b p-4 bg-muted/10">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('flagDetails.targeting.segmentTitle')}</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-background">
                        <Plus className="h-4 w-4" />
                        {t('flagDetails.targeting.addSegment')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {segments.map((segment) => (
                        <DropdownMenuItem 
                          key={segment.id}
                          onClick={() => handleAddSegmentTargeting(segment.id, flag.variations?.[0]?.id || '')}
                          disabled={draftRules?.targeting?.segments?.some((s: any) => s.segmentId === segment.id)}
                        >
                          {segment.name}
                        </DropdownMenuItem>
                      ))}
                      {segments.length === 0 && <DropdownMenuItem disabled>{t('flagDetails.targeting.noSegmentsAvailable')}</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <div className="divide-border divide-y">
                    {(draftRules?.targeting?.segments || []).map((segRule: any) => {
                      const segment = segments.find(s => s.id === segRule.segmentId)
                      return (
                        <div key={segRule.segmentId} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{segment?.name || t('flagDetails.targeting.unknownSegment')}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">serve</span>
                                <Select 
                                  value={segRule.variationId} 
                                  onValueChange={(val) => handleUpdateSegmentVariation(segRule.segmentId, val)}
                                >
                                  <SelectTrigger className="w-[180px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(flag.variations || []).map((v: any) => (
                                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveSegmentTargeting(segRule.segmentId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                    {(!draftRules?.targeting?.segments || draftRules?.targeting?.segments.length === 0) && (
                      <div className="bg-muted/10 p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                          {t('flagDetails.targeting.noSegmentsTargeted')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
                


              <section className="border-border bg-card border rounded-lg overflow-hidden">
                <div className="border-border flex items-center justify-between border-b p-4 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <Activity className="text-primary h-4 w-4" />
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('flagDetails.targeting.defaultRule')}</h3>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-4">
                    <span className="w-48 text-sm font-medium">
                      {t('flagDetails.targeting.whenOn')}
                    </span>
                    <div className="flex flex-1 items-center gap-3">
                      <span className="text-muted-foreground text-sm">{t('flagDetails.targeting.serve')}</span>
                      <Select 
                        value={draftRules?.targeting?.defaultVariationId || flag.variations?.[0]?.id || ''} 
                        onValueChange={handleUpdateDefaultVariation}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(flag.variations || []).map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.value})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-48 text-sm font-medium">
                      {t('flagDetails.targeting.whenOff')}
                    </span>
                    <div className="flex flex-1 items-center gap-3">
                      <span className="text-muted-foreground text-sm">{t('flagDetails.targeting.serve')}</span>
                      <Select 
                        value={draftRules?.targeting?.offVariationId || flag.variations?.find(v => v.value === flag.defaultValue)?.id || flag.variations?.[0]?.id || ''} 
                        onValueChange={handleUpdateOffVariation}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(flag.variations || []).map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.value})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'variations' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <GitBranch className="text-primary h-5 w-5" />
                    <h3 className="font-bold text-lg">{t('flagDetails.variations.title')}</h3>
                  </div>
                  <div className="flex gap-2">
                    {hasVariationChanges && (
                      <Button
                        variant="ghost"
                        onClick={handleCancelVariations}
                        disabled={isSavingVariations}
                      >
                        {t('common.cancel')}
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveVariationsChanges} 
                      disabled={!hasVariationChanges || isSavingVariations}
                      className="gap-2"
                    >
                      {isSavingVariations ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {t('flagDetails.saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
              </div>
              <section className="border-border bg-card border rounded-lg overflow-hidden">
                <div className="border-border flex items-center justify-between border-b p-4 bg-muted/10">
                   <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('flagDetails.variations.listTitle')}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 bg-background"
                      onClick={() => {
                        setEditingVariation({ name: '', value: '' })
                        setShowVariationDialog(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      {t('flagDetails.variations.addVariation')}
                    </Button>
                </div>
                <div>
                  <div className="text-muted-foreground border-border bg-muted/30 grid grid-cols-12 gap-4 border-b p-4 text-xs font-semibold tracking-widest uppercase">
                    <div className="col-span-3">{t('flagDetails.variations.nameColumn')}</div>
                    <div className="col-span-3">{t('flagDetails.variations.valueColumn')}</div>
                    <div className="col-span-5">{t('flagDetails.variations.descriptionColumn')}</div>
                    <div className="col-span-1"></div>
                  </div>
                  <div className="divide-border divide-y">
                    {(draftVariations || []).map((variation: any) => (
                      <div key={variation.id} className="grid grid-cols-12 items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="col-span-3 font-medium">
                          {variation.name}
                        </div>
                        <div className="col-span-3">
                          <code className="text-primary font-mono text-[13px] font-bold bg-primary/5 px-2 py-1 rounded">
                            {variation.value}
                          </code>
                        </div>
                        <div className="col-span-5 text-muted-foreground text-sm italic">
                          {variation.description || '-'}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingVariation({ 
                                id: variation.id, 
                                name: variation.name, 
                                value: variation.value,
                                type: variation.type || flag.type 
                              })
                              setShowVariationDialog(true)
                            }}
                          >
                            <SettingsIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            disabled={
                              flag.type === 'boolean' && 
                              DEFAULT_BOOLEAN_VARIATIONS.some(
                                (dv: { name: string; value: string }) => dv.name === variation.name && dv.value === variation.value
                              )
                            }
                            onClick={() => handleDeleteVariation(variation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!draftVariations || draftVariations.length === 0) && (
                      <div className="text-muted-foreground p-12 text-center text-sm">
                        <div className="mb-2 flex justify-center">
                          <GitBranch className="h-8 w-8 opacity-20" />
                        </div>
                        {t('flagDetails.variations.noVariations')}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Variation Dialog */}
              <AlertDialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {editingVariation?.id ? t('flagDetails.variations.editVariation') : t('flagDetails.variations.addVariation')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('flagDetails.variations.defineNameAndValue')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="var-name">{t('flagDetails.variations.nameColumn')}</Label>
                      <Input
                        id="var-name"
                        value={editingVariation?.name || ''}
                        onChange={(e) => setEditingVariation(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                        placeholder={t('flagDetails.variations.namePlaceholder')}
                      />
                    </div>
                    {!(flag.type === 'boolean' && (editingVariation?.value === 'true' || editingVariation?.value === 'false')) && (
                      <div className="grid gap-2">
                        <Label htmlFor="var-type">{t('flags.type')}</Label>
                        <Select 
                          value={editingVariation?.type || ''} 
                          onValueChange={(val) => setEditingVariation(prev => prev ? ({ ...prev, type: val }) : null)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('flagDetails.variations.typePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boolean">{t('flags.types.boolean')}</SelectItem>
                            <SelectItem value="string">{t('flags.types.string')}</SelectItem>
                            <SelectItem value="number">{t('flags.types.number')}</SelectItem>
                            <SelectItem value="json">{t('flags.types.json')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {(editingVariation?.type || (editingVariation?.id && flag.type)) && (
                      <div className="grid gap-2">
                        <Label htmlFor="var-value">{t('flagDetails.variations.valueColumn')} ({editingVariation?.type || flag.type})</Label>
                        {(editingVariation?.type || flag.type) === 'json' ? (
                          <textarea
                            id="var-value"
                            value={editingVariation?.value || ''}
                            onChange={(e) => setEditingVariation(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                            placeholder={t('flagDetails.variations.jsonPlaceholder')}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        ) : (
                          <Input
                            id="var-value"
                            value={editingVariation?.value || ''}
                            onChange={(e) => setEditingVariation(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                            placeholder={(editingVariation?.type || flag.type) === 'boolean' ? t('flagDetails.variations.booleanPlaceholder') : t('flagDetails.variations.valuePlaceholder')}
                          />
                        )}
                        {editingVariation?.value && !validateVariationValue(editingVariation.value, editingVariation?.type || flag.type) && (
                          <p className="text-xs text-destructive">
                            {t('flagDetails.variations.invalidValue', { type: editingVariation?.type || flag.type })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEditingVariation(null)}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleSaveVariation} 
                      disabled={!editingVariation?.name || !editingVariation?.value || !validateVariationValue(editingVariation.value, editingVariation?.type || flag.type)}
                    >
                      {t('common.save')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <Terminal className="text-primary h-5 w-5" />
                    <h3 className="font-bold text-lg">{t('flagDetails.tabs.rules')}</h3>
                  </div>
                  <div className="flex gap-2">
                    {hasRuleChanges && (
                      <Button
                        variant="ghost"
                        onClick={handleCancelRules}
                        disabled={isSavingRules}
                      >
                        {t('common.cancel')}
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveRulesChanges} 
                      disabled={!hasRuleChanges || isSavingRules}
                      className="gap-2"
                    >
                      {isSavingRules ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {t('flagDetails.saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
              </div>

              <section className="border-border bg-card border rounded-lg overflow-hidden">
                <div className="border-border flex items-center justify-between border-b p-4 bg-muted/10">
                   <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('flagDetails.targeting.customRulesTitle')}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 bg-background"
                      onClick={handleAddRule}
                    >
                      <Plus className="h-4 w-4" />
                      {t('flagDetails.targeting.addRule')}
                    </Button>
                </div>
                <div>
                  <div className="divide-border divide-y">
                    {(draftRules?.targeting?.rules || []).map((rule: any, idx: number) => (
                      <div key={rule.id} className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('flagDetails.targeting.ruleNumber', { number: idx + 1 })}</h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-3 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-widest">{t('flagDetails.targeting.attribute')}</Label>
                            <Input 
                              value={rule.attribute} 
                              onChange={(e) => handleUpdateRule(rule.id, { attribute: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="col-span-3 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-widest">{t('flagDetails.targeting.operator')}</Label>
                            <Select 
                              value={rule.operator} 
                              onValueChange={(val) => handleUpdateRule(rule.id, { operator: val })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">{t('flagDetails.targeting.operators.equals')}</SelectItem>
                                <SelectItem value="notEquals">{t('flagDetails.targeting.operators.notEquals')}</SelectItem>
                                <SelectItem value="contains">{t('flagDetails.targeting.operators.contains')}</SelectItem>
                                <SelectItem value="notContains">{t('flagDetails.targeting.operators.notContains')}</SelectItem>
                                <SelectItem value="startsWith">{t('flagDetails.targeting.operators.startsWith')}</SelectItem>
                                <SelectItem value="endsWith">{t('flagDetails.targeting.operators.endsWith')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-widest">{t('flagDetails.targeting.value')}</Label>
                            <Input 
                              value={rule.value} 
                              onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                              className="h-9"
                            />
                          </div>
                          <div className="col-span-3 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-widest">{t('flagDetails.targeting.serveVariation')}</Label>
                            <Select 
                              value={rule.variationId} 
                              onValueChange={(val) => handleUpdateRule(rule.id, { variationId: val })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(flag.variations || []).map((v: any) => (
                                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(draftRules?.targeting?.rules?.length === 0 || !draftRules?.targeting?.rules) && (
                      <div className="bg-muted/10 p-12 text-center">
                        <Terminal className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <h4 className="font-medium text-muted-foreground mb-1">{t('flagDetails.targeting.noCustomRules')}</h4>
                        <p className="text-muted-foreground text-sm">{t('flagDetails.targeting.customRulesDesc')}</p>
                        <Button variant="outline" className="mt-4 gap-2" onClick={handleAddRule}>
                          <Plus className="h-4 w-4" />
                          {t('flagDetails.targeting.addFirstRule')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">{t('flagDetails.tabs.history')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('flagDetails.history.description')}
                </p>
              </div>
              
              <div className="space-y-4">
                {audits.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center">
                    {t('flagDetails.history.noHistory')}
                  </div>
                ) : (
                  audits.map((audit) => (
                    <div key={audit.id} className="border-border flex gap-4 border-b pb-4">
                      <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <History className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {audit.action.replace('FLAG_', '')}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(audit.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {audit.action === 'FLAG_STATE_UPDATED' || audit.action === 'FLAG_TOGGLED' ? (
                            <span>
                              {t('flagDetails.history.updatedState')} 
                              <strong> {audit.payload.environment}</strong>
                            </span>
                          ) : (
                            <span>{t('flagDetails.history.actionBy')} {audit.userId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                    <Archive className="text-destructive h-5 w-5" />
                    <h3 className="text-destructive font-bold">
                      {t('flagDetails.settings.dangerZone')}
                    </h3>
                  </div>
                </div>
                
                {!flag.isArchived ? (
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <p className="font-medium">{t('flagDetails.settings.archiveFlag')}</p>
                      <p className="text-muted-foreground text-sm">
                        {t('flagDetails.settings.archiveDesc')}
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => setShowArchiveDialog(true)}>
                      <Archive className="mr-2 h-4 w-4" />
                      {t('flags.archiveAction')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-destructive/10">
                      <div>
                        <p className="font-medium">{t('flagDetails.settings.restoreFlag')}</p>
                        <p className="text-muted-foreground text-sm">
                          {t('flagDetails.settings.restoreDesc')}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setShowRestoreDialog(true)}>
                        <History className="mr-2 h-4 w-4" />
                        {t('flagDetails.settings.restoreFlag')}
                      </Button>
                    </div>
                    
                    {isSuperUser && (
                      <div className="flex items-center justify-between p-6">
                        <div>
                          <p className="font-medium text-destructive">{t('flagDetails.settings.deleteFlag')}</p>
                          <p className="text-muted-foreground text-sm">
                            {t('flagDetails.settings.deleteDesc')}
                          </p>
                        </div>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flags.archiveConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('flags.archiveWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleArchiveFlag}>
              {t('flags.archiveAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flagDetails.settings.restoreFlag')}</AlertDialogTitle>
            <AlertDialogDescription>{t('flagDetails.settings.restoreDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreFlag}>
              {t('flagDetails.settings.restoreFlag')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  values={{ key: flag.key }}
                  components={{ strong: <span className="font-mono font-bold" /> }}
                />
              </Label>
              <Input
                id="confirm-detail-delete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={flag.key}
                className="w-full"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteFlag}
              disabled={deleteConfirmation !== flag.key}
            >
              {t('flags.deleteAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
