import PullRequestsReviews from "@/app/ui/dashboard/pull_requests/pull-requests-reviews";
import { getPullRequests } from "@/app/lib/database-functions/repository-data";

export default async function PullRequestsReviewsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { data, success } = await getPullRequests(owner, repo);
  return <PullRequestsReviews data={data} />;
}
