import { PullRequestsMembers } from "@/app/ui/dashboard/pull_requests/pull-requests-members";
import { fetchGraphUrl } from "@/app/lib/database-functions/database-functions";
import { getPullRequests } from "@/app/lib/database-functions/repository-data";

export default async function PullRequestsMembersWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { data, success } = await getPullRequests(owner, repo);
  const image_url = await fetchGraphUrl(owner, repo, "PULL_REQUESTS");
  return <PullRequestsMembers data={data} url={image_url} />;
}
