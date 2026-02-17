import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Key, Bell, Shield, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUPPORTED_LANGUAGES } from '@/lib/constants'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    language: 'en',
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, language: i18n.language }))
  }, [i18n.language])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data)
          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          }))

          if (data.language && data.language !== i18n.language) {
            i18n.changeLanguage(data.language)
          }
        }
      } catch (error) {
        // quiet failure
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSaveProfile = async () => {
    setProfileLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          language: formData.language,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        if (formData.language !== i18n.language) {
          i18n.changeLanguage(formData.language)
        }
        // Ideally show success toast here
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      // enhanced error handling could go here
    } finally {
      setProfileLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex max-w-4xl flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>{t('settings.profile')}</CardTitle>
            </div>
            <CardDescription>{t('settings.profileDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">{t('settings.firstName')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t('settings.lastName')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  defaultValue={user?.email || ''}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>{t('settings.apiKeys')}</CardTitle>
            </div>
            <CardDescription>{t('settings.apiKeysDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('settings.apiKeysInfo')}</p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t('settings.notifications')}</CardTitle>
            </div>
            <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.emailNotifications')}</Label>
                <p className="text-muted-foreground text-sm">
                  {t('settings.emailNotificationsDesc')}
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.flagChangeAlerts')}</Label>
                <p className="text-muted-foreground text-sm">
                  {t('settings.flagChangeAlertsDesc')}
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.weeklyReports')}</Label>
                <p className="text-muted-foreground text-sm">{t('settings.weeklyReportsDesc')}</p>
              </div>
              <Switch disabled />
            </div>
            <p className="text-muted-foreground text-sm">{t('settings.notificationsComingSoon')}</p>
          </CardContent>
          <CardFooter>
            <Button disabled>{t('common.save')}</Button>
          </CardFooter>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('settings.security')}</CardTitle>
            </div>
            <CardDescription>{t('settings.securityDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('settings.securityInfo')}</p>
          </CardContent>
          <CardFooter>
            <Button disabled>{t('common.save')}</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
