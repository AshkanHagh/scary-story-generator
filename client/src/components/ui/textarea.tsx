import { cva, VariantProps } from "class-variance-authority"
import { TextareaHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
  {
    variants: {
      variant: {
        default: "",
        underline:
          "border-0 border-b border-input rounded-none focus-visible:ring-0 focus-visible:border-ring resize-none",
        ghost:
          "border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-ring resize-none",
        outline: "border border-foreground/40 bg-transparent"
      },
      size: {
        sm: "min-h-[80px] text-xs px-2 py-1",
        default: "min-h-[100px] text-sm px-3 py-2",
        lg: "min-h-[140px] text-base px-4 py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants> & {
    label?: string
  }

const Textarea = ({
  className,
  variant,
  size,
  id,
  label,
  ...props
}: TextareaProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="font-sans text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={twMerge(textareaVariants({ variant, size, className }))}
        {...props}
      />
    </div>
  )
}

export default Textarea
