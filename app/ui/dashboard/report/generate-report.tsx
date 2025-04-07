"use client"

import { useState } from "react"
import { useReport } from "../../../contexts/report-context" // Fixed import path
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
import { reportMarkdown } from "@/app/ui/dashboard/report/report-markdown" // Fixed import path
import { CommitQualitySection } from "./report-sections/commit-quality" // Fixed import path
import SensitiveFilesSection from "./report-sections/sensitive-files" // Fixed import path
import TestCoverageSection from "./report-sections/test-coverage" // Fixed import path
import DirectCommitsSection from "./report-sections/direct-commits" // Fixed import path
import CommitFrequency from "./report-sections/commit-frequency" // Fixed import path
import MarkdownPreview from "./markdown-preview"
import CommitContributions from "@/app/ui/dashboard/report/report-sections/commit-contributions"
import PullRequests from "@/app/ui/dashboard/report/report-sections/pull-requests"

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
  const directCommits = allMetrics.directCommits?.metrics
  const commitFrequency = allMetrics.commitFrequency?.metrics
  const commitContributions = allMetrics.commitContributions?.metrics
  const pullRequests = allMetrics.pullRequests?.metrics
  const pullRequestTableData = allMetrics.pullRequests?.data
  const testCoverage = allMetrics.testCoverage?.metrics // Fixed property casing
  const fileCoverage = allMetrics.fileCoverage?.metrics // Fixed property casing
  const sensitiveFiles = allMetrics.sensitiveFiles?.data

  // State for included sections
  const [includedSections, setIncludedSections] = useState({
    commitQuality: true,
    commitFrequency: true,
    testCoverage: true,
    sensitiveFiles: true,
    directCommits: true,
    commitContributions: true,
    pullRequests: true,
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

  // Change the useState for contributionsRecommendations to include default text
  const [contributionsRecommendations, setContributionsRecommendations] = useState(
    commitContributions
      ? "The distribution of contributions shows how work is shared across the team. Ensure that knowledge isn't siloed with a few contributors and promote collaborative practices like pair programming and code reviews to spread expertise."
      : "No commit contributions data available. Consider analyzing how work is distributed across the team to identify potential bottlenecks or knowledge silos.",
  )

  const [pullRequestsRecommendations, setPullRequestsRecommendations] = useState(
    pullRequests
      ? "Encourage team members to review each other's pull requests to improve code quality and knowledge sharing. Consider implementing a policy where PRs require at least one review before merging."
      : "No pull requests data available.",
  )

  const [additionalNotes, setAdditionalNotes] = useState("")

  // Generate markdown content based on the metrics and user  setAdditionalNotes] = useState("");

  // Generate markdown content based on the metrics and user input
  const getMarkdown = () => {
    // Create a copy of pullRequests with the data included for the markdown
    const pullRequestsWithData = pullRequests
      ? {
          ...pullRequests,
          data: pullRequestTableData,
        }
      : undefined

    return reportMarkdown({
      reportTitle,
      summary,
      commitQuality,
      commitQualityRecommendations,
      commitFrequency,
      commitFrequencyRecommendations,
      commitContributions,
      commitContributionsRecommendations: contributionsRecommendations,
      pullRequests: pullRequestsWithData,
      pullRequestsRecommendations,
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

              {commitContributions && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-contributions"
                    checked={includedSections.commitContributions}
                    onCheckedChange={() => toggleSection("commitContributions")}
                  />
                  <Label htmlFor="include-contributions" className="cursor-pointer">
                    Commit Contributions
                  </Label>
                </div>
              )}

              {pullRequests && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-pullRequests"
                    checked={includedSections.pullRequests}
                    onCheckedChange={() => toggleSection("pullRequests")}
                  />
                  <Label htmlFor="include-pullRequests" className="cursor-pointer">
                    Pull Requests Overview
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Tabs className="w-full ">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2">
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

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="contributions"
              >
                Contributions
              </TabsTrigger>

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="pullRequests"
              >
                Pull Requests Overview
              </TabsTrigger>
            </TabsList>
            <div className="h-60 md:h-20 w-full"></div>
            <TabsContent value="commits">
              <CommitQualitySection
                metrics={commitQuality}
                recommendations={commitQualityRecommendations}
                setRecommendations={setCommitQualityRecommendations}
                include={includedSections.commitQuality}
              />
            </TabsContent>

            <TabsContent value="coverage">
              <TestCoverageSection
                metrics={testCoverage}
                fileCoverage={fileCoverage}
                recommendations={coverageRecommendations}
                setRecommendations={setCoverageRecommendations}
                include={includedSections.testCoverage}
              />
            </TabsContent>

            <TabsContent value="sensitive">
              <SensitiveFilesSection
                metrics={sensitiveFiles}
                recommendations={sensitiveFilesRecommendations}
                setRecommendations={setSensitiveFilesRecommendations}
                include={includedSections.sensitiveFiles}
              />
            </TabsContent>

            <TabsContent value="directCommits">
              <DirectCommitsSection
                metrics={directCommits}
                recommendations={directCommitsRecommendations}
                setRecommendations={setDirectCommitsRecommendations}
                include={includedSections.directCommits}
              />
            </TabsContent>

            <TabsContent value="frequency">
              <CommitFrequency
                metrics={commitFrequency}
                recommendations={commitFrequencyRecommendations}
                setRecommendations={setCommitFrequencyRecommendations}
                include={includedSections.commitFrequency}
              />
            </TabsContent>

            <TabsContent value="contributions">
              <CommitContributions
                metrics={commitContributions}
                recommendations={contributionsRecommendations}
                setRecommendations={setContributionsRecommendations}
                include={includedSections.commitContributions}
              />
            </TabsContent>

            <TabsContent value="pullRequests">
              <PullRequests
                metrics={pullRequests}
                data={pullRequestTableData}
                recommendations={pullRequestsRecommendations}
                setRecommendations={setPullRequestsRecommendations}
                include={includedSections.pullRequests}
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
          <Button
            onClick={() => {
              navigator.clipboard.writeText(getMarkdown())
              toast({
                title: "Copied to clipboard",
                description: "The markdown report has been copied to your clipboard.",
              })
            }}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Copy Report
          </Button>
        </CardFooter>
      </Card>

      {/* Right side - Markdown Preview */}
      <MarkdownPreview markdown={getMarkdown()} title="Report Preview" />
    </div>
  )
}

