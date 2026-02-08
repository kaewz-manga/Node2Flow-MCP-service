/**
 * InputGroup components — adapted from shadcn/ui v4.
 * Provides input with icon addons, buttons, and text attachments.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Input } from "./input"
import { Button, type ButtonProps } from "./button"

// ============================================
// InputGroup — container with shared border
// ============================================

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full min-w-0 items-center rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      {...props}
    />
  )
}

// ============================================
// InputGroupAddon — icon/text attachment area
// ============================================

const inputGroupAddonVariants = cva(
  "flex cursor-text items-center justify-center select-none text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      align: {
        "inline-start": "order-first px-3",
        "inline-end": "order-last px-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

// ============================================
// InputGroupInput — borderless input inside group
// ============================================

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn("flex-1 border-0 shadow-none focus-visible:ring-0", className)}
      {...props}
    />
  )
}

// ============================================
// InputGroupButton — action button inside group
// ============================================

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: ButtonProps & { type?: "button" | "submit" | "reset" }) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      data-slot="input-group-button"
      className={cn("shadow-none shrink-0", className)}
      {...props}
    />
  )
}

// ============================================
// InputGroupText — static text inside group
// ============================================

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center text-sm text-muted-foreground [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
}
