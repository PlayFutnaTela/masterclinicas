import { HTMLAttributes, forwardRef, ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange, ...props }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <div className="relative" {...props}>
      {/* Render children and pass open/setOpen via context-like pattern */}
      {children &&
        Array.isArray(children) &&
        children.map((child) => {
          if (child?.type?.displayName === "DropdownMenuTrigger") {
            return (
              <div key="trigger" onClick={() => setOpen(!open)}>
                {child}
              </div>
            )
          }
          if (child?.type?.displayName === "DropdownMenuContent") {
            return open ? child : null
          }
          return child
        })}
    </div>
  )
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, any>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && children) {
    return children
  }
  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center px-4 py-2 rounded-lg border", className)}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = forwardRef<HTMLDivElement, any>(
  ({ className, align = "start", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-2 min-w-56 rounded-lg border bg-background shadow-lg z-50",
        align === "end" && "right-0",
        align === "start" && "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 py-1.5 text-sm font-medium", className)} {...props} />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("my-1 h-px bg-muted", className)} {...props} />
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, any>(
  ({ className, checked, onCheckedChange, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <span className="h-2 w-2 rounded-sm bg-current" />}
      </span>
      {children}
    </div>
  )
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
}
