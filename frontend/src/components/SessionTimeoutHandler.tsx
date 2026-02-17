import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

export function SessionTimeoutHandler() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleSessionTimeout = () => {
      setIsOpen(true)
    }

    window.addEventListener('session-timeout', handleSessionTimeout)

    return () => {
      window.removeEventListener('session-timeout', handleSessionTimeout)
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Session Timed Out</DialogTitle>
          <DialogDescription>
            Your session has expired. Signing you out...
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
