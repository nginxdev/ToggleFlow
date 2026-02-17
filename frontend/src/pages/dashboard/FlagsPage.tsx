import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { MoreVertical, Plus, Filter, Loader2, Flag } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { flagsApi, projectsApi } from '@/lib/api'

interface FeatureFlag {
  id: number
  name: string
  key: string
  description?: string
  type: string
  defaultValue: string
  flagStates?: Array<{
    id: number
    isEnabled: boolean
    environmentId: number
    environment: {
      id: number
      name: string
      key: string
    }
  }>
}

export default function FlagsPage() {
  const { t } = useTranslation()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingFlags, setTogglingFlags] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects first
        const projects = await projectsApi.getAll()
        if (projects.length > 0) {
          const projectId = projects[0].id
          
          // Fetch flags for the first project
          const flagsData = await flagsApi.getByProject(projectId)
          setFlags(flagsData)
        }
      } catch (error) {
        console.error('Failed to fetch flags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleFlag = async (flagId: number, environmentId: number, currentState: boolean) => {
    const toggleKey = `${flagId}-${environmentId}`
    setTogglingFlags(prev => new Set(prev).add(toggleKey))

    try {
      await flagsApi.toggleFlagState(flagId, environmentId, !currentState)
      
      // Update local state
      setFlags(prevFlags =>
        prevFlags.map(flag =>
          flag.id === flagId
            ? {
                ...flag,
                flagStates: flag.flagStates?.map(state =>
                  state.environmentId === environmentId
                    ? { ...state, isEnabled: !currentState }
                    : state
                ),
              }
            : flag
        )
      )
    } catch (error) {
      console.error('Failed to toggle flag:', error)
    } finally {
      setTogglingFlags(prev => {
        const newSet = new Set(prev)
        newSet.delete(toggleKey)
        return newSet
      })
    }
  }

  const handleDeleteFlag = async (flagId: number) => {
    if (!confirm(t('flags.deleteConfirm'))) return

    try {
      await flagsApi.delete(flagId)
      setFlags(prevFlags => prevFlags.filter(flag => flag.id !== flagId))
    } catch (error) {
      console.error('Failed to delete flag:', error)
    }
  }

  if (loading && !flags.length) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('flags.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('flags.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {t('common.filter')}
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('flags.newFlag')}
            </Button>
          </div>
        </div>

        {/* Table */}
        {flags.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <Flag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('flags.noFlags')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {t('flags.noFlagsDesc')}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('flags.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('flags.name')}</TableHead>
                  <TableHead>{t('flags.key')}</TableHead>
                  <TableHead>{t('flags.type')}</TableHead>
                  <TableHead>{t('flags.status')}</TableHead>
                  <TableHead className="text-right">{t('flags.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => {
                  const productionState = flag.flagStates?.find(
                    state => state.environment.key === 'production'
                  )
                  const isEnabled = productionState?.isEnabled || false
                  const toggleKey = `${flag.id}-${productionState?.environmentId}`

                  return (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/dashboard/flags/${flag.id}`}
                          className="hover:underline"
                        >
                          {flag.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
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
                          <span className="text-sm text-muted-foreground">
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
                              <Link to={`/dashboard/flags/${flag.id}`}>{t('common.viewDetails')}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>{t('common.duplicate')}</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteFlag(flag.id)}
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

        {/* Info Card */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{t('flags.infoTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('flags.infoDesc')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
