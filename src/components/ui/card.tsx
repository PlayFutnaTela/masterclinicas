// Componente Card reutilizável
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "bordered" | "elevated";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", variant = "default", children, ...props }, ref) => {
        const baseStyles = "rounded-xl";

        const variants = {
            default: "bg-card",
            bordered: "bg-card border border-border",
            elevated: "bg-card shadow-lg",
        };

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

// Card Header
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", children, ...props }, ref) => (
        <div ref={ref} className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    )
);
CardHeader.displayName = "CardHeader";

// Card Content
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", children, ...props }, ref) => (
        <div ref={ref} className={`px-6 pb-6 ${className}`} {...props}>
            {children}
        </div>
    )
);
CardContent.displayName = "CardContent";

// Card Title
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className = "", children, ...props }, ref) => (
        <h3 ref={ref} className={`text-lg font-semibold text-black dark:text-foreground ${className}`} {...props}>
            {children}
        </h3>
    )
);
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className = "", children, ...props }, ref) => (
        <p ref={ref} className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
            {children}
        </p>
    )
);
CardDescription.displayName = "CardDescription";

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
