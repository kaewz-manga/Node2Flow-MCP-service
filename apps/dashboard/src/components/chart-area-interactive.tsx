import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@node2flow/dashboard-core"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { UsageMonthlyHistory } from "@/lib/platform-api"

const chartConfig = {
  usage: {
    label: "Usage",
  },
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
  errors: {
    label: "Errors",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig

interface DashboardUsageChartProps {
  data: UsageMonthlyHistory[]
  connectionPeriod: 7 | 90 | 180
  onConnectionPeriodChange: (days: 7 | 90 | 180) => void
}

export function DashboardUsageChart({ data, connectionPeriod, onConnectionPeriodChange }: DashboardUsageChartProps) {
  const filteredData = React.useMemo(() => {
    const months = connectionPeriod <= 7 ? 3 : connectionPeriod <= 90 ? 3 : 6
    return data.slice(-months)
  }, [data, connectionPeriod])

  if (data.length === 0) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>No usage data yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          Start using MCP tools to see your usage history
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card border-0">
      <CardHeader className="relative">
        <CardTitle>Usage History</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Monthly requests for the last {connectionPeriod <= 7 ? "7 days" : connectionPeriod <= 90 ? "3 months" : "6 months"}
          </span>
          <span className="@[540px]/card:hidden">
            Last {connectionPeriod <= 7 ? "7 days" : connectionPeriod <= 90 ? "3 months" : "6 months"}
          </span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={connectionPeriod.toString()}
            onValueChange={(v) => v && onConnectionPeriodChange(parseInt(v) as 7 | 90 | 180)}
            variant="outline"
            className="@[540px]/card:flex hidden"
          >
            <ToggleGroupItem value="7" className="h-8 px-2.5">
              7 days
            </ToggleGroupItem>
            <ToggleGroupItem value="90" className="h-8 px-2.5">
              3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="180" className="h-8 px-2.5">
              6 months
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={connectionPeriod.toString()} onValueChange={(v) => onConnectionPeriodChange(parseInt(v) as 7 | 90 | 180)}>
            <SelectTrigger
              className="@[540px]/card:hidden flex w-40"
              aria-label="Select time range"
            >
              <SelectValue placeholder="7 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                7 days
              </SelectItem>
              <SelectItem value="90" className="rounded-lg">
                3 months
              </SelectItem>
              <SelectItem value="180" className="rounded-lg">
                6 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-requests)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-requests)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillErrors" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-errors)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-errors)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year_month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const [year, month] = value.split("-")
                const date = new Date(parseInt(year), parseInt(month) - 1)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const [year, month] = value.split("-")
                    const date = new Date(parseInt(year), parseInt(month) - 1)
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="errors"
              type="natural"
              fill="url(#fillErrors)"
              stroke="var(--color-errors)"
              stackId="a"
            />
            <Area
              dataKey="requests"
              type="natural"
              fill="url(#fillRequests)"
              stroke="var(--color-requests)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
