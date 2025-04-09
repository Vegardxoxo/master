import fetchMilestones from "@/app/lib/data/github-api-functions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CheckCircle2, Clock, Target } from "lucide-react";
import Warning from "@/app/ui/dashboard/alerts/warning";
import Link from "next/link";

export default async function Milestones({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const milestones = await fetchMilestones(owner, repo);
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Repository Milestones
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Progress tracking and development goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <Warning
            title={"  No milestones found for this repository"}
            message={""}
          />
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <Link
                    href={milestone.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {milestone.title}
                  </Link>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      milestone.state === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {milestone.state}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {milestone.description}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      {milestone.closedIssues} closed of {milestone.totalIssues}{" "}
                      issues
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      {Math.round(
                        (milestone.closedIssues / milestone.totalIssues) * 100,
                      ) || 0}
                      % complete
                    </span>
                  </div>
                  {milestone.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700">
                      Created:{" "}
                      {new Date(milestone.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
