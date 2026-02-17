import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { MoreVertical, Plus, Filter, ArrowUpDown, User as UserIcon, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FeatureFlag {
  id: string
  name: string
  key: string
  status: boolean
  tags: string[]
  updatedAt: string
  maintainer: string
  type: 'boolean' | 'string' | 'number' | 'json'
}

const mockFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'New Pricing Page',
    key: 'new-pricing-page',
    status: true,
    tags: ['marketing', 'frontend'],
    updatedAt: '2 hours ago',
    maintainer: 'Pradeep',
    type: 'boolean',
  },
  {
    id: '2',
    name: 'Beta Search Algorithm',
    key: 'beta-search-algo',
    status: false,
    tags: ['backend', 'performance'],
    updatedAt: '1 day ago',
    maintainer: 'John Doe',
    type: 'boolean',
  },
  {
    id: '3',
    name: 'Enable Chat Support',
    key: 'enable-chat-support',
    status: true,
    tags: ['support', 'v2'],
    updatedAt: '3 days ago',
    maintainer: 'Jane Smith',
    type: 'boolean',
  },
  {
    id: '4',
    name: 'API V3 Migration',
    key: 'api-v3-migration',
    status: true,
    tags: ['infrastructure'],
    updatedAt: '5 mins ago',
    maintainer: 'Pradeep',
    type: 'boolean',
  },
  {
    id: '5',
    name: 'Dark Mode Default',
    key: 'dark-mode-default',
    status: false,
    tags: ['ux', 'frontend'],
    updatedAt: '1 week ago',
    maintainer: 'Alice Wang',
    type: 'boolean',
  },
]

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags)

  const toggleFlag = (id: string) => {
    setFlags(flags.map((f) => (f.id === id ? { ...f, status: !f.status } : f)))
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
            <p className="text-muted-foreground mt-1">
              Manage and control feature rollouts across your environments.
            </p>
          </div>
          <Button className="h-10 gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Create Flag
          </Button>
        </div>

        {/* Filters/Actions Bar */}
        <div className="border-border bg-card flex flex-col gap-4 border p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <div className="bg-border mx-2 hidden h-4 w-[1px] sm:block" />
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
              <Badge variant="secondary" className="gap-1 px-2 py-1 font-normal">
                Maintainer: All
              </Badge>
              <Badge variant="secondary" className="gap-1 px-2 py-1 font-normal">
                Status: Active
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        </div>

        {/* Flags Table */}
        <div className="border-border bg-card overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Key</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Updated <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id} className="group">
                  <TableCell>
                    <Switch checked={flag.status} onCheckedChange={() => toggleFlag(flag.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        to={`/dashboard/flags/${flag.id}`}
                        className="text-foreground hover:text-primary cursor-pointer font-semibold transition-colors"
                      >
                        {flag.name}
                      </Link>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs md:hidden">
                        {flag.key}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="text-muted-foreground bg-muted px-1.5 py-0.5 font-mono text-[13px]">
                      {flag.key}
                    </code>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {flag.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                      {flag.tags.length === 0 && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Clock className="text-muted-foreground h-3 w-3" />
                        {flag.updatedAt}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                        <UserIcon className="h-3 w-3" />
                        by {flag.maintainer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Copy ID</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
