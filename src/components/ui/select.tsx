import { SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-black dark:text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`
              w-full px-4 py-2.5 text-sm border rounded-lg bg-background text-foreground
              appearance-none cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
              disabled:bg-muted disabled:cursor-not-allowed
              pr-10
              ${error ? "border-destructive bg-destructive/10" : "border-input hover:border-input/70"}
              ${className}
            `}
            {...props}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-gray-700">{helperText}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = forwardRef<HTMLButtonElement, any>(({ className = "", children, ...props }, ref) => (
  <button
    ref={ref}
    className={`flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg bg-background border-input hover:bg-accent transition-colors ${className}`}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 ml-2" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder = "Select..." }: { placeholder?: string }) => <span>{placeholder}</span>

const SelectContent = forwardRef<HTMLDivElement, any>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`absolute top-full left-0 w-full mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-auto ${className}`}
    {...props}
  >
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = ({ value, children, ...props }: any) => (
  <div className="px-4 py-2.5 hover:bg-accent cursor-pointer text-sm" {...props}>
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
