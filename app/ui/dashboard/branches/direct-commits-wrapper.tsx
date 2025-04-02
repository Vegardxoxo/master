import {getMainCommits} from "@/app/lib/data/data";
import Good from "@/app/ui/dashboard/alerts/good";
import DirectCommits from "@/app/ui/dashboard/branches/direct-commits";

/**
 * Wrapper component for DirectCommits as the main component needs to access a context object.
 * @param owner - GitHub username or organization name that owns the repository.
 * @param repo - Repository name for which the commits are being fetched.
 * @param repo
 * @constructor
 */
export default async function DirectCommitsWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commits = await getMainCommits(owner, repo);

  if (!commits || commits.length === 0) {
    return <Good message={"Great job! No commits directly to main 👍"} />;
  }

  const authorCount: Record<string, number> = {};

  commits.forEach((commit) => {
    authorCount[commit.author] = (authorCount[commit.author] || 0) + 1;
  });

  const sortedAuthors = Object.keys(authorCount).sort(
    (a, b) => authorCount[b] - authorCount[a],
  );

  return (
    <DirectCommits
      commits={commits}
      sortedAuthors={sortedAuthors}
      authorCount={authorCount}
    />
  );
}
