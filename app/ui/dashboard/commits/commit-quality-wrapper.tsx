import CommitQuality from "@/app/ui/dashboard/commits/commit-quality";
import { getDummyModelData } from "@/app/lib/placeholder-data";
import { getCommits } from "@/app/lib/database-functions/repository-data";

export default async function CommitQualityWrapper({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {

  const data = await getDummyModelData();

  const { commits, success, error } = await getCommits(owner, repo);
  if (!success && error) return <h1> {error}</h1>;

  // uncomment for LLM evaluation
  // const modelResponses = await Promise.all(
  //   commits.map(async (commit) => {
  //     const res = await fetch("http://localhost:3000/api/commit-message", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         messages: [{ commit: commit.message }], // Tilpass dette til ditt CommitMessageShort-format
  //       }),
  //     });
  //
  //     if (!res.ok) {
  //       console.error("LLM failed for commit:", commit.message);
  //       return { error: true, original: commit };
  //     }
  //
  //     const data = await res.json();
  //     return {
  //       original: commit,
  //       modelOutput: data,
  //     };
  //   })
  // );

  return <CommitQuality data={data} />;
}
