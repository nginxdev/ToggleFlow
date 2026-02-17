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
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function LoginPage() {
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
              <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-primary text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full">Sign In</Button>
              <div className="text-muted-foreground text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
