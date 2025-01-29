import { AddRepository } from "@/app/ui/courses/add/add-repo-manually";
import { AddRepositoryClassroom } from "@/app/ui/courses/add/add-repo-classrooms";

import { DataTable } from "@/app/ui/courses/table";
import { repositoryOverviewColumns } from "@/app/ui/courses/columns";
import { getDummyRepoData } from "@/app/lib/placeholder-data";
import { AddCourse } from "@/app/ui/courses/add/add-course";

export default async function Page() {
  const data = await getDummyRepoData();
  return (
    <div className={"flex justify-center"}>
      <AddCourse />
    </div>
  );
}
