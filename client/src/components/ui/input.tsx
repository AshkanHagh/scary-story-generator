import { cva, VariantProps } from "class-variance-authority"
import { InputHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "",
        underline: "border-0 border-b border-input rounded-none",
        ghost: "border-0 bg-transparent",
        outline: "border border-foreground/40 bg-transparent"
      },
      size: {
        sm: "h-8 text-xs px-2",
        default: "h-9 text-sm",
        lg: "h-10 text-base px-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    label?: string
  }

const Input = ({
  className,
  variant,
  size,
  id,
  label,
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-sans text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        className={twMerge(inputVariants({ variant, size, className }))}
        {...props}
      />
    </div>
  )
}

export default Input
