import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Eye, GitFork, Star } from "lucide-react";
import { getRepoInfo } from "@/app/lib/database-functions/repository-data";
import Link from "next/link";

export default async function ProjectInfo({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { info, success } = await getRepoInfo(owner, repo);
  if (!success || !info) {
    return <div>No project info available to display.</div>;
  }
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          <Link
            href={info.url}
            className={
              "text-blue-500 hover:underline hover:text-blue-600 hover:cursor-pointer"
            }
          >
            {info.name}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Last updated: {new Date(info.updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {info.stars} Stars
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-700">
              {info.forks} Forks
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-gray-700">
              {info.watchers} Watchers
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-gray-700">
              {info.openIssues} Open Issues
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
