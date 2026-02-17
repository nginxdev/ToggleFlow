import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Plus, Users, Filter } from 'lucide-react'

export default function SegmentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Segments</h1>
            <p className="text-muted-foreground mt-1">
              Target specific user groups with feature flags
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              New Segment
            </Button>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="border rounded-lg p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">User Segments Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Create and manage user segments to target specific groups with your feature flags.
            Define segments based on user attributes, behavior, or custom rules.
          </p>
          <p className="text-sm text-muted-foreground">
            This feature is currently under development.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
