import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-background selection:bg-primary/10 flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="text-primary flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <Zap className="fill-primary h-6 w-6" />
            <span>ToggleFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        {/* Minimal Hero Section */}
        <section className="relative w-full overflow-hidden py-24 lg:py-32">
          {/* Background Gradients */}
          <div className="bg-background absolute top-0 -z-10 h-full w-full">
            <div className="bg-primary/5 absolute top-0 right-0 bottom-auto left-auto h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full opacity-50 blur-[80px]"></div>
            <div className="bg-primary/10 absolute top-auto right-auto bottom-0 left-0 h-[500px] w-[500px] -translate-x-[20%] -translate-y-[20%] rounded-full opacity-30 blur-[80px]"></div>
          </div>

          <div className="mx-auto max-w-4xl px-4 text-center sm:px-8">
            <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm font-medium">
              ToggleFlow Early Access
            </Badge>
            <h1 className="mx-auto text-5xl font-bold tracking-tight sm:text-7xl lg:leading-[1.1]">
              The simple way to <span className="text-primary italic">toggle</span> your features.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
              A minimalist feature flag platform for developers who want precision and speed without
              the complexity. Ship faster, control everything.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View Documentation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border/40 bg-muted/30 border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <Zap className="fill-primary h-5 w-5" />
              <span>ToggleFlow</span>
            </div>
            <p className="text-muted-foreground text-sm">© 2024 ToggleFlow Inc.</p>
            <div className="text-muted-foreground flex gap-6 text-sm">
              <a href="#" className="hover:text-primary underline-offset-4 hover:underline">
                Terms
              </a>
              <a href="#" className="hover:text-primary underline-offset-4 hover:underline">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
