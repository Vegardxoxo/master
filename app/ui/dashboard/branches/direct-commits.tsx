import { getMainCommits } from "@/app/lib/data/data";
import Warning from "@/app/ui/dashboard/alerts/warning";
import Good from "@/app/ui/dashboard/alerts/good";
import { Commit } from "@/app/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { CommitsTable } from "@/app/ui/courses/tables/commits-to-main-table";
import { commitsColumns } from "@/app/ui/courses/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";

export default async function DirectCommits({
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
    <Card className="shadow-sm">
      <CardHeader className="pb-4"></CardHeader>
      <CardContent>
        <Warning
          title={"Direct Commits to Main Branch"}
          message={`${commits.length} commit${
            commits.length !== 1 ? "s" : ""
          } made directly to the main branch. This is generally considered a bad practice as it bypasses code review and can introduce bugs.`}
        />
        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {sortedAuthors.map((author) => (
              <Badge
                key={author}
                variant="outline"
                className="flex items-center gap-1"
              >
                <span>{author}</span>
                <span className="ml-1 bg-amber-200 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                  {authorCount[author]}
                </span>
              </Badge>
            ))}
          </div>

          <CommitsTable columns={commitsColumns} data={commits} />
          <BestPractices title={"Dont commit directly to main"} icon={"commit"} variant={"warning"}>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-5">
              <li>
                Use feature branches and pull requests instead of committing
                directly to main
              </li>
              <li>
                Implement branch protection rules to prevent direct commits to
                main
              </li>
            </ul>
          </BestPractices>
        </div>
      </CardContent>
    </Card>
  );
}
