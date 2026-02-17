import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Zap,
  Flag,
  Users,
  Layers,
  Activity,
  Settings,
  Search,
  ChevronDown,
  Bell,
  User,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/mode-toggle'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
      >
        {icon}
      </span>
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const navItems = [
    { icon: <Flag className="h-4 w-4" />, label: 'Feature Flags', href: '/dashboard/flags' },
    { icon: <Users className="h-4 w-4" />, label: 'Segments', href: '/dashboard/segments' },
    {
      icon: <Layers className="h-4 w-4" />,
      label: 'Environments',
      href: '/dashboard/environments',
    },
    { icon: <Activity className="h-4 w-4" />, label: 'Audit Log', href: '/dashboard/audit-log' },
    { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-border bg-card fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform lg:translate-x-0">
        <div className="border-border flex h-16 items-center border-b px-6">
          <Link
            to="/"
            className="text-primary flex items-center gap-2 text-xl font-bold tracking-tighter"
          >
            <Zap className="fill-primary h-5 w-5" />
            <span>ToggleFlow</span>
          </Link>
        </div>
        <div className="flex h-[calc(100vh-64px)] flex-col justify-between py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location.pathname === item.href}
              />
            ))}
          </nav>

          <div className="px-3 pb-4">
            <div className="bg-muted/50 rounded-none p-4">
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Usage
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Flags</span>
                  <span>12 / 50</span>
                </div>
                <div className="bg-border h-1.5 w-full">
                  <div className="bg-primary h-full" style={{ width: '24%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <header className="border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 font-semibold">
                  Default Project
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Default Project</DropdownMenuItem>
                <DropdownMenuItem>Mobile App</DropdownMenuItem>
                <DropdownMenuItem>Marketing Site</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-primary font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2 px-2 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Production
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search flags..."
                className="w-[200px] pl-8 lg:w-[300px]"
              />
            </div>

            <ModeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-border h-8 w-8 rounded-full border"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>API Keys</DropdownMenuItem>
                <DropdownMenuItem>Teams</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
