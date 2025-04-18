"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, GitGraphIcon as GitIssue, GitCompare, HelpCircle } from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts"
import type { GitHubIssue } from "@/app/lib/definitions/pull-requests"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {BestPractices} from "@/app/ui/dashboard/alerts/best-practices";

interface PullRequestVsIssuesProps {
    prs: any[]
    issues: GitHubIssue[]
}

interface TimelineItem {
    date: string
    pullRequests: number
    issues: number
}

export default function PullRequestVsIssues({ prs, issues }: PullRequestVsIssuesProps) {
    // Process data to create timeline data points
    const timelineData = useMemo(() => {
        // Create a map to store data by date
        const dataByDate = new Map<string, { pullRequests: number; issues: number }>()

        // Get all unique dates from both PRs and issues
        const allDates = new Set<string>()

        // Process PRs
        prs.forEach((pr) => {
            // Assuming PR has a created_at field in ISO format
            const date = pr.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
            allDates.add(date)

            const existingData = dataByDate.get(date) || { pullRequests: 0, issues: 0 }
            dataByDate.set(date, {
                ...existingData,
                pullRequests: existingData.pullRequests + 1,
            })
        })

        // Process issues
        issues.forEach((issue) => {
            // Assuming issue has a createdAt field in ISO format
            const date = issue.createdAt?.toISOString().split("T")[0]
            if (date) {
                allDates.add(date)

                const existingData = dataByDate.get(date) || { pullRequests: 0, issues: 0 }
                dataByDate.set(date, {
                    ...existingData,
                    issues: existingData.issues + 1,
                })
            }
        })

        // Convert map to array and sort by date
        const sortedDates = Array.from(allDates).sort()
        const result: TimelineItem[] = sortedDates.map((date) => ({
            date,
            ...(dataByDate.get(date) || { pullRequests: 0, issues: 0 }),
        }))

        return result
    }, [prs, issues])

    // Calculate simple metrics
    const metrics = useMemo(() => {
        const totalPRs = prs.length
        const totalIssues = issues.length
        const prToIssueRatio = totalIssues > 0 ? (totalPRs / totalIssues).toFixed(2) : "0"

        return {
            totalPRs,
            totalIssues,
            prToIssueRatio,
        }
    }, [prs, issues])

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    // Get color indicator for PR-to-issue ratio
    const getRatioIndicator = () => {
        const ratio = Number.parseFloat(metrics.prToIssueRatio)
        if (ratio >= 0.8 && ratio <= 1.2) return "text-green-600"
        if ((ratio >= 0.5 && ratio < 0.8) || (ratio > 1.2 && ratio <= 1.5)) return "text-yellow-600"
        return "text-red-600"
    }

    // Custom tooltip component for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
                    <p className="font-medium">{formatDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    // Handle empty data case
    if (timelineData.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="h-[250px] flex items-center justify-center">
                        <p className="text-muted-foreground">No pull request or issue data available</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle>Pull Requests vs Issues</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[400px] overflow-hidden">
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={timelineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                minTickGap={30}
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis width={25} tick={{ fontSize: 12 }} tickMargin={10} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                            <Line
                                name="Pull Requests"
                                type="monotone"
                                dataKey="pullRequests"
                                stroke="#0088FE"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                name="Issues"
                                type="monotone"
                                dataKey="issues"
                                stroke="#00C49F"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <GitPullRequest className="h-3.5 w-3.5" />
                            <span>{metrics.totalPRs} total PRs</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <GitIssue className="h-3.5 w-3.5" />
                            <span>{metrics.totalIssues} total Issues</span>
                        </Badge>
                    </div>
                    <div className={"flex justify-end"}>
                        <Badge variant="outline" className={`flex items-center gap-1 ${getRatioIndicator()}`}>
                            <GitCompare className="h-3.5 w-3.5" />
                            <span>PR:Issue Ratio {metrics.prToIssueRatio}</span>
                        </Badge>
                    </div>

                </div>
                <div className={"mt-4"}>
                    <BestPractices title="Balance Planning and Implementation" icon="merge" variant="info">
                        <ul className="space-y-1 list-disc pl-5">
                            <li>A healthy PR:Issue ratio (0.8-1.2) indicates good balance between planning and implementation</li>
                            <li>Lower ratios may suggest incomplete work or abandoned issues</li>
                            <li>Higher ratios could indicate work being done without proper planning</li>
                        </ul>
                    </BestPractices>
                </div>
            </CardContent>
        </Card>
    )
}
