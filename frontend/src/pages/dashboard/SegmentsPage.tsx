import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Plus, Users, Filter } from 'lucide-react'

export default function SegmentsPage() {
  const { t } = useTranslation()
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('segments.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('segments.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Filter className="mr-2 h-4 w-4" />
              {t('common.filter')}
            </Button>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              {t('segments.newSegment')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-12 text-center">
          <Users className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-lg font-semibold">{t('segments.comingSoon')}</h3>
          <p className="text-muted-foreground mx-auto mb-4 max-w-md">
            {t('segments.comingSoonDesc')}
          </p>
          <p className="text-muted-foreground text-sm">{t('segments.underDevelopment')}</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
