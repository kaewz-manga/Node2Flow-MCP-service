import * as React from "react"
import { cn } from "../../lib/utils"
import { Label } from "./label"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { optional?: boolean }
>(({ className, children, optional, ...props }, ref) => (
  <Label ref={ref} className={cn("text-sm font-medium", className)} {...props}>
    {children}
    {optional && (
      <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
    )}
  </Label>
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-destructive", className)}
    {...props}
  />
))
FieldError.displayName = "FieldError"

export { Field, FieldLabel, FieldDescription, FieldError }
