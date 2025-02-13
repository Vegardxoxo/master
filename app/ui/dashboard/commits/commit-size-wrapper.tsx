import { parseCommitData } from "@/app/lib/utils";
import { fetchAllCommits, fetchCommitStatsGraphQL } from "@/app/lib/data";
import CommitSize from "@/app/ui/dashboard/commits/commit-size";

export default async function CommitSizeWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { commitSummary } = parseCommitData(commitData);
  const { commits } = await fetchCommitStatsGraphQL(owner, repo, commitSummary);

  return <CommitSize data={commits} />;
}
