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
import type { UsageMonthlyHistory, UsageDailyHistory } from "@/lib/platform-api"

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

interface ChartDataPoint {
  label: string
  requests: number
  errors: number
}

interface DashboardUsageChartProps {
  monthlyData: UsageMonthlyHistory[]
  dailyData: UsageDailyHistory[]
  connectionPeriod: 7 | 30 | 90 | 180
  onConnectionPeriodChange: (days: 7 | 30 | 90 | 180) => void
}

export function DashboardUsageChart({ monthlyData, dailyData, connectionPeriod, onConnectionPeriodChange }: DashboardUsageChartProps) {
  const chartData = React.useMemo((): ChartDataPoint[] => {
    if (connectionPeriod <= 30) {
      // Daily data for 7d/30d
      return dailyData.map((d) => ({
        label: d.date,
        requests: d.requests,
        errors: d.errors,
      }))
    }
    // Monthly data for 3m/6m
    const months = connectionPeriod <= 90 ? 3 : 6
    return monthlyData.slice(-months).map((d) => ({
      label: d.year_month,
      requests: d.requests,
      errors: d.errors,
    }))
  }, [monthlyData, dailyData, connectionPeriod])

  const isDaily = connectionPeriod <= 30
  const hasData = chartData.length > 0

  if (!hasData) {
    return (
      <Card>
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

  const periodLabel = connectionPeriod === 7 ? "7 days" : connectionPeriod === 30 ? "30 days" : connectionPeriod <= 90 ? "3 months" : "6 months"

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Usage History</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            {isDaily ? "Daily" : "Monthly"} requests for the last {periodLabel}
          </span>
          <span className="@[540px]/card:hidden">
            Last {periodLabel}
          </span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={connectionPeriod.toString()}
            onValueChange={(v) => v && onConnectionPeriodChange(parseInt(v) as 7 | 30 | 90 | 180)}
            variant="outline"
            className="@[540px]/card:flex hidden"
          >
            <ToggleGroupItem value="7" className="h-8 px-2.5">
              7 days
            </ToggleGroupItem>
            <ToggleGroupItem value="30" className="h-8 px-2.5">
              30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="90" className="h-8 px-2.5">
              3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="180" className="h-8 px-2.5">
              6 months
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={connectionPeriod.toString()} onValueChange={(v) => onConnectionPeriodChange(parseInt(v) as 7 | 30 | 90 | 180)}>
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
              <SelectItem value="30" className="rounded-lg">
                30 days
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
          <AreaChart data={chartData}>
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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                if (isDaily) {
                  // "2026-02-18" → "Feb 18"
                  const d = new Date(value + "T00:00:00")
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                // "2026-02" → "Feb '26"
                const [year, month] = value.split("-")
                const d = new Date(parseInt(year), parseInt(month) - 1)
                return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (isDaily) {
                      const d = new Date(value + "T00:00:00")
                      return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
                    }
                    const [year, month] = value.split("-")
                    const d = new Date(parseInt(year), parseInt(month) - 1)
                    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
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
