"use client"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CommitSizeTable from "@/app/ui/dashboard/commits/commit-size-table"
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices"
import { prepareCommitsData } from "@/app/lib/utils/commits-utils"
import { Separator } from "@/components/ui/separator"
import { GitCommit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CommitSize({ data }: { data: any[] }) {
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedFilesMonth, setSelectedFilesMonth] = useState<string>("all")
  const { processedData, months, uniqueDays, maxChanges, maxFileChanges } = useMemo(() => {
    return prepareCommitsData(data)
  }, [data])

  // Filter data by month for the first chart
  const filteredData = useMemo(() => {
    if (selectedMonth === "all") return processedData
    return processedData.filter((commit) => {
      const date = new Date(commit.committedDate)
      const commitMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      return commitMonth === selectedMonth
    })
  }, [processedData, selectedMonth])

  // Filter data by month for the second chart
  const filteredFilesData = useMemo(() => {
    if (selectedFilesMonth === "all") return processedData
    return processedData.filter((commit) => {
      const date = new Date(commit.committedDate)
      const commitMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      return commitMonth === selectedFilesMonth
    })
  }, [processedData, selectedFilesMonth])

  const handleCommitClick = (commit: any) => {
    setSelectedCommit(commit)
  }

  const closeDialog = () => {
    setSelectedCommit(null)
  }

  const totalChangesCommitCount = filteredData.length
  const changedFilesCommitCount = filteredFilesData.length

  return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Commit Size Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total Changes Chart */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Total Changes</h3>

                <Badge variant="outline" className="flex items-center gap-1">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span>{totalChangesCommitCount} commits</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {new Date(month).toLocaleString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ChartContainer
                config={{
                  totalChanges: {
                    label: "Total Changes",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[500px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  {uniqueDays.map((day) => (
                      <ReferenceLine
                          key={day}
                          x={day}
                          stroke="hsl(var(--border))"
                          strokeOpacity={1}
                          strokeDasharray="1 1"
                          ifOverflow="extendDomain"
                      />
                  ))}
                  <XAxis
                      dataKey="committedDate"
                      name="Date"
                      type="number"
                      scale="time"
                      domain={["dataMin - 86400000", "dataMax + 86400000"]}
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      allowDataOverflow
                      padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                      dataKey="totalChanges"
                      name="Total Changes"
                      type="number"
                      domain={[1, maxChanges]}
                      allowDataOverflow
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      label={{
                        value: "Total Changes",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                      scale="log"
                      padding={{ top: 20, bottom: 10 }}
                  />
                  <ZAxis dataKey="size" range={[20, 50]} />
                  <ChartTooltip
                      cursor={{ strokeDasharray: "1 1" }}
                      content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                              if (name === "Date") {
                                return [new Date(value).toLocaleString("en-US"), null]
                              }
                              return [`${value} `, name]
                            }}
                        />
                      }
                  />
                  <Scatter
                      name="Commits"
                      data={filteredData}
                      fill="var(--color-totalChanges)"
                      fillOpacity={1}
                      onClick={handleCommitClick}
                      x="committedDate"
                      y="totalChanges"
                      className={"cursor-pointer"}
                  />
                </ScatterChart>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Click on a point to view detailed commit information
                </div>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Separator between charts */}
          <Separator className="my-10" />

          {/* Changed Files Chart */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Changed Files</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span>{changedFilesCommitCount} commits</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedFilesMonth} onValueChange={setSelectedFilesMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {new Date(month).toLocaleString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ChartContainer
                config={{
                  changedFiles: {
                    label: "Changed Files",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[500px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  {uniqueDays.map((day) => (
                      <ReferenceLine
                          key={day}
                          x={day}
                          stroke="hsl(var(--border))"
                          strokeOpacity={1}
                          strokeDasharray="1 1"
                          ifOverflow="extendDomain"
                      />
                  ))}
                  <XAxis
                      dataKey="committedDate"
                      name="Date"
                      type="number"
                      scale="time"
                      domain={["dataMin - 86400000", "dataMax + 86400000"]}
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      allowDataOverflow
                      padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                      dataKey="changedFiles"
                      name="Changed Files"
                      type="number"
                      domain={[1, maxFileChanges]}
                      allowDataOverflow
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      label={{
                        value: "Changed Files",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                      scale="log"
                      padding={{ top: 20, bottom: 10 }}
                  />
                  <ZAxis dataKey="size" range={[20, 50]} />
                  <ChartTooltip
                      cursor={{ strokeDasharray: "1 1" }}
                      content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                              if (name === "Date") {
                                return [new Date(value).toLocaleString("en-US"), null]
                              }
                              return [`${value} `, name]
                            }}
                        />
                      }
                  />
                  <Scatter
                      name="Commits"
                      data={filteredFilesData}
                      fill="var(--color-changedFiles)"
                      fillOpacity={1}
                      onClick={handleCommitClick}
                      x="committedDate"
                      y="changedFiles"
                      className={"cursor-pointer"}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Click on a point to view detailed commit information
          </div>

          <div className={"mt-4"}>
            <BestPractices title={"Keep Commits Atomic"} icon={"check"} variant={"success"}>
              <ul className="space-y-1 list-disc pl-5">
                <li>Make each commit a single unit of work focused on one task or fix</li>
                <li>Atomic commits make code reviews faster and reverts easier</li>
                <li>Isolate changes by purpose: separate refactoring from feature additions</li>
                <li>Group commits by context rather than creating monolithic changes</li>
                <li>Atomic changes can be applied or reverted without unintended side effects</li>
                <li>The goal isn't to create hundreds of commits but to organize changes logically</li>
                <li>When fixing multiple issues, create separate commits for each fix</li>
              </ul>
            </BestPractices>
          </div>
        </CardContent>
        {/* Drill-down */}
        <Dialog open={Boolean(selectedCommit)} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader className={"h-fit"}>
              <DialogTitle>Commit Details</DialogTitle>
              <DialogDescription className="font-bold">Detailed information for the selected commit.</DialogDescription>
            </DialogHeader>
            {selectedCommit && <CommitSizeTable data={selectedCommit} />}
          </DialogContent>
        </Dialog>
      </Card>
  )
}
