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
            <p className="text-muted-foreground mt-1">
              {t('segments.subtitle')}
            </p>
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

        <div className="border rounded-lg p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('segments.comingSoon')}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t('segments.comingSoonDesc')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('segments.underDevelopment')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
