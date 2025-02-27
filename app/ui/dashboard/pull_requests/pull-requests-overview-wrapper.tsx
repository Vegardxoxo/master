import { fetchPullRequests } from "@/app/lib/data";
import PullRequestsOverview from "@/app/ui/dashboard/pull_requests/pull-requests-overview";

export default async function PullRequestsOverviewWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchPullRequests(owner, repo, "all");
  return <PullRequestsOverview data={data} />;
}
