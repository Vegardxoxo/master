import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, GitFork, Eye, AlertCircle } from "lucide-react";
import { fetchProjectInfo } from "@/app/lib/data";

export default async function ProjectInfo({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const data = await fetchProjectInfo(owner, repo);
  return (
    <Card className={"group hover:bg-sky-500 md:w-2/3"}>
      <CardHeader className={"group-hover:text-white"}>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription className={"group-hover:text-white"}>
          Last updated: {new Date(data.updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className={"group-hover:text-white"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Star className="mr-2" />
            <span>{data.stars} Stars</span>
          </div>
          <div className="flex items-center">
            <GitFork className="mr-2" />
            <span>{data.forks} Forks</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2" />
            <span>{data.watchers} Watchers</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <span>{data.openIssues} Open Issues</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
