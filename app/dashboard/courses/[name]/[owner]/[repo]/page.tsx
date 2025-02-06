import Dashboard from "@/app/ui/dashboard/repo/dashboard";
import { Suspense } from "react";
import ContributorsList from "@/app/ui/dashboard/repo/project info/contributors";
import ProjectInfo from "@/app/ui/dashboard/repo/project info/project-info";
import { CommitQualityChartSkeleton } from "@/app/ui/skeletons";
import CommitQualityWrapper from "@/app/ui/dashboard/repo/commits/commit-quality-wrapper";
import CommitFrequency from "@/app/ui/dashboard/repo/commits/commit-frequency";

export default function Page({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;

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
        commitFrequency: <CommitFrequency owner={owner} repo={repo} />,
      }}
    </Dashboard>
  );
}
