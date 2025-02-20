"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PullRequestsOverviewTable from "@/app/ui/dashboard/pull_requests/pull-requests-overview-table"
import type { PullRequestData } from "@/app/lib/definitions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PullRequestOverviewTable from "@/app/ui/dashboard/pull_requests/pull-request-overview-table";

type DialogData = {
  title: string
  description: string
  data: any[]
}

export function PullRequestOverview({ data }: { data: PullRequestData }) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [dialogData, setDialogData] = useState<DialogData | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all")

  const prsByMemberData = useMemo(() => {
    const prData: { [key: string]: { [key: string]: number } } = {}
    Object.entries(data.prsByMember || {}).forEach(([name, { prs }]) => {
      prs.forEach((pr: any) => {
        const date = new Date(pr.created_at).toISOString().split("T")[0]
        if (!prData[date]) {
          prData[date] = {}
        }
        prData[date][name] = (prData[date][name] || 0) + 1
      })
    })

    return Object.entries(prData)
      .map(([date, members]) => ({
        date,
        ...members,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data.prsByMember])

  const members = useMemo(() => Object.keys(data.prsByMember || {}), [data.prsByMember])

  const milestones = useMemo(() => {
    const milestoneSet = new Set<string>()
    Object.values(data.prsByMember || {}).forEach(({ prs }) => {
      prs.forEach((pr: any) => {
        if (pr.milestone) {
          milestoneSet.add(pr.milestone)
        }
      })
    })
    return Array.from(milestoneSet)
  }, [data.prsByMember])

  const filteredData = useMemo(() => {
    let filteredPRData = prsByMemberData.map((item) => ({
      ...item,
      milestone:
        Object.values(data.prsByMember || {}).flatMap(
          ({ prs }) =>
            prs.find((pr: any) => new Date(pr.created_at).toISOString().split("T")[0] === item.date)?.milestone,
        )[0] || "Unknown",
    }))

    if (selectedMilestone !== "all") {
      filteredPRData = filteredPRData.filter((item) => {
        const itemDate = new Date(item.date)
        const relevantPRs = Object.values(data.prsByMember || {}).flatMap(({ prs }) =>
          prs.filter((pr: any) => pr.milestone === selectedMilestone && new Date(pr.created_at) <= itemDate),
        )
        return relevantPRs.length > 0
      })
    }
    console.log("filteredPRData: ", filteredPRData);
    return filteredPRData
  }, [prsByMemberData, selectedMilestone, data.prsByMember])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const openDialog = (title: string, description: string, tableData: any[]) => {
    const formattedData = tableData.map((pr) => ({
      number: pr.number,
      title: pr.title,
      user: pr.user,
      created_at: pr.created_at,
      closed_at: pr.closed_at || pr.merged_at,
      html_url: pr.html_url,
    }))
    setDialogData({ title, description, data: formattedData })
    setIsDialogOpen(true)
  }

  const handleFastMergedClick = () => {
    openDialog(
      "Fast-Merged Pull Requests",
      "Pull requests merged within 5 minutes of creation",
      data.fastMergedPRs || [],
    )
  };

  const toggleMember = (member: string) => {
    setSelectedMembers((prev) => (prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]))
  };

  if (!data || !data.totalPRs) {
    console.log("PullRequestOverview - No data or totalPRs is 0")
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Overview</CardTitle>
        <CardDescription>Summary of pull request activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPRs || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.openPRs || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50" onClick={handleFastMergedClick}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fast-Merged PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.fastMergedPRs?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Pull Requests by Group Member</h3>
            <div className="flex flex-wrap gap-4 mb-4">
              {members.map((member, index) => (
                <div key={member} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member}`}
                    checked={selectedMembers.includes(member)}
                    onCheckedChange={() => toggleMember(member)}
                  />
                  <Label
                    htmlFor={`member-${member}`}
                    className="text-sm font-medium"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {member}
                  </Label>
                </div>
              ))}
            </div>
            {milestones.length > 0 && (
              <div className="mb-4">
                <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Milestones</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone} value={milestone}>
                        {milestone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {selectedMilestone === "all" ? (
                  <>
                    {milestones.map((milestone, index) => (
                      <ReferenceArea
                        key={milestone}
                        y1={0}
                        y2="dataMax"
                        x1={filteredData.find((d) => d.milestone === milestone)?.date}
                        x2={filteredData.findLast((d) => d.milestone === milestone)?.date}
                        fill={`${COLORS[index % COLORS.length]}20`}
                        fillOpacity={0.3}
                      />
                    ))}
                    {members.map(
                      (member, index) =>
                        selectedMembers.includes(member) && (
                          <Line
                            key={member}
                            type="monotone"
                            dataKey={member}
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                          />
                        ),
                    )}
                  </>
                ) : (
                  members.map(
                    (member, index) =>
                      selectedMembers.includes(member) && (
                        <Line
                          key={member}
                          type="monotone"
                          dataKey={member}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ),
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader className={"h-fit"}>
              <DialogTitle className="text-2xl font-bold">{dialogData?.title}</DialogTitle>
              <DialogDescription>{dialogData?.description}</DialogDescription>
            </DialogHeader>
            <PullRequestOverviewTable data={dialogData?.data || []} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

