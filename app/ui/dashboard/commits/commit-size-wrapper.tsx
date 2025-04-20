import CommitSize from "@/app/ui/dashboard/commits/commit-size";
import {getCommits} from "@/app/lib/database-functions/repository-data";

export default async function CommitSizeWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const {commits, success, error} = await getCommits(owner, repo);
  return <CommitSize data={commits} />;
}
