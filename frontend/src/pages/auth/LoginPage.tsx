import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Loader2 } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(t('auth.login.invalidCredentials'))
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-muted/30 selection:bg-primary/10 flex min-h-screen flex-col">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          className="text-primary flex items-center gap-2 text-2xl font-bold tracking-tighter"
        >
          <Zap className="fill-primary h-6 w-6" />
          <span>ToggleFlow</span>
        </Link>
        <ModeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-border/40 shadow-primary/5 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {t('auth.login.title')}
              </CardTitle>
              <CardDescription>{t('auth.login.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={handleSubmit} className="grid gap-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive border-destructive/20 border px-3 py-2 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('auth.login.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth.login.passwordLabel')}</Label>
                    <Link
                      to="/forgot-password"
                      className="text-primary text-sm underline-offset-4 hover:underline"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="mt-2 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.login.signingIn')}
                    </>
                  ) : (
                    t('auth.login.signInButton')
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-muted-foreground text-center text-sm">
                {t('auth.login.noAccount')}{' '}
                <Link
                  to="/signup"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  {t('auth.login.createAccount')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
