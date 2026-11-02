import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#121212] text-[#FAF9F6] hover:bg-black/85 shadow-none",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700",
        outline:
          "border border-zinc-300 bg-transparent text-[#121212] hover:bg-[#121212] hover:text-[#FAF9F6] hover:border-[#121212]",
        secondary:
          "bg-[#F4F3EE] text-[#121212] hover:bg-[#EAE7DF]",
        ghost: "hover:bg-zinc-100/80 text-[#121212]",
        link: "text-[#121212] underline-offset-4 hover:underline normal-case tracking-normal",
        luxury: "bg-[#121212] text-white hover:bg-[#262626] border border-black",
      },
      size: {
        default: "h-11 px-6 py-2.5 rounded-sm",
        sm: "h-9 px-4 text-[10px] rounded-sm",
        lg: "h-13 px-8 text-xs rounded-sm",
        pill: "h-11 px-7 rounded-full",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
