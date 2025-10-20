"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import type { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/75",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-foreground/40 bg-transparent hover:bg-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-lg",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  HTMLMotionProps<"button"> & {
    withAnimation?: boolean
  }

const Button = ({
  className,
  variant,
  size,
  withAnimation = true,
  ...props
}: ButtonProps) => {
  return withAnimation ? (
    <motion.button
      className={buttonVariants({ variant, size, className })}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...props}
    />
  ) : (
    <button
      className={twMerge(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

Button.displayName = "Button"

export default Button
