import CommitFrequency from "@/app/ui/dashboard/repo/commits/commit-frequency";
import { fetchAllCommits } from "@/app/lib/data";
import { parseCommitData } from "@/app/lib/utils";

export default async function CommitFrequencyWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const commitData = await fetchAllCommits(owner, repo);
  const { total, dayEntries, emailToDisplayName, commitByDate } = parseCommitData(commitData);


  return (
    <CommitFrequency
      total={total}
      authors={emailToDisplayName}
      data={dayEntries}
      dates={commitByDate}
    />
  );
}
