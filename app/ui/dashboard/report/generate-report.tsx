"use client";

import { useState } from "react";
import { useReport } from "@/app/contexts/report-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent, CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {CheckCircle2, Eye, FileText} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { reportMarkdown } from "@/app/ui/dashboard/report/report-markdown";
import { CommitQualitySection } from "./report-sections/commit-quality";
import SensitiveFilesSection from "./report-sections/sensitive-files";
import TestCoverageSection from "./report-sections/test-coverage";
import DirectCommitsSection from "./report-sections/direct-commits";
import CommitFrequency from "./report-sections/commit-frequency";
import MarkdownPreview from "./markdown/markdown-preview";
import CommitContributions from "@/app/ui/dashboard/report/report-sections/commit-contributions";
import PullRequests from "@/app/ui/dashboard/report/report-sections/pull-requests";
import DevelopmentBranches from "@/app/ui/dashboard/report/report-sections/development-branches";
import RecommendationEditor from "@/app/ui/dashboard/report/recommendation-editor";
import { useReportHelper } from "@/app/contexts/report-context-helper";

import { usePathname, useRouter } from "next/navigation";

export default function GenerateReport({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { getAllMetricsData, clearMetricsData } = useReport();
  const { toast } = useToast();
  const allMetrics = getAllMetricsData();
  const { setReport } = useReportHelper();
  const router = useRouter();
  const pathname = usePathname();

  // Extract metrics data
  const commitQuality = allMetrics.commitQuality?.metrics;
  const directCommits = allMetrics.directCommits?.metrics;
  const commitFrequency = allMetrics.commitFrequency?.metrics;
  const commitContributions = allMetrics.commitContributions?.metrics;
  const pullRequests = allMetrics.pullRequests?.metrics;
  const pullRequestTableData = allMetrics.pullRequests?.data;
  const developmentBranches = allMetrics.branchConnections?.metrics;
  const developmentBranchesData = allMetrics.branchConnections?.data;

  const testCoverage = allMetrics.testCoverage?.metrics;
  const fileCoverage = allMetrics.fileCoverage?.metrics;
  const sensitiveFiles = allMetrics.sensitiveFiles?.data;


  const handlePreviewClick = () => {
    setReport({
      title: reportTitle,
      content: getMarkdown(),
    });
    router.push(`${pathname}/report`);
  };

  const [includedSections, setIncludedSections] = useState({
    commitQuality: true,
    commitFrequency: true,
    testCoverage: true,
    sensitiveFiles: true,
    directCommits: true,
    commitContributions: true,
    pullRequests: true,
    developmentBranches: true,
  });

  // State for report content
  const [reportTitle, setReportTitle] = useState(
    `Repository Analysis - ${owner}/${repo}`,
  );
  const [summary, setSummary] = useState(
    `This report provides an analysis of the repository ${owner}/${repo}, focusing on commit quality, test coverage, and potential sensitive files.`,
  );
  const [commitQualityRecommendations, setCommitQualityRecommendations] =
    useState(
      commitQuality?.qualityStatus === "good"
        ? "Great job on your commit messages! They are clear, descriptive, and follow best practices."
        : commitQuality?.qualityStatus === "moderate"
          ? "Your commit messages are adequate but could be improved. Try to be more descriptive about what changes were made and why."
          : "Your commit messages need improvement. Use the imperative mood and include both what changes were made and why they were necessary.",
    );
  const [commitFrequencyRecommendations, setCommitFrequencyRecommendations] =
    useState(
      commitFrequency
        ? "Maintain a consistent commit frequency to ensure steady progress and easier code reviews. Aim for smaller, more frequent commits rather than large, infrequent ones to reduce merge conflicts and improve collaboration."
        : "No commit frequency data available. Consider analyzing commit patterns to identify potential workflow improvements.",
    );

  const [coverageRecommendations, setCoverageRecommendations] = useState(
    testCoverage?.status === "good"
      ? "Excellent test coverage! Keep up the good work maintaining high test coverage across the codebase."
      : testCoverage?.status === "info"
        ? "Your test coverage is adequate but could be improved. Consider adding more tests to cover critical paths."
        : "Your test coverage is low. Consider adding more tests to ensure code quality and reduce the risk of regressions.",
  );

  const [sensitiveFilesRecommendations, setSensitiveFilesRecommendations] =
    useState(
      "Review the identified sensitive files and ensure they are properly handled. Consider adding them to .gitignore if they contain sensitive information.",
    );

  const [directCommitsRecommendations, setDirectCommitsRecommendations] =
    useState(
      "Avoid committing directly to the main branch. Use feature branches and pull requests instead to ensure code quality and facilitate code reviews.",
    );

  // Change the useState for contributionsRecommendations to include default text
  const [contributionsRecommendations, setContributionsRecommendations] =
    useState(
      commitContributions
        ? "The distribution of contributions shows how work is shared across the team. Ensure that knowledge isn't siloed with a few contributors and promote collaborative practices like pair programming and code reviews to spread expertise."
        : "No commit contributions data available. Consider analyzing how work is distributed across the team to identify potential bottlenecks or knowledge silos.",
    );

  const [pullRequestsRecommendations, setPullRequestsRecommendations] =
    useState(
      pullRequests
        ? "Encourage team members to review each other's pull requests to improve code quality and knowledge sharing. Consider implementing a policy where PRs require at least one review before merging."
        : "No pull requests data available.",
    );

  const [
    developmentBranchesRecommendations,
    setDevelopmentBranchesRecommendations,
  ] = useState(
    developmentBranches
      ? "Improve branch naming conventions to clearly link branches to issues. Consider creating a development branch directly from the issue to ensure linkage."
      : "No branch linkage data available. Consider analyzing how branches are connected to issues to improve traceability.",
  );

  const [additionalNotes, setAdditionalNotes] = useState("");

  // Generate markdown content based on the metrics and user input
  const getMarkdown = () => {
    // Create a copy of pullRequests with the data included for the markdown
    const pullRequestsWithData = pullRequests
      ? {
          ...pullRequests,
          data: pullRequestTableData,
        }
      : undefined;

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
      developmentBranches,
      developmentBranchesRecommendations,
      testCoverage,
      coverageRecommendations,
      fileCoverage,
      sensitiveFiles,
      sensitiveFilesRecommendations,
      directCommits,
      directCommitsRecommendations,
      additionalNotes,
      includedSections,
    });
  };

  // Toggle section inclusion
  const toggleSection = (section: keyof typeof includedSections) => {
    setIncludedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if we have any metrics data
  const hasAnyData =
    commitQuality ||
    testCoverage ||
    fileCoverage ||
    sensitiveFiles ||
    directCommits;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repository Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No metrics data available. Please view the various metrics charts
            first to collect data.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={clearMetricsData}>
            Clear All Metrics
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left side - Report Editor */}
       <Card className="shadow-lg border-slate-200 h-full flex flex-col">
        <CardHeader className="bg-slate-50 rounded-t-lg border-b">
          <CardTitle className="text-2xl font-bold text-slate-800">Repository Analysis Report</CardTitle>
          <CardDescription>Customize your report content and sections</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8 overflow-auto flex-grow">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="report-title" className="text-sm font-medium">
                Report Title
              </Label>
              <Input
                id="report-title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary" className="text-sm font-medium">
                Executive Summary
              </Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[100px] border-slate-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
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
                  <Label
                    htmlFor="include-contributions"
                    className="cursor-pointer"
                  >
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
                  <Label
                    htmlFor="include-pullRequests"
                    className="cursor-pointer"
                  >
                    Pull Requests Overview
                  </Label>
                </div>
              )}

              {developmentBranches && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-developmentBranches"
                    checked={includedSections.developmentBranches}
                    onCheckedChange={() => toggleSection("developmentBranches")}
                  />
                  <Label
                    htmlFor="include-developmentBranches"
                    className="cursor-pointer"
                  >
                    Branch-Issue Connection
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue={"commits"} className="w-full ">
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

              <TabsTrigger
                className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                value="developmentBranches"
              >
                Branch-issue Linkage
              </TabsTrigger>
            </TabsList>
            <div className="h-60 md:h-20 w-full"></div>
            <TabsContent value="commits">
              <div className={"space-y-6"}>
                <CommitQualitySection
                  metrics={commitQuality}
                  include={includedSections.commitQuality}
                />
                <RecommendationEditor
                  value={commitQualityRecommendations}
                  onChange={setCommitQualityRecommendations}
                  title="Commit Quality Recommendations"
                  sectionId="commit-quality-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="coverage">
              <div className={"space-y-6"}>
                <TestCoverageSection
                  metrics={testCoverage}
                  fileCoverage={fileCoverage}
                  include={includedSections.testCoverage}
                />
                <RecommendationEditor
                  value={coverageRecommendations}
                  onChange={setCoverageRecommendations}
                  title="Test Coverage Recommendations"
                  sectionId="test-coverage-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="sensitive">
              <div className={"space-y-6"}>
                <SensitiveFilesSection
                  metrics={sensitiveFiles}
                  include={includedSections.sensitiveFiles}
                />
                <RecommendationEditor
                  value={sensitiveFilesRecommendations}
                  onChange={setSensitiveFilesRecommendations}
                  title="Sensitive Files Recommendations"
                  sectionId="sensitive-files-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="directCommits">
              <div className={"space-y-6"}>
                <DirectCommitsSection
                  metrics={directCommits}
                  include={includedSections.directCommits}
                />
                <RecommendationEditor
                  value={directCommitsRecommendations}
                  onChange={setDirectCommitsRecommendations}
                  title="Direct Commits Recommendations"
                  sectionId="direct-commits-to-the-main-branch"
                />
              </div>
            </TabsContent>

            <TabsContent value="frequency">
              <div className={"space-y-6"}>
                <CommitFrequency
                  metrics={commitFrequency}
                  include={includedSections.commitFrequency}
                />
                <RecommendationEditor
                  value={commitFrequencyRecommendations}
                  onChange={setCommitFrequencyRecommendations}
                  title="Commit Frequency Recommendations"
                  sectionId="commit-frequency-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="contributions">
              <div className={"space-y-6"}>
                <CommitContributions
                  metrics={commitContributions}
                  include={includedSections.commitContributions}
                />
                <RecommendationEditor
                  value={contributionsRecommendations}
                  onChange={setContributionsRecommendations}
                  title="Contributions Recommendations"
                  sectionId="commit-contributions-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="pullRequests">
              <div className={"space-y-6"}>
                <PullRequests
                  metrics={pullRequests}
                  data={pullRequestTableData}
                  include={includedSections.pullRequests}
                />
                <RecommendationEditor
                  value={pullRequestsRecommendations}
                  onChange={setPullRequestsRecommendations}
                  title="Pull Requests Recommendations"
                  sectionId="pull-requests-analysis"
                />
              </div>
            </TabsContent>

            <TabsContent value="developmentBranches">
              <div className={"space-y-6"}>
                <DevelopmentBranches
                  metrics={developmentBranches}
                  data={developmentBranchesData}
                  include={includedSections.developmentBranches}
                />
                <RecommendationEditor
                  value={developmentBranchesRecommendations}
                  onChange={setDevelopmentBranchesRecommendations}
                  title="Development Branches Recommendations"
                  sectionId="branch-issue-connection-analysis"
                />
              </div>
            </TabsContent>
          </Tabs>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="additional-notes">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[100px]"
              placeholder="Add any additional notes, observations, or recommendations here..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(getMarkdown());
                toast({
                  title: "Copied to clipboard",
                  description:
                    "The markdown report has been copied to your clipboard.",
                });
              }}
              variant="outline"
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Copy Report
            </Button>

            <Button
              onClick={handlePreviewClick}
              className="flex items-center gap-1 bg-sky-500 hover:bg-sky-700"
            >
              <Eye className="h-4 w-4" />
              Preview & Upload
            </Button>
          </div>
        </CardFooter>
      </Card>

     {/* Right side - Markdown Preview */}
       <div className="hidden lg:block h-full">
        <Card className="shadow-lg border-slate-200 h-full flex flex-col">
          <CardHeader className="bg-slate-50 rounded-t-lg border-b flex-shrink-0">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-sky-500" />
              Report Preview
            </CardTitle>
            <CardDescription>Live preview of your generated report</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-grow">
            <MarkdownPreview markdown={getMarkdown()} title="" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
