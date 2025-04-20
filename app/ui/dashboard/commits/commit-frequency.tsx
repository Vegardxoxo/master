"use client"
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CommitFrequencyTable from "@/app/ui/dashboard/commits/commit-frequency-table"
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices"
import { Download, RefreshCw } from "lucide-react"
import { Button } from "@/app/ui/button"
import { useReport } from "@/app/contexts/report-context"
import { uploadChartToServer } from "@/app/ui/chart-utils"
import AuthorMerger from "@/app/ui/dashboard/author-merger"
import { parseCommitData } from "@/app/lib/utils/commits-utils"
import { useAuthorConsolidation } from "@/hooks/use-author-consolidation"
import { COLORS } from "@/app/lib/placeholder-data"

interface CommitFrequencyProps {
  data: any[]
  image_url: string
}

export default function CommitFrequency({ data, image_url }: CommitFrequencyProps) {
  const [selectedAuthors, setSelectedAuthors] = useState(["TOTAL@commits"])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageURL, setImageURL] = useState<string | undefined>(image_url)
  const { getRepositoryInfo, addMetricData, addImageUrls } = useReport()
  const info = getRepositoryInfo()
  const repoId = `${info.owner}/${info.repo}`

  // Use the custom hook for author consolidation
  const { mergedCommits, hasMerged, isLoading, handleMerge, resetMerge } = useAuthorConsolidation(data, repoId)

  // Add state for processed data
  const [total, setTotal] = useState(0)
  const [dayEntries, setDayEntries] = useState<any[]>([])
  const [emailToDisplayName, setEmailToDisplayName] = useState<Record<string, string>>({})
  const [authorTotals, setAuthorTotals] = useState<Record<string, number>>({})

  // Process the consolidated data
  useEffect(() => {
    if (mergedCommits.length > 0) {
      const parsedData = parseCommitData(mergedCommits)
      setTotal(parsedData.total)
      setDayEntries(parsedData.dayEntries)
      setEmailToDisplayName(parsedData.emailToDisplayName)
      setAuthorTotals(parsedData.authorTotals || {})
    }
  }, [mergedCommits])

  // Metrics for report
  const metrics = useMemo(() => {
    return {
      total,
      authors: emailToDisplayName,
      includeImage: !!imageURL,
      url: imageURL,
      authorTotals: authorTotals,
    }
  }, [total, emailToDisplayName, imageURL, authorTotals])

  useEffect(() => {
    if (mergedCommits.length > 0) {
      addMetricData("commitFrequency", mergedCommits, metrics)
      addImageUrls("commitFrequency", [imageURL ? imageURL : ""])
    }
  }, [imageURL, mergedCommits, metrics, addMetricData, addImageUrls])

  const handleClick = (e: any) => {
    if (e?.activeLabel) {
      setSelectedDate(e.activeLabel)
    }
  }

  const handleClose = () => {
    setSelectedDate(null)
  }

  const filteredData = useMemo(() => {
    if (!selectedDate || mergedCommits.length === 0) return []

    return mergedCommits.filter((commit) => {
      const commitDate = commit.committedAt
      if (!commitDate) return false

      const formattedDate = new Date(commitDate).toISOString().split("T")[0]
      const authorEmail = commit.authorEmail

      return (
          formattedDate === selectedDate &&
          (selectedAuthors.includes("TOTAL@commits") || selectedAuthors.includes(authorEmail))
      )
    })
  }, [mergedCommits, selectedDate, selectedAuthors])

  const toggleAuthor = (email: string) => {
    setSelectedAuthors((prev) => (prev.includes(email) ? prev.filter((a) => a !== email) : [...prev, email]))
  }

  const authorEntries = emailToDisplayName ? Object.entries(emailToDisplayName) : []

  return (
      <>
        {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        ) : !hasMerged ? (
            <AuthorMerger data={data} onMerge={handleMerge} />
        ) : (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">GitHub Commit History</CardTitle>
                    <CardDescription>Total number of commits: {total}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={resetMerge} title="Return to author consolidation">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Edit Authors
                  </Button>
                  <Button
                      onClick={() => {
                        uploadChartToServer({
                          chartType: "COMMIT_FREQUENCY",
                          chartRef: chartRef,
                          setIsUploading: setIsUploading,
                          owner: info.owner,
                          repo: info.repo,
                        }).then((r) => {
                          if (typeof r === "string") {
                            setImageURL(r)
                          }
                        })
                      }}
                      disabled={isUploading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {imageURL ? "Replace chart" : "Upload Chart"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex flex-wrap gap-4">
                  {authorEntries.map(([email, displayName], index) => (
                      <label key={email} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                            id={`author-${email}`}
                            checked={selectedAuthors.includes(email)}
                            onCheckedChange={() => toggleAuthor(email)}
                            className="border-2 border-gray-300"
                        />
                        <span
                            className="text-sm font-medium"
                            style={{
                              color: COLORS[authorEntries.findIndex(([e]) => e === email) % COLORS.length],
                            }}
                        >
                    {displayName}
                  </span>
                      </label>
                  ))}
                </div>
                {/*Chart*/}
                <ChartContainer config={{}} className="h-[400px] w-full" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={dayEntries}
                        onClick={handleClick}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={true} axisLine={true} />
                      <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={true}
                          axisLine={true}
                          tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend />
                      {selectedAuthors.map((email, index) => (
                          <Line
                              className={"cursor-pointer"}
                              key={email}
                              type="monotone"
                              dataKey={email}
                              name={emailToDisplayName[email] || email}
                              stroke={COLORS[authorEntries.findIndex(([e]) => e === email) % COLORS.length]}
                              strokeWidth={2}
                              dot={{
                                fill: COLORS[authorEntries.findIndex(([e]) => e === email) % COLORS.length],
                                r: 4,
                                cursor: "pointer",
                              }}
                              activeDot={{ r: 8, strokeWidth: 2 }}
                          />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Author Stats Overview */}
                <div className="mt-6 mb-4">
                  <h3 className="text-lg font-semibold mb-3">Author Commit Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authorEntries
                        .filter(([email]) => email !== "TOTAL@commits")
                        .map(([email, displayName], index) => {
                          // Use pre-calculated author totals
                          const authorCommits = authorTotals[email] || 0

                          // Calculate percentage of total commits
                          const percentage = total > 0 ? ((authorCommits / total) * 100).toFixed(1) : "0"

                          return (
                              <div key={email} className="p-4 border rounded-lg flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: COLORS[authorEntries.findIndex(([e]) => e === email) % COLORS.length],
                                      }}
                                  />
                                  <span className="font-medium">{displayName}</span>
                                </div>
                                <div className="text-2xl font-bold">{authorCommits}</div>
                                <div className="text-sm text-muted-foreground">{percentage}% of total commits</div>
                              </div>
                          )
                        })}
                  </div>
                </div>

                <div className={"mt-4"}>
                  <BestPractices title={"Make incremental, small changes"} icon={"commit"} variant={"info"}>
                    <ul className="space-y-1 list-disc pl-5">
                      <li>Write the smallest amount of code possible to solve a problem</li>
                      <li>Divide updates into small batches that can be easily tested and rolled back if needed</li>
                      <li>Small, frequent commits decrease the likelihood of integration conflicts</li>
                      <li>
                        The longer a branch lives separated from the main branch, the more likely conflicts will arise
                      </li>
                      <li>Incremental changes help team members easily revert if merge conflicts happen</li>
                      <li>Pair small commits with descriptive messages for better documentation</li>
                      <li>Small batches of value allow for rapid testing with end users to validate solutions</li>
                    </ul>
                  </BestPractices>
                </div>
              </CardContent>

              {/*Drill-down*/}
              <Dialog open={Boolean(selectedDate)} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-2">Commit Details</DialogTitle>
                    <DialogDescription className="text-lg font-semibold">
                      {`Commits on ${selectedDate} by ${
                          selectedAuthors.includes("TOTAL@commits")
                              ? "all authors"
                              : selectedAuthors.length > 1
                                  ? selectedAuthors.map((email) => emailToDisplayName[email] || email).join(", ")
                                  : emailToDisplayName[selectedAuthors[0]] || selectedAuthors[0]
                      } (${filteredData.length} commit${filteredData.length !== 1 ? "s" : ""})`}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedDate && <CommitFrequencyTable data={filteredData} />}
                </DialogContent>
              </Dialog>
            </Card>
        )}
      </>
  )
}
