import { fetchPullRequests, fetchReviewComments } from "@/app/lib/data";

export default async function PullRequests({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchPullRequests(owner, repo, "closed");
  // const data = await fetchReviewComments(owner, repo);
  console.log("Pull request comments ", +data[0]);

  return <div>Pull Requests Comments</div>;
}
