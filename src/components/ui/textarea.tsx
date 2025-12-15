import { TextareaHTMLAttributes, forwardRef } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-black dark:text-foreground mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 text-sm border rounded-lg bg-background text-foreground
            placeholder:text-gray-600 resize-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            ${error ? "border-destructive bg-destructive/10" : "border-input hover:border-input/70"}
            disabled:bg-muted disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-gray-700">{helperText}</p>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
