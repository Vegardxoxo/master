import {PullRequestsComments} from "./pull-requests-comments";
import {getPullRequests} from "@/app/lib/database-functions/repository-data";

export default async function PullRequestsCommentsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const {data, success} = await getPullRequests(owner, repo);
  return (
    <div className="space-y-8">
      <PullRequestsComments data={data} />
    </div>
  );
}
