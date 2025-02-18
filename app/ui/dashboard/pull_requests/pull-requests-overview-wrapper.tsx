import { fetchPullRequests } from "@/app/lib/data";
import { PullRequestOverview } from "@/app/ui/dashboard/pull_requests/pull-request-overview";

export default async function PullRequestsOverviewWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchPullRequests(owner, repo, "all");
  return <PullRequestOverview data={data} />;
}
