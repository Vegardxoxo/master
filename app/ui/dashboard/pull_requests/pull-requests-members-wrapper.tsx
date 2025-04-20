import { fetchPullRequests } from "@/app/lib/data/github-api-functions";
import { PullRequestsMembers } from "@/app/ui/dashboard/pull_requests/pull-requests-members";
import {fetchGraphUrl} from "@/app/lib/database-functions/database-functions";

export default async function PullRequestsMembersWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchPullRequests(owner, repo, "all");
  const image_url = await fetchGraphUrl(owner, repo, "PULL_REQUESTS");
  return <PullRequestsMembers data={data} url={image_url} />;
}
