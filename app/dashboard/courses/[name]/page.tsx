import { DataTable } from "@/app/ui/courses/table";
import { columns } from "@/app/ui/courses/columns";
import {getData, getDummyRepoData, studentRepos} from "@/app/lib/placeholder-data";
import { fetchRepoOverview } from "@/app/lib/data";

interface CoursePageProps {
  name: string;
}

export default async function CoursePage(props: {
  params: Promise<CoursePageProps>;
}) {

  const params = await props.params;
  const name = params.name;
  // const repoData = await Promise.all(
  //   studentRepos.map(({ owner, repo }) => fetchRepoOverview(owner, repo)),
  // );
    const data = await getDummyRepoData();

  return (
    <div>
      <h1 className={"text-2xl text-center"}>Course: {name}</h1>
      <div className={"container mx-auto py-10"}>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
