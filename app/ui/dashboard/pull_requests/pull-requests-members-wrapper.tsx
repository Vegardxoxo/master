import { fetchPullRequests } from "@/app/lib/data/data";
import { PullRequestsMembers } from "@/app/ui/dashboard/pull_requests/pull-requests-members";

export default async function PullRequestsMembersWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchPullRequests(owner, repo, "all");
  return <PullRequestsMembers data={data} />;
}
