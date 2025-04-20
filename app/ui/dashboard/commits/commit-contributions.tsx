"use client"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CommitContributionsTable from "@/app/ui/dashboard/commits/commit-contributions-table"
import { uploadChartToServer } from "@/app/ui/chart-utils"
import { Download, RefreshCw } from "lucide-react"
import { useReport } from "@/app/contexts/report-context"
import AuthorMerger from "@/app/ui/dashboard/author-merger"
import { processCommitData } from "@/app/lib/utils/commits-utils"
import { Button } from "@/app/ui/button"
import { useAuthorConsolidation } from "@/hooks/use-author-consolidation"

const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props
  const minHeight = 5
  const barHeight = Math.max(height, minHeight)
  const adjustedY = height < minHeight ? y - (minHeight - height) : y
  return <rect x={x} y={adjustedY} width={width} height={barHeight} fill={fill} />
}

interface CommitContributionsProps {
  commits: any[]
  url: string | undefined
}

export default function CommitContributions({ commits, url }: CommitContributionsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [imageUrl, setImageUrl] = useState(url)
  const [isUploading, setIsUploading] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // State for processed data
  const [chartData, setChartData] = useState<any[]>([])
  const [statMap, setStatMap] = useState<Record<string, any>>({})
  const [projectAverageChanges, setProjectAverageChanges] = useState<number>(0)
  const [projectAverageFilesChanged, setProjectAverageFilesChanged] = useState<number>(0)

  // context store
  const { getRepositoryInfo, addMetricData, addImageUrls } = useReport()
  const info = getRepositoryInfo()
  const repoId = `${info.owner}/${info.repo}`

  // Use the custom hook for author consolidation
  const { mergedCommits, hasMerged, isLoading, handleMerge, resetMerge } = useAuthorConsolidation(commits, repoId)

  // Process the merged commits data
  useEffect(() => {
    if (mergedCommits.length === 0) return

    try {
      const { statMap, chartData, projectAverageChanges, projectAverageFilesChanged } = processCommitData(mergedCommits)

      setStatMap(statMap)
      setChartData(chartData)
      setProjectAverageChanges(projectAverageChanges)
      setProjectAverageFilesChanged(projectAverageFilesChanged)
    } catch (error) {
      console.error("Error processing commit data:", error)
    }
  }, [mergedCommits])

  useEffect(() => {
    if (Object.keys(statMap).length === 0) return
    const metrics = {
      contributors: chartData.map((entry) => ({
        name: entry.name,
        additions: entry.additions,
        deletions: entry.deletions,
        total: entry.total,
        email: entry.email,
        commits: entry.commits,
        average_changes: entry.average_changes,
        average_files_changed: entry.average_files_changed,
      })),
      url: imageUrl,
      includeImage: !!imageUrl,
      groupAverageChanges: projectAverageChanges,
      groupAverageFilesChanged: projectAverageFilesChanged,
    }

    addImageUrls("commitContributions", [imageUrl ? imageUrl : ""])
    addMetricData("commitContributions", statMap, metrics)
  }, [statMap, chartData, imageUrl, projectAverageChanges, projectAverageFilesChanged, addImageUrls, addMetricData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
          <div className="bg-background p-4 rounded-md shadow-md border border-border">
            <p className="font-bold">{label}</p>
            <p className="text-green-500">Additions: {payload[0].value}</p>
            <p className="text-red-500">Deletions: {payload[1].value}</p>
            <p className="font-semibold">Total: {payload[0].value + payload[1].value + (payload[2]?.value || 0)}</p>
          </div>
      )
    }
    return null
  }

  const handleBarClick = (barData: any) => {
    setSelectedUser(statMap[barData.email])
    setIsOpen(true)
  }

  const handleMergeAndConvert = (mergedData: any[]) => {
    handleMerge(mergedData)
  }

  return (
      <>
        {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        ) : !hasMerged ? (
            <AuthorMerger data={commits} onMerge={handleMergeAndConvert} />
        ) : (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">Contributions per Group Member</CardTitle>
                    <CardDescription>Distribution of additions and deletions.</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetMerge} title="Return to author consolidation">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Edit Authors
                  </Button>
                  <Button
                      onClick={() => {
                        uploadChartToServer({
                          chartType: "CONTRIBUTIONS",
                          chartRef: chartRef,
                          setIsUploading: setIsUploading,
                          owner: info.owner,
                          repo: info.repo,
                        }).then((r) => {
                          if (typeof r === "string") {
                            setImageUrl(r)
                          }
                        })
                      }}
                      disabled={isUploading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {imageUrl ? "Replace chart" : "Upload Chart"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer
                        ref={chartRef}
                        config={{
                          additions: {
                            label: "Additions",
                            color: "hsl(142, 76%, 36%)",
                          },
                          deletions: {
                            label: "Deletions",
                            color: "hsl(var(--destructive))",
                          },
                        }}
                        className="h-[600px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 30, right: 40, left: 60, bottom: 80 }}
                            barSize={chartData.length === 1 ? 200 : undefined}
                        >
                          <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              interval={0}
                              tick={(props) => {
                                const { x, y, payload } = props
                                const name = payload.value
                                const displayName = name.length > 15 ? `${name.substring(0, 12)}...` : name

                                return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text
                                          x={0}
                                          y={0}
                                          dy={16}
                                          textAnchor="end"
                                          fill="#666"
                                          fontSize={13}
                                          transform="rotate(-45)"
                                      >
                                        {displayName}
                                      </text>
                                      <title>{name}</title>
                                    </g>
                                )
                              }}
                          />
                          <YAxis
                              label={{
                                value: "Lines of Code",
                                angle: -90,
                                position: "insideLeft",
                                offset: -45,
                                style: { fontSize: "14px", textAnchor: "middle" },
                              }}
                              tick={{ fontSize: 13 }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar
                              onClick={(barData) => handleBarClick(barData)}
                              className="hover:cursor-pointer"
                              dataKey="additions"
                              stackId="a"
                              fill="var(--color-additions)"
                              shape={<CustomBar />}
                              minPointSize={5}
                          />

                          <Bar
                              onClick={(barData) => handleBarClick(barData)}
                              className="hover:cursor-pointer"
                              dataKey="deletions"
                              stackId="a"
                              fill="var(--color-deletions)"
                              shape={<CustomBar />}
                              minPointSize={5}
                          >
                            <LabelList
                                dataKey="commits"
                                position="top"
                                content={({ value, x, y, width }) => (
                                    <text
                                        x={Number(x) + Number(width) / 2}
                                        y={Number(y) - 12}
                                        fill="#000000"
                                        textAnchor="middle"
                                        fontSize={13}
                                    >
                                      {`${value} commits`}
                                    </text>
                                )}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <p className="text-lg font-medium mb-2">No contribution data to display</p>
                        <p className="text-muted-foreground">
                          There might be an issue with the data processing or no commits match the current filters.
                        </p>
                      </div>
                    </div>
                )}

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Click on a bar to view detailed contribution information
                </div>

                {chartData.length > 0 && (
                    <div className="w-full mt-6">
                      <h3 className="text-lg font-semibold mb-3">Member vs. Project Averages</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Average Changes per Commit</span>
                            <span className="text-sm font-bold">Project: {projectAverageChanges.toLocaleString()}</span>
                          </div>

                          <div className="space-y-2">
                            {Object.keys(statMap).map((email) => (
                                <div key={`changes-${email}`} className="flex items-center justify-between">
                          <span className="text-xs truncate max-w-[150px]" title={statMap[email].name}>
                            {statMap[email].name}
                          </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono">{statMap[email].average_changes.toLocaleString()}</span>
                                    <span
                                        className={`text-xs ${
                                            statMap[email].average_changes > projectAverageChanges
                                                ? "text-green-500"
                                                : "text-orange-500"
                                        }`}
                                    >
                              {statMap[email].average_changes > projectAverageChanges ? "↑" : "↓"}
                            </span>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Average Files per Commit</span>
                            <span className="text-sm font-bold">Project: {projectAverageFilesChanged.toFixed(2)}</span>
                          </div>

                          <div className="space-y-2">
                            {Object.keys(statMap).map((email) => (
                                <div key={`files-${email}`} className="flex items-center justify-between">
                          <span className="text-xs truncate max-w-[150px]" title={statMap[email].name}>
                            {statMap[email].name}
                          </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono">{statMap[email].average_files_changed.toFixed(2)}</span>
                                    <span
                                        className={`text-xs ${
                                            statMap[email].average_files_changed > projectAverageFilesChanged
                                                ? "text-green-500"
                                                : "text-orange-500"
                                        }`}
                                    >
                              {statMap[email].average_files_changed > projectAverageFilesChanged ? "↑" : "↓"}
                            </span>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Drill-down */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
                    <DialogHeader className="h-fit">
                      <DialogTitle className="text-2xl font-bold">Commit Details</DialogTitle>
                      <DialogDescription className="text-lg font-semibold">
                        Detailed information for {selectedUser && selectedUser.name}.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedUser && <CommitContributionsTable data={selectedUser} />}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
        )}
      </>
  )
}
