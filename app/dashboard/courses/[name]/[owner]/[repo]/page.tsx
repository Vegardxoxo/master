import {
  fetchBranchDetails,
  fetchBranches,
  fetchRepoDetails,
} from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/courses/breadcrumbs";
import { ContributorsList } from "@/app/ui/dashboard/repo/project info/contributors";
import { ProjectInfo } from "@/app/ui/dashboard/repo/project info/ProjectInfo";
import Branches from "@/app/ui/dashboard/repo/project info/branches";
import { _Branches } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CommitFrequency from "@/app/ui/dashboard/repo/commits/commit-frequency";

export default async function Page(props: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const params = await props.params;
  const owner = params.owner;
  const repo = params.repo;

  const [repoDetails] = await Promise.all([fetchRepoDetails(owner, repo)]);

  return (
    // Repo name
    <div className="container mx-auto p-8">
      <div className={"mb-4 text-3xl font-bold"}>
        <Link
          href={`https://git.ntnu.no/${owner}/${repo}`}
          className={`${lusitana.className}"text-3xl font-bold  hover:underline text-blue-600`}
        >
          {owner}/{repo}-Dashboard
        </Link>
      </div>

      {/* General information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Repository Overview</CardTitle>
          <CardDescription>General information and contributors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:flex md:flex-row md:justify-between space-x-4">
          <ProjectInfo project={repoDetails} />
          <ContributorsList contributors={repoDetails.contributors} />
        </CardContent>
      </Card>

      {/* Commit Card*/}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Commit Analysis</CardTitle>
          <CardDescription>Quality and frequency of commits</CardDescription>
        </CardHeader>
        <CardContent>
          <CommitFrequency repo={repo} owner={owner} />
        </CardContent>
      </Card>

      {/* Branches Card*/}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Branching Strategy</CardTitle>
          <CardDescription>
            Analysis of branch usage and best practices
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Pull Request Card*/}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pull Request Analysis</CardTitle>
          <CardDescription>
            Review process and PR status overview
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
