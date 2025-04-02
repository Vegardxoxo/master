import AddRepoParent from "@/app/ui/courses/add/add-repo-parent";
import {
  getCourseInstance,
  getRepositories,
} from "@/app/lib/database-functions";
import { DataTable } from "@/app/ui/courses/tables/overview-table";
import { repositoryOverviewColumns } from "@/app/ui/courses/columns";
import { fetchRepoOverview } from "@/app/lib/data/data";
import { ReportProvider } from "@/app/contexts/report-context";

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

  //Fetch repositories from database
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
    repositories.map(({ id, username, repoName, url }) =>
      fetchRepoOverview(username, repoName).then((result) => ({
        ...result,
        databaseId: id,
        url: url,
      })),
    ),
  );

  //
  const validRepoData = repoData
    .filter((repo) => repo.data !== null)
    .map((result) => ({
      ...result.data,
      databaseId: result.databaseId,
      url: result.url,
    }));

  const errors = repoData
    .filter((result) => result.error !== null)
    .map((result) => result.error);

  const semesterDisplay =
    semester.toUpperCase() === "SPRING" ? "Spring" : "Autumn";

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

        {errors.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 p-5 mb-8 rounded-xl shadow-md">
            <div className="text-amber-800">
              <p className="font-bold text-lg mb-2">
                ⚠️ Some repositories could not be loaded:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
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
