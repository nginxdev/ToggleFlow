import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  ChevronRight,
  Settings as SettingsIcon,
  Users,
  GitBranch,
  History,
  Activity,
  Plus,
  Trash2,
  Copy,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FlagDetailsPage() {
  const { t } = useTranslation()
  useParams()
  const [activeTab, setActiveTab] = useState('targeting')
  const [flagStatus, setFlagStatus] = useState(true)

  const tabs = [
    { id: 'targeting', label: t('flagDetails.tabs.targeting'), icon: <Users className="h-4 w-4" /> },
    { id: 'variations', label: t('flagDetails.tabs.variations'), icon: <GitBranch className="h-4 w-4" /> },
    { id: 'rules', label: t('flagDetails.tabs.rules'), icon: <Terminal className="h-4 w-4" /> },
    { id: 'history', label: t('flagDetails.tabs.history'), icon: <History className="h-4 w-4" /> },
    { id: 'settings', label: t('flagDetails.tabs.settings'), icon: <SettingsIcon className="h-4 w-4" /> },
  ]

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Link to="/dashboard/flags" className="hover:text-foreground transition-colors">
            {t('nav.featureFlags')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">new-pricing-page</span>
        </nav>

        {/* Header */}
        <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary hidden h-12 w-12 items-center justify-center sm:flex">
              <GitBranch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Pricing Page</h1>
              <div className="mt-1 flex items-center gap-2">
                <code className="text-muted-foreground bg-muted px-1.5 py-0.5 font-mono text-sm">
                  new-pricing-page
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Copy className="h-3 w-3" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-[10px] font-bold tracking-wider uppercase"
                >
                  Boolean
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted/50 border-border mr-4 flex items-center gap-2 border px-3 py-1.5">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {t('flagDetails.status')}
              </span>
              <Switch checked={flagStatus} onCheckedChange={setFlagStatus} />
              <span
                className={cn(
                  'text-sm font-medium',
                  flagStatus ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {flagStatus ? t('flagDetails.servingOn') : t('flagDetails.servingOff')}
              </span>
            </div>
            <Button variant="outline" size="sm">
              {t('flagDetails.discardChanges')}
            </Button>
            <Button size="sm" className="font-semibold">
              {t('flagDetails.saveChanges')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content */}
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
                    <span className="w-32 text-sm font-medium">{t('flagDetails.targeting.whenOn')}</span>
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
                    <span className="w-32 text-sm font-medium">{t('flagDetails.targeting.whenOff')}</span>
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('flagDetails.variations.addVariation')}
                </Button>
              </div>
              <div className="p-0">
                <div className="text-muted-foreground border-border bg-muted/30 grid grid-cols-12 gap-4 border-b p-4 text-xs font-semibold tracking-widest uppercase">
                  <div className="col-span-3">{t('flagDetails.variations.variationColumn')}</div>
                  <div className="col-span-7">{t('flagDetails.variations.descriptionColumn')}</div>
                  <div className="col-span-2 text-right">{t('common.actions')}</div>
                </div>
                <div className="divide-border divide-y">
                  <div className="grid grid-cols-12 items-center gap-4 p-4">
                    <div className="col-span-3">
                      <code className="text-primary font-mono text-[13px] font-bold">true</code>
                    </div>
                    <div className="col-span-7 text-sm">
                      Serves the new pricing layout to users.
                    </div>
                    <div className="col-span-2 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 items-center gap-4 p-4">
                    <div className="col-span-3">
                      <code className="text-muted-foreground font-mono text-[13px] font-bold">
                        false
                      </code>
                    </div>
                    <div className="text-muted-foreground col-span-7 text-sm">
                      Serves the legacy pricing layout.
                    </div>
                    <div className="col-span-2 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
