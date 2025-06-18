import CommitFrequency from "@/app/ui/dashboard/commits/commit-frequency";
import { fetchGraphUrl } from "@/app/lib/database-functions/database-functions";
import { getCommits } from "@/app/lib/database-functions/repository-data";

export default async function CommitFrequencyWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const image_url = await fetchGraphUrl(owner, repo, "COMMIT_FREQUENCY");
  const { commits, success, error } = await getCommits(owner, repo);

  if (!success && error) {
    return <h1> {error}</h1>;
  }
  return (
    <CommitFrequency
      data={commits}
      image_url={image_url}
      owner={owner}
      repo={repo}
    />
  );
}
