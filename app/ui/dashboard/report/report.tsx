"use client"

import { useState } from "react"
import { useReport } from "@/app/contexts/report-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { reportMarkdown } from "@/app/ui/dashboard/report/report-markdown"
import { CommitQualitySection } from "@/app/ui/dashboard/report/report-sections/commit-quality"
import SensitiveFilesSection from "@/app/ui/dashboard/report/report-sections/sensitive-files"
import TestCoverageSection from "@/app/ui/dashboard/report/report-sections/test-coverage"
import DirectCommitsSection from "@/app/ui/dashboard/report/report-sections/direct-commits"
import CommitFrequency from "@/app/ui/dashboard/report/report-sections/commit-frequency"

export default function GenerateReport({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) {
  const { getAllMetricsData, clearMetricsData } = useReport()
  const { toast } = useToast()
  const allMetrics = getAllMetricsData()

  // Extract metrics data
  const commitQuality = allMetrics.commitQuality?.metrics
  const testCoverage = allMetrics.TestCoverage?.metrics
  const fileCoverage = allMetrics.FileCoverage?.data
  const sensitiveFiles = allMetrics.sensitiveFiles?.data
  const directCommits = allMetrics.directCommits?.metrics
  const commitFrequency = allMetrics.commitFrequency?.metrics

  console.log("commitFrequency in generate-report", JSON.stringify(commitFrequency, null, 2))

  // State for included sections
  const [includedSections, setIncludedSections] = useState({
    commitQuality: true,
    commitFrequency: true,
    testCoverage: true,
    sensitiveFiles: true,
    directCommits: true,
  })

  // State for report content
  const [reportTitle, setReportTitle] = useState(`Repository Analysis - ${owner}/${repo}`)
  const [summary, setSummary] = useState(
    `This report provides an analysis of the repository ${owner}/${repo}, focusing on commit quality, test coverage, and potential sensitive files.`,
  )
  const [commitQualityRecommendations, setCommitQualityRecommendations] = useState(
    commitQuality?.qualityStatus === "good"
      ? "Great job on your commit messages! They are clear, descriptive, and follow best practices."
      : commitQuality?.qualityStatus === "moderate"
        ? "Your commit messages are adequate but could be improved. Try to be more descriptive about what changes were made and why."
        : "Your commit messages need improvement. Use the imperative mood and include both what changes were made and why they were necessary.",
  )
  const [commitFrequencyRecommendations, setCommitFrequencyRecommendations] = useState(
    commitFrequency
      ? "Maintain a consistent commit frequency to ensure steady progress and easier code reviews. Aim for smaller, more frequent commits rather than large, infrequent ones to reduce merge conflicts and improve collaboration."
      : "No commit frequency data available. Consider analyzing commit patterns to identify potential workflow improvements.",
  )

  const [coverageRecommendations, setCoverageRecommendations] = useState(
    testCoverage?.status === "good"
      ? "Excellent test coverage! Keep up the good work maintaining high test coverage across the codebase."
      : testCoverage?.status === "info"
        ? "Your test coverage is adequate but could be improved. Consider adding more tests to cover critical paths."
        : "Your test coverage is low. Consider adding more tests to ensure code quality and reduce the risk of regressions.",
  )

  const [sensitiveFilesRecommendations, setSensitiveFilesRecommendations] = useState(
    "Review the identified sensitive files and ensure they are properly handled. Consider adding them to .gitignore if they contain sensitive information.",
  )

  const [directCommitsRecommendations, setDirectCommitsRecommendations] = useState(
    "Avoid committing directly to the main branch. Use feature branches and pull requests instead to ensure code quality and facilitate code reviews.",
  )
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Generate markdown content based on the metrics and user input
  const getMarkdown = () => {
    return reportMarkdown({
      reportTitle,
      summary,
      commitQuality,
      commitQualityRecommendations,
      commitFrequency,
      commitFrequencyRecommendations,
      testCoverage,
      coverageRecommendations,
      fileCoverage,
      sensitiveFiles,
      sensitiveFilesRecommendations,
      directCommits,
      directCommitsRecommendations,
      additionalNotes,
      includedSections,
    })
  }

  // Toggle section inclusion
  const toggleSection = (section: keyof typeof includedSections) => {
    setIncludedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Check if we have any metrics data
  const hasAnyData = commitQuality || testCoverage || fileCoverage || sensitiveFiles || directCommits

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repository Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No metrics data available. Please view the various metrics charts first to collect data.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={clearMetricsData}>
            Clear All Metrics
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left side - Report Editor */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Repository Analysis Report</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Include Sections</Label>
            <div className="grid grid-cols-2 gap-2">
              {commitQuality && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-commits"
                    checked={includedSections.commitQuality}
                    onCheckedChange={() => toggleSection("commitQuality")}
                  />
                  <Label htmlFor="include-commits" className="cursor-pointer">
                    Commit Quality
                  </Label>
                </div>
              )}
              {(testCoverage || (fileCoverage && fileCoverage.length > 0)) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-coverage"
                    checked={includedSections.testCoverage}
                    onCheckedChange={() => toggleSection("testCoverage")}
                  />
                  <Label htmlFor="include-coverage" className="cursor-pointer">
                    Test Coverage
                  </Label>
                </div>
              )}
              {sensitiveFiles && sensitiveFiles.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-sensitive"
                    checked={includedSections.sensitiveFiles}
                    onCheckedChange={() => toggleSection("sensitiveFiles")}
                  />
                  <Label htmlFor="include-sensitive" className="cursor-pointer">
                    Sensitive Files
                  </Label>
                </div>
              )}

              {directCommits && directCommits.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-direct"
                    checked={includedSections.directCommits}
                    onCheckedChange={() => toggleSection("directCommits")}
                  />
                  <Label htmlFor="include-direct" className="cursor-pointer">
                    Direct Commits
                  </Label>
                </div>
              )}

              {commitFrequency && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-frequency"
                    checked={includedSections.commitFrequency}
                    onCheckedChange={() => toggleSection("commitFrequency")}
                  />
                  <Label htmlFor="include-frequency" className="cursor-pointer">
                    Commit Frequency
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="commits" className="w-full ">
            <TabsList className="w-full flex flex-wrap mb-10 gap-y-2 md:gap-y-0">
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="commits"
              >
                Commit Quality
              </TabsTrigger>

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="coverage"
              >
                Test Coverage
              </TabsTrigger>

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="sensitive"
              >
                Sensitive Files
              </TabsTrigger>

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="directCommits"
              >
                Direct Commits
              </TabsTrigger>

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="frequency"
              >
                Commit Frequency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commits">
              <div className={"mb-10"}>
                <CommitQualitySection
                  fileData={commitQuality}
                  recommendations={commitQualityRecommendations}
                  setRecommendations={setCommitQualityRecommendations}
                  include={includedSections.commitQuality}
                />
              </div>
            </TabsContent>

            <TabsContent value="coverage">
              <TestCoverageSection
                fileData={testCoverage}
                fileCoverage={fileCoverage}
                recommendations={coverageRecommendations}
                setRecommendations={setCoverageRecommendations}
                include={includedSections.testCoverage}
              />
            </TabsContent>

            <TabsContent value="sensitive">
              <SensitiveFilesSection
                fileData={sensitiveFiles}
                recommendations={sensitiveFilesRecommendations}
                setRecommendations={setSensitiveFilesRecommendations}
                include={includedSections.sensitiveFiles}
              />
            </TabsContent>

            <TabsContent value="directCommits">
              <DirectCommitsSection
                fileData={directCommits}
                recommendations={directCommitsRecommendations}
                setRecommendations={setDirectCommitsRecommendations}
                include={includedSections.directCommits}
              />
            </TabsContent>

            <TabsContent value="frequency">
              <CommitFrequency
                fileData={commitFrequency}
                recommendations={commitFrequencyRecommendations}
                setRecommendations={setCommitFrequencyRecommendations}
                include={includedSections.commitFrequency}
              />
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[100px]"
              placeholder="Add any additional notes, observations, or recommendations here..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={clearMetricsData}>
            Clear Metrics
          </Button>
        </CardFooter>
      </Card>

      {/* Right side - Markdown Preview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Markdown Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(getMarkdown())
                toast({
                  title: "Copied to clipboard",
                  description: "The markdown report has been copied to your clipboard.",
                })
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Copy Markdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md h-[calc(100vh-12rem)] overflow-auto">
            <pre className="text-xs p-4 whitespace-pre-wrap">{getMarkdown()}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

