import { parseCommitData } from "@/app/lib/utils";
import { fetchAllCommits, fetchCommitStatsGraphQL } from "@/app/lib/data/data";
import CommitContributions from "@/app/ui/dashboard/commits/commit-contributions";

export default async function CommitContributionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { commitSummary } = parseCommitData(commitData);
  const { parsedCommits } = await fetchCommitStatsGraphQL(
    owner,
    repo,
    commitSummary,
  );
  return <CommitContributions data={parsedCommits} />;
}
