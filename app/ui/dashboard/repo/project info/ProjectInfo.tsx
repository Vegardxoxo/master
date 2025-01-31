import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, GitFork, Eye, AlertCircle } from "lucide-react";

interface ProjectInfoProps {
  project: {
    name: string;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    updatedAt: string;
  };
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <Card className={"group hover:bg-sky-500"}>
      <CardHeader className={"group-hover:text-white"}>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className={"group-hover:text-white"}>
          Last updated: {new Date(project.updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className={"group-hover:text-white"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Star className="mr-2" />
            <span>{project.stars} Stars</span>
          </div>
          <div className="flex items-center">
            <GitFork className="mr-2" />
            <span>{project.forks} Forks</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2" />
            <span>{project.watchers} Watchers</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <span>{project.openIssues} Open Issues</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
