import PullRequestsOverview from "@/app/ui/dashboard/pull_requests/pull-requests-overview";
import {getPullRequests} from "@/app/lib/database-functions/repository-data";

export default async function PullRequestsOverviewWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const {data, success} = await getPullRequests(owner, repo);
  return <PullRequestsOverview data={data} />;
}
