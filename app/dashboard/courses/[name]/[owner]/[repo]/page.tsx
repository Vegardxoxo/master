import Dashboard from "@/app/ui/dashboard/dashboard";
import { Suspense } from "react";
import { CommitQualityChartSkeleton } from "@/app/ui/skeletons";
import CommitQualityWrapper from "@/app/ui/dashboard/commits/commit-quality-wrapper";
import CommitFrequencyWrapper from "@/app/ui/dashboard/commits/commit-frequency-wrapper";
import CommitContributionsWrapper from "@/app/ui/dashboard/commits/commit-contributions-wrapper";
import CommitSizeWrapper from "@/app/ui/dashboard/commits/commit-size-wrapper";
import ProjectInfo from "@/app/ui/dashboard/project_info/project-info";
import ContributorsList from "@/app/ui/dashboard/project_info/contributors";
import PullRequestMetricsWrapper from "@/app/ui/dashboard/pull_requests/pull-request-metrics-wrapper";
import {PullRequestOverview} from "@/app/ui/dashboard/pull_requests/pull-request-overview";
import PullRequestOverviewWrapper from "@/app/ui/dashboard/pull_requests/pull-request-overview-wrapper";

export default async function Page(props: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const params = await props.params;
  const owner = params.owner;
  const repo = params.repo;

  return (
    <Dashboard owner={owner} repo={repo}>
      {{
        contributorsList: (
          <Suspense fallback={<div>Loading contributors...</div>}>
            <ContributorsList owner={owner} repo={repo} />
          </Suspense>
        ),
        projectInfo: <ProjectInfo owner={owner} repo={repo} />,
        commitQuality: (
          <Suspense fallback={<CommitQualityChartSkeleton />}>
            <CommitQualityWrapper owner={owner} repo={repo} />
          </Suspense>
        ),
        commitFrequency: <CommitFrequencyWrapper owner={owner} repo={repo} />,
        commitSize: <CommitSizeWrapper owner={owner} repo={repo} />,
        commitContribution: (
          <CommitContributionsWrapper owner={owner} repo={repo} />
        ),
        pullRequestOverview: <PullRequestOverviewWrapper owner={owner} repo={repo} />,
        pullRequestMetrics: <PullRequestMetricsWrapper owner={owner} repo={repo} />,
      }}
    </Dashboard>
  );
}
