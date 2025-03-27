"use client"

import { useState } from "react"
import { useReport } from "@/app/contexts/report-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitPullRequest, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { reportMarkdown } from "@/app/ui/dashboard/report/report-markdown"
import { CommitQualitySection } from "@/app/ui/dashboard/report/report-sections/commit-quality"
import SensitiveFilesSection from "@/app/ui/dashboard/report/report-sections/sensitive-files"
import TestCoverageSection from "@/app/ui/dashboard/report/report-sections/test-coverage"

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

  // State for included sections
  const [includedSections, setIncludedSections] = useState({
    commitQuality: true,
    testCoverage: true,
    sensitiveFiles: true,
  })

  // State for report content
  const [reportTitle, setReportTitle] = useState(`Repository Analysis - ${owner}/${repo}`)
  const [summary, setSummary] = useState(
    `This report provides an analysis of the repository ${owner}/${repo}, focusing on commit quality, test coverage, and potential sensitive files.`,
  )
  const [commitRecommendations, setCommitRecommendations] = useState(
    commitQuality?.qualityStatus === "good"
      ? "Great job on your commit messages! They are clear, descriptive, and follow best practices."
      : commitQuality?.qualityStatus === "moderate"
        ? "Your commit messages are adequate but could be improved. Try to be more descriptive about what changes were made and why."
        : "Your commit messages need improvement. Use the imperative mood and include both what changes were made and why they were necessary.",
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
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Generate markdown content based on the metrics and user input
  const getMarkdown = () => {
    return reportMarkdown({
      reportTitle,
      summary,
      commitQuality,
      commitRecommendations,
      testCoverage,
      coverageRecommendations,
      fileCoverage,
      sensitiveFiles,
      sensitiveFilesRecommendations,
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
  const hasAnyData = commitQuality || testCoverage || fileCoverage || sensitiveFiles

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
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="commits" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger className={"data-[state=active]:bg-sky-500 data-[state=active]:text-white "} value="commits">
                Commit Quality
              </TabsTrigger>
              <TabsTrigger
                className={"data-[state=active]:bg-sky-500 data-[state=active]:text-white "}
                value="coverage"
              >
                Test Coverage
              </TabsTrigger>
              <TabsTrigger
                className={"data-[state=active]:bg-sky-500 data-[state=active]:text-white "}
                value="sensitive"
              >
                Sensitive Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commits">
              <CommitQualitySection
                fileData={commitQuality}
                recommendations={commitRecommendations}
                setRecommendations={setCommitRecommendations}
                include={includedSections.commitQuality}
              />
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

