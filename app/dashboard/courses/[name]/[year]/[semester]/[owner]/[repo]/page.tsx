import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/app/ui/dashboard/dashboard";
import React, { Suspense } from "react";
import { CommitQualityChartSkeleton } from "@/app/ui/skeletons";
import CommitQualityWrapper from "@/app/ui/dashboard/commits/commit-quality-wrapper";
import CommitFrequencyWrapper from "@/app/ui/dashboard/commits/commit-frequency-wrapper";
import CommitContributionsWrapper from "@/app/ui/dashboard/commits/commit-contributions-wrapper";
import CommitSizeWrapper from "@/app/ui/dashboard/commits/commit-size-wrapper";
import ProjectInfo from "@/app/ui/dashboard/project_info/project-info";
import ContributorsList from "@/app/ui/dashboard/project_info/contributors";
import PullRequestsCommentsWrapper from "@/app/ui/dashboard/pull_requests/pull-requests-comments-wrapper";
import PullRequestsMembersWrapper from "@/app/ui/dashboard/pull_requests/pull-requests-members-wrapper";
import PullRequestsOverviewWrapper from "@/app/ui/dashboard/pull_requests/pull-requests-overview-wrapper";
import PullRequestsReviewsWrapper from "@/app/ui/dashboard/pull_requests/pull-requests-reviews-wrapper";
import Files from "@/app/ui/dashboard/project_info/file-explorer/files";
import TestCoverage from "@/app/ui/dashboard/project_info/test-coverage/coverage";
import PipelineActions from "@/app/ui/dashboard/pipeline/pipeline-actions";
import DirectCommitsWrapper from "@/app/ui/dashboard/branches/direct-commits-wrapper";
import DevelopmentBranches from "@/app/ui/dashboard/branches/development-branches";
import Milestones from "@/app/ui/dashboard/project_info/milestones";
import { ReportProvider, useReport } from "@/app/contexts/report-context";
import GenerateReport from "@/app/ui/dashboard/report/report";
import Link from "next/link";
import { cn } from "@/app/lib/utils/utils";
import { lusitana } from "@/app/ui/fonts";

export default async function Page(props: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const params = await props.params;
  const owner = params.owner;
  const repo = params.repo;


  return (
    <ReportProvider>
      <div className="container mx-auto py-6">
        {/*Project subject and group.*/}
        <header>
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              <Link
                href={`https://git.ntnu.no/${owner}/${repo}`}
                className={cn(
                  lusitana.className,
                  "hover:underline text-blue-600",
                )}
              >
                {owner}/{repo} Dashboard
              </Link>
            </h1>
          </div>
        </header>

        <Dashboard owner={owner} repo={repo}>
          {{
            contributorsList: (
              <Suspense fallback={<div>Loading contributors...</div>}>
                <ContributorsList owner={owner} repo={repo} />
              </Suspense>
            ),
            projectInfo: <ProjectInfo owner={owner} repo={repo} />,
            milestones: <Milestones owner={owner} repo={repo} />,
            files: <Files owner={owner} repo={repo} />,
            coverage: <TestCoverage owner={owner} repo={repo} />,
            commitQuality: (
              <Suspense fallback={<CommitQualityChartSkeleton />}>
                <CommitQualityWrapper owner={owner} repo={repo} />
              </Suspense>
            ),
            commitFrequency: (
              <CommitFrequencyWrapper owner={owner} repo={repo} />
            ),
            commitSize: <CommitSizeWrapper owner={owner} repo={repo} />,
            commitContribution: (
              <CommitContributionsWrapper owner={owner} repo={repo} />
            ),
            branch: <DirectCommitsWrapper owner={owner} repo={repo} />,
            branchingStrategy: (
              <DevelopmentBranches owner={owner} repo={repo} />
            ),
            pipeline: <PipelineActions owner={owner} repo={repo} />,
            pullRequestOverview: (
              <PullRequestsOverviewWrapper owner={owner} repo={repo} />
            ),
            pullRequestMembers: (
              <PullRequestsMembersWrapper owner={owner} repo={repo} />
            ),
            pullRequestComments: (
              <PullRequestsCommentsWrapper owner={owner} repo={repo} />
            ),
            pullRequestReviews: (
              <PullRequestsReviewsWrapper owner={owner} repo={repo} />
            ),
          }}
        </Dashboard>
      </div>
    </ReportProvider>
  );
}
