/**
 * Field components — adapted from shadcn/ui v4.
 * Provides structured form field layout with label, description, and error support.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Label } from "./label"

// ============================================
// FieldGroup — container for multiple fields
// ============================================

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-4", className)}
      {...props}
    />
  )
}

// ============================================
// Field — single form field wrapper
// ============================================

const fieldVariants = cva("group/field flex w-full", {
  variants: {
    orientation: {
      vertical: "flex-col space-y-2",
      horizontal: "flex-row items-center gap-4",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

// ============================================
// FieldContent — content area wrapper
// ============================================

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-1.5", className)}
      {...props}
    />
  )
}

// ============================================
// FieldLabel — label with optional badge
// ============================================

function FieldLabel({
  className,
  optional,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { optional?: boolean }) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-snug group-data-[invalid]/field:text-destructive",
        className
      )}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
      )}
    </Label>
  )
}

// ============================================
// FieldDescription — helper text below field
// ============================================

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-xs text-muted-foreground leading-normal group-data-[invalid]/field:text-destructive",
        "[&>a]:text-primary [&>a:hover]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

// ============================================
// FieldError — error message with array support
// ============================================

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = React.useMemo(() => {
    if (children) return children
    if (!errors?.length) return null

    const unique = [
      ...new Map(errors.map((e) => [e?.message, e])).values(),
    ]

    if (unique.length === 1) return unique[0]?.message

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {unique.map(
          (e, i) => e?.message && <li key={i}>{e.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-xs text-destructive font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldContent,
}
