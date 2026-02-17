import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Activity } from 'lucide-react'

export default function AuditLogPage() {
  const { t } = useTranslation()
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('auditLog.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('auditLog.subtitle')}
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('auditLog.comingSoon')}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t('auditLog.comingSoonDesc')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('auditLog.underDevelopment')}
          </p>
        </div>

        {/* Info */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{t('auditLog.plannedFeatures')}</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t('auditLog.timeline')}</li>
            <li>{t('auditLog.filtering')}</li>
            <li>{t('auditLog.export')}</li>
            <li>{t('auditLog.notifications')}</li>
            <li>{t('auditLog.rollback')}</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
