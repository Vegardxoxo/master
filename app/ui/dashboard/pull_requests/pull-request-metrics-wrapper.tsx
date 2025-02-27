import { fetchPullRequests } from "@/app/lib/data";
import { PullRequestMetrics } from "./pull-request-metrics";

export default async function PullRequestMetricsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const pullRequestData = await fetchPullRequests(owner, repo, "all");
  return (
    <div className="space-y-8">
      <PullRequestMetrics data={pullRequestData} />
    </div>
  );
}
