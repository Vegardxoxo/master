"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Warning from "@/app/ui/dashboard/alerts/warning";
import { Badge } from "@/components/ui/badge";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { commitsColumns } from "@/app/ui/courses/columns";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";
import { Commit } from "@/app/lib/definitions/definitions";
import { useReport } from "@/app/contexts/report-context";
import { useEffect } from "react";

interface DirectCommitsProps {
  commits: Commit[];
  sortedAuthors: string[];
  authorCount: Record<string, number>;
}

/**
 *
 /**
 * The DirectCommits component is used to display a summary of commits made directly
 * to the main branch, their authors, and provides best practice recommendations
 * to avoid such direct commits.
 *
 * @param commits - Array of commit objects representing direct commits.
 * @param sortedAuthors - Array of author names sorted alphabetically or by contribution count.
 * @param authorCount - Record mapping author names to their respective commit counts.
 * @constructor
 */
export default function DirectCommits({
  commits,
  sortedAuthors,
  authorCount,
}: DirectCommitsProps) {
  const { addMetricData, getRepositoryInfo } = useReport();
  useEffect(() => {
    addMetricData("directCommits", commits.length, [sortedAuthors, authorCount]);
  }, [commits, sortedAuthors, authorCount]);

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
          |
          <GenericDataTable columns={commitsColumns} data={commits} />
          <BestPractices
            title={"Dont commit directly to main"}
            icon={"commit"}
            variant={"warning"}
          >
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
