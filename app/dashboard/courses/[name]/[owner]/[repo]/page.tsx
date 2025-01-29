import {
  fetchBranchDetails,
  fetchBranches,
  fetchRepoDetails,
} from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/courses/breadcrumbs";
import { ContributorsList } from "@/app/ui/dashboard/repo/contributors";
import { ProjectInfo } from "@/app/ui/dashboard/repo/ProjectInfo";
import Branches from "@/app/ui/dashboard/repo/branches";
import { _Branches } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";

export default async function Page(props: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const params = await props.params;
  const owner = params.owner;
  const repo = params.repo;

  const [repoDetails] = await Promise.all([fetchRepoDetails(owner, repo)]);

  return (
    <div className="container mx-auto p-8">
      <div className={"mb-4"}>
        <Link
          href={`https://git.ntnu.no/${owner}/${repo}`}
          className={`${lusitana.className}"text-3xl font-bold  hover:underline`}
        >
          {owner}/{repo}-Dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectInfo project={repoDetails} />
        <ContributorsList contributors={repoDetails.contributors} />
        <Branches owner={owner} repo={repo} branches={repoDetails.branches} />
        <Branches owner={owner} repo={repo} branches={repoDetails.branches} />
      </div>
      <div className={""}>Best Practices</div>
    </div>
  );
}
