import FrequencyChart from "@/app/ui/dashboard/repo/commits/frequency-chart";
import { fetchAllCommits, fetchCommits } from "@/app/lib/data";
import { parseCommitData } from "@/app/lib/utils";

export default async function CommitFrequency({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  // const commitData = await fetchAllCommits(owner, repo);

  const commitData = await fetchCommits(owner, repo);
  console.log(commitData);
  const { total, dayEntries, emailToDisplayName } = parseCommitData(commitData);
  console.log(total);
  console.log(dayEntries);
  // console.log(emailToDisplayName);
  // console.log(authors);

  return (
    <FrequencyChart
      total={total}
      authors={emailToDisplayName}
      data={dayEntries}
    />
  );
}
