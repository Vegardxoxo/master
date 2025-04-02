import { parseCommitData } from "@/app/lib/utils/utils";
import { fetchAllCommits, fetchCommitStatsGraphQL } from "@/app/lib/data/data";
import CommitContributions from "@/app/ui/dashboard/commits/commit-contributions";
import {fetchGraphUrl} from "@/app/lib/database-functions";

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

  const image_url = await fetchGraphUrl(owner, repo, "CONTRIBUTIONS");
  return <CommitContributions data={parsedCommits} url={image_url} />;
}
