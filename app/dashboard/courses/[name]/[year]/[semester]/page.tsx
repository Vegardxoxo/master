import AddRepoParent from "@/app/ui/courses/add/add-repo-parent";
import {
  getCourseInstance,
  getRepositories,
} from "@/app/lib/database-functions";
import { DataTable } from "@/app/ui/courses/tables/overview-table";
import { repositoryOverviewColumns } from "@/app/ui/courses/columns";
import { PlusCircle } from "lucide-react";
import { DeleteCourseInstance } from "@/app/ui/courses/buttons";

interface pageProps {
  name: string;
  semester: string;
  year: string;
}

export default async function CoursePage(props: {
  params: Promise<pageProps>;
}) {
  const { name: courseCode, semester, year } = await props.params;
  const yearNum = Number.parseInt(year, 10);

  const { courseInstance, error: instanceError } = await getCourseInstance(
    courseCode,
    yearNum,
    semester,
  );

  if (instanceError || !courseInstance) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl text-center text-red-500">
          Error: {instanceError || "Course instance not found"}
        </h1>
      </div>
    );
  }

  const { repositories, error: repoError } = await getRepositories(
    courseInstance.id,
  );

  if (repoError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl text-center text-red-500">
          Error: {repoError}
        </h1>
      </div>
    );
  }

  const semesterDisplay =
    semester.toUpperCase() === "SPRING" ? "Spring" : "Autumn";

  const hasRepositories = repositories && repositories.length > 0;

  return (
    <div>
      <div className="min-h-screen p-6 w-3/4 mx-auto">
        {/* Header with gradient background */}
        <div className="mb-8 bg-gradient-to-r from-blue-300 to-sky-500 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold text-center mb-2">{courseCode}</h1>
          <h2 className="text-xl text-center opacity-90">
            {semesterDisplay} {year}
          </h2>
        </div>
        <div className={"flex justify-end mb-2"}>  <DeleteCourseInstance id={courseInstance.id} /></div>


          <AddRepoParent courseInstanceId={courseInstance.id} />

        {hasRepositories ? (
          <div className="mt-8">
            <DataTable
              columns={repositoryOverviewColumns}
              data={repositories}
            />
          </div>
        ) : (
          <div className="mt-12 text-center p-10 border border-dashed rounded-lg bg-gray-50">
            <div className="flex flex-col items-center justify-center space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                No repositories yet
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Get started by adding your first repository using the form
                above. Once added, your repositories will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
