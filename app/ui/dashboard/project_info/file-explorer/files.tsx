import { getRepositoryFiles } from "@/app/lib/database-functions";
import {FileExplorer} from "@/app/ui/dashboard/project_info/file-explorer/file-explorer";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default async function Files({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const files = await getRepositoryFiles(owner, repo);
  if (!files || files.fileSet?.files.length === 0) {
    return <div>No files available to display.</div>;
  }

    if (files.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">
          List of files of the repository is unavailable.
        </h2>
        <p className="text-red-600">
          Run the GitHub action to generate the list of files.
        </p>
      </div>
    );
  }


return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Repository Files</CardTitle>
        <CardDescription>
          Viewing files for repository: <span className="font-medium">{repo}</span> by {owner}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FileExplorer files={files.fileSet?.files || []} repoName={repo} />
      </CardContent>
    </Card>
  );

}
