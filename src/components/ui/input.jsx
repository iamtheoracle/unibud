import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md px-4 py-2.5 text-base transition-all duration-200 ease-unibud file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring/40 focus-visible:ring-1 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }