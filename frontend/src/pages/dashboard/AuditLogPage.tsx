import DashboardLayout from '@/components/layout/DashboardLayout'
import { Activity } from 'lucide-react'

export default function AuditLogPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
            <p className="text-muted-foreground mt-1">
              Track all changes and activities in your feature flag system
            </p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="border rounded-lg p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Audit Logging Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Track every change made to your feature flags, including who made the change,
            when it was made, and what was modified. View detailed activity logs across all
            environments.
          </p>
          <p className="text-sm text-muted-foreground">
            This feature is currently under development.
          </p>
        </div>

        {/* Info */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Planned Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Complete activity timeline for all flag changes</li>
            <li>Filter by user, environment, or action type</li>
            <li>Export audit logs for compliance</li>
            <li>Real-time activity notifications</li>
            <li>Rollback capabilities based on audit history</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
