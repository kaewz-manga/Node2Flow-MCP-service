import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        default:
          "h-9 rounded-lg bg-muted p-1 justify-center",
        line: "h-auto w-full justify-start gap-4 border-b border-border bg-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        // Default variant styles
        "group-data-[variant=undefined]:rounded-md group-data-[variant=undefined]:px-3 group-data-[variant=undefined]:py-1",
        // Line variant styles
        "data-[state=active]:text-foreground",
        "[[data-variant=line]_&]:relative [[data-variant=line]_&]:rounded-none [[data-variant=line]_&]:bg-transparent [[data-variant=line]_&]:px-1 [[data-variant=line]_&]:pb-3 [[data-variant=line]_&]:pt-2 [[data-variant=line]_&]:after:absolute [[data-variant=line]_&]:after:inset-x-0 [[data-variant=line]_&]:after:bottom-0 [[data-variant=line]_&]:after:h-0.5 [[data-variant=line]_&]:data-[state=active]:after:bg-primary",
        // Default variant active
        "[[data-variant=default]_&]:rounded-md [[data-variant=default]_&]:px-3 [[data-variant=default]_&]:py-1 [[data-variant=default]_&]:data-[state=active]:bg-background [[data-variant=default]_&]:data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
