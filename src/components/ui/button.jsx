import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-[-0.01em] transition-all duration-200 ease-unibud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-[20px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "glass-strong text-foreground premium-shadow hover:shadow-hover hover:-translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground soft-shadow hover:bg-destructive/90 hover:elevated-shadow",
        outline:
          "border border-border/40 glass text-foreground soft-shadow hover:shadow-premium hover:border-border/60 hover:-translate-y-px",
        secondary:
          "glass text-foreground soft-shadow hover:shadow-premium hover:-translate-y-px",
        ghost: "hover:bg-accent/60 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-2.5",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-16 rounded-2xl px-8 text-[15px]",
        icon: "h-14 w-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }