import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2, Check } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  isSuccess?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, isSuccess, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || isSuccess || disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-accent-foreground hover:bg-accent/90": variant === "default" && !isSuccess,
            "bg-green-500 text-white hover:bg-green-600": variant === "default" && isSuccess,
            "border border-border bg-background hover:bg-muted hover:text-foreground": variant === "outline" && !isSuccess,
            "border border-green-500 text-green-500 bg-green-500/10": variant === "outline" && isSuccess,
            "hover:bg-muted hover:text-foreground": variant === "ghost" && !isSuccess,
            "text-green-500": variant === "ghost" && isSuccess,
            "text-foreground underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-14 rounded-md px-8 text-lg": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {isSuccess && <Check className="mr-2 h-5 w-5" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
