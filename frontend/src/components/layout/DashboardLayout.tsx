import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  LogOut,
  Folder,
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
import { projectsApi, environmentsApi } from '@/lib/api'
import { LanguageSelector } from '@/components/LanguageSelector'

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
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [environments, setEnvironments] = useState<any[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll()
        setProjects(data)
        if (data.length > 0) {
          setSelectedProject(data[0])
          // Fetch environments for first project
          const envs = await environmentsApi.getByProject(data[0].id)
          setEnvironments(envs)
          if (envs.length > 0) {
            setSelectedEnvironment(envs[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleProjectChange = async (project: any) => {
    setSelectedProject(project)
    try {
      const envs = await environmentsApi.getByProject(project.id)
      setEnvironments(envs)
      if (envs.length > 0) {
        setSelectedEnvironment(envs[0])
      }
    } catch (error) {
      console.error('Failed to fetch environments:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { icon: <Flag className="h-4 w-4" />, label: t('nav.featureFlags'), href: '/dashboard/flags' },
    { icon: <Folder className="h-4 w-4" />, label: t('nav.projects'), href: '/dashboard/projects' },
    { icon: <Users className="h-4 w-4" />, label: t('nav.segments'), href: '/dashboard/segments' },
    {
      icon: <Layers className="h-4 w-4" />,
      label: t('nav.environments'),
      href: '/dashboard/environments',
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: t('nav.auditLog'),
      href: '/dashboard/audit-log',
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: t('nav.settings'),
      href: '/dashboard/settings',
    },
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
                {t('common.usage')}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{t('common.flags')}</span>
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
            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 font-semibold">
                  {loading
                    ? t('common.loading')
                    : selectedProject?.name || t('common.selectProject')}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t('common.switchProject')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleProjectChange(project)}
                    className={selectedProject?.id === project.id ? 'bg-accent' : ''}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
                {projects.length === 0 && !loading && (
                  <DropdownMenuItem disabled>{t('common.noProjects')}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* Environment Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  {loading
                    ? t('common.loading')
                    : selectedEnvironment?.name || t('common.noEnvironments')}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{t('common.switchEnvironment')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {environments.map((env) => (
                  <DropdownMenuItem
                    key={env.id}
                    onClick={() => setSelectedEnvironment(env)}
                    className={selectedEnvironment?.id === env.id ? 'bg-accent' : ''}
                  >
                    <span className={env.key === 'production' ? 'flex items-center gap-2' : ''}>
                      {env.key === 'production' && (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {env.name}
                    </span>
                  </DropdownMenuItem>
                ))}
                {environments.length === 0 && !loading && (
                  <DropdownMenuItem disabled>{t('common.noEnvironments')}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder={t('common.search')}
                className="w-[200px] pl-8 lg:w-[300px]"
              />
            </div>

            <ModeToggle />

            <LanguageSelector />

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
                <DropdownMenuLabel>{t('auth.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('auth.profile')}</DropdownMenuItem>
                <DropdownMenuItem>{t('auth.apiKeys')}</DropdownMenuItem>
                <DropdownMenuItem>{t('auth.teams')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('common.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
