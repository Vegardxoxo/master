import {
  fetchCommitSHAs,
  fetchAllCommits,
} from "@/app/lib/data/github-api-functions";
import CommitContributions from "@/app/ui/dashboard/commits/commit-contributions";
import { fetchGraphUrl } from "@/app/lib/database-functions/database-functions";
import { parseCommitStatsGraphQLEnhanched } from "@/app/lib/utils/email-similarity";
import {parseCommitData, parseCommitStatsGraphQL} from "@/app/lib/utils/commits-utils";
import {getCommits} from "@/app/lib/database-functions/repository-data";

export default async function CommitContributionsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const image_url = await fetchGraphUrl(owner, repo, "CONTRIBUTIONS");
  const {commits, success, error} = await getCommits(owner, repo);
  if (!success && error) {
    return <h1> {error}</h1>
  }
  return (
    <CommitContributions
        commits={commits}
        url={image_url}
        owner={owner}
        repo={repo}
    />
  );
}
