import { fetchPullRequests } from "@/app/lib/data/data";
import { PullRequestsComments } from "./pull-requests-comments";

export default async function PullRequestsCommentsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const pullRequestData = await fetchPullRequests(owner, repo, "all");
  return (
    <div className="space-y-8">
      <PullRequestsComments data={pullRequestData} />
    </div>
  );
}
