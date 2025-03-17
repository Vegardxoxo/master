import AddRepoParent from "@/app/ui/courses/add/add-repo-parent";
import {
  getCourseInstance,
  getRepositories,
} from "@/app/lib/database-functions";
import { DataTable } from "@/app/ui/courses/table";
import { repositoryOverviewColumns } from "@/app/ui/courses/columns";
import { fetchRepoOverview } from "@/app/lib/data";

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

  // Fetch repositories from database
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

  // Fetch data from the github api
  const repoData = await Promise.all(
    repositories.map(({ id, username, repoName }) =>
      fetchRepoOverview(username, repoName).then((result) => ({
        ...result,
        databaseId: id,
      })),
    ),
  );

  //
  const validRepoData = repoData
    .filter((repo) => repo.data !== null)
    .map((result) => ({
      ...result.data,
      databaseId: result.databaseId,
    }));



  const errors = repoData
    .filter((result) => result.error !== null)
    .map((result) => result.error);

  const semesterDisplay =
    semester.toUpperCase() === "SPRING" ? "Spring" : "Autumn";

  return (
    <div>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">{courseCode}</h1>
          <h2 className="text-xl text-muted-foreground text-center">
            {semesterDisplay} {year}
          </h2>
        </div>

        {errors.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="text-yellow-700">
              <p className="font-medium">
                Some repositories could not be loaded:
              </p>
              <ul className="list-disc ml-5 mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <AddRepoParent courseInstanceId={courseInstance.id} />
        <DataTable columns={repositoryOverviewColumns} data={validRepoData} />
      </div>
    </div>
  );
}
