import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn('relative inline-flex cursor-pointer items-center', className)}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div className="peer border-input bg-muted after:bg-foreground peer-checked:bg-primary peer-checked:after:bg-primary-foreground peer-focus:ring-ring h-5 w-9 border transition-all peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:after:w-4 after:transition-all peer-checked:after:translate-x-full disabled:cursor-not-allowed disabled:opacity-50" />
      </label>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
