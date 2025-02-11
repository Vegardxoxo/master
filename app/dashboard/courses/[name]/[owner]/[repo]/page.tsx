import Dashboard from "@/app/ui/dashboard/repo/dashboard";
import { Suspense } from "react";
import ContributorsList from "@/app/ui/dashboard/repo/project info/contributors";
import ProjectInfo from "@/app/ui/dashboard/repo/project info/project-info";
import { CommitQualityChartSkeleton } from "@/app/ui/skeletons";
import CommitQualityWrapper from "@/app/ui/dashboard/repo/commits/commit-quality-wrapper";
import CommitFrequencyWrapper from "@/app/ui/dashboard/repo/commits/commit-frequency-wrapper";
import CommitContributionsWrapper from "@/app/ui/dashboard/repo/commits/commit-contributions-wrapper";
import { notFound } from "next/navigation";
import CommitSizeWrapper from "@/app/ui/dashboard/repo/commits/commit-size-wrapper";

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
      }}
    </Dashboard>
  );
}
