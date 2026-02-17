import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import {
  Card, CardFooter, CardHeader, CardTitle, CardDescription,
  Badge,
} from "@node2flow/dashboard-core"

interface DashboardSectionCardsProps {
  plan: string
  dailyUsed: number
  dailyLimit: number
  connectedServices: number
  totalServices: number
  monthlyRequests: number
  successRate: number
  monthlyErrors: number
  resetAt: string
}

export function DashboardSectionCards({
  plan,
  dailyUsed,
  dailyLimit,
  connectedServices,
  totalServices,
  monthlyRequests,
  successRate,
  monthlyErrors,
  resetAt,
}: DashboardSectionCardsProps) {
  const dailyPercent = dailyLimit > 0 ? Math.round((dailyUsed / dailyLimit) * 100) : 0
  const servicePercent = totalServices > 0 ? Math.round((connectedServices / totalServices) * 100) : 0
  const isUnlimited = dailyLimit < 0

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {/* Current Plan */}
      <Card className="@container/card border-0">
        <CardHeader className="relative">
          <CardDescription>Current Plan</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums capitalize">
            {plan}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {isUnlimited ? "Unlimited" : `${dailyPercent}% used`}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isUnlimited ? "Unlimited daily requests" : `${dailyUsed.toLocaleString()} / ${dailyLimit.toLocaleString()} today`}
          </div>
          <div className="text-muted-foreground">
            Resets {resetAt ? new Date(resetAt).toLocaleDateString() : "tomorrow"}
          </div>
        </CardFooter>
      </Card>

      {/* Connected Services */}
      <Card className="@container/card border-0">
        <CardHeader className="relative">
          <CardDescription>Connected Services</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {connectedServices}/{totalServices}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {connectedServices > 0 ? (
                <><TrendingUpIcon className="size-3" />{servicePercent}%</>
              ) : (
                "No services"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {connectedServices > 0
              ? <>{connectedServices} active service{connectedServices > 1 ? "s" : ""} <TrendingUpIcon className="size-4" /></>
              : "Connect a service to get started"
            }
          </div>
          <div className="text-muted-foreground">
            {totalServices} services available
          </div>
        </CardFooter>
      </Card>

      {/* Monthly Requests */}
      <Card className="@container/card border-0">
        <CardHeader className="relative">
          <CardDescription>Monthly Requests</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {monthlyRequests.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {monthlyErrors > 0 ? (
                <><TrendingDownIcon className="size-3" />{monthlyErrors} errors</>
              ) : (
                <><TrendingUpIcon className="size-3" />No errors</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {monthlyRequests > 0
              ? <>{(monthlyRequests - monthlyErrors).toLocaleString()} successful <TrendingUpIcon className="size-4" /></>
              : "No requests this month"
            }
          </div>
          <div className="text-muted-foreground">
            {monthlyErrors > 0 ? `${monthlyErrors.toLocaleString()} failed` : "All requests succeeded"}
          </div>
        </CardFooter>
      </Card>

      {/* Success Rate */}
      <Card className="@container/card border-0">
        <CardHeader className="relative">
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {successRate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {successRate >= 95 ? (
                <><TrendingUpIcon className="size-3" />Excellent</>
              ) : successRate >= 80 ? (
                <><TrendingUpIcon className="size-3" />Good</>
              ) : (
                <><TrendingDownIcon className="size-3" />Needs attention</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {successRate >= 95
              ? <>Strong reliability <TrendingUpIcon className="size-4" /></>
              : <>Review error logs <TrendingDownIcon className="size-4" /></>
            }
          </div>
          <div className="text-muted-foreground">
            Based on this month's data
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
