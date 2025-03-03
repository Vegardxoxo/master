import { DataTable } from "@/app/ui/courses/table";
import { repositoryOverviewColumns } from "@/app/ui/courses/columns";
import { getRepos } from "@/app/lib/placeholder-data";
import { fetchRepoOverview } from "@/app/lib/data";
import AddRepos from "@/app/ui/courses/add/add-repos";

interface CoursePageProps {
  name: string;
}

export default async function CoursePage(props: {
  params: Promise<CoursePageProps>;
}) {
  const params = await props.params;
  const name = params.name;
  const repos = getRepos;
  const repoData = await Promise.all(
    repos.map(({ owner, repo }: {owner: string, repo: string}) => fetchRepoOverview(owner, repo)),
  );
  // const data = await getDummyRepoData();

  return (
    <div>
      <div className={"container mx-auto py-10"}>
        <h1 className={"text-2xl text-center"}>Course: {name}</h1>
        <AddRepos />
        <DataTable columns={repositoryOverviewColumns} data={repoData} />
      </div>
    </div>
  );
}
