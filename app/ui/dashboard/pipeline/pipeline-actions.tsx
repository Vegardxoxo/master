import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWorkflowRuns } from "@/app/lib/database-functions/repository-data";

// Helper function to format time in a human-readable way
function formatTime(seconds: number): string {
  if (!seconds) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default async function WorkflowRunsInfo({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const runs = await getWorkflowRuns(owner, repo);

  if (!runs) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">No runs found.</h2>
      </div>
    );
  }

  const successfulRuns = runs.workflow_runs.filter(
    (run) => run.conclusion === "success",
  ).length;
  const failedRuns = runs.workflow_runs.filter(
    (run) => run.conclusion === "failure",
  ).length;

  const recoveryTimes: number[] = [];

  runs.workflow_runs.forEach((run, index) => {
    if (run.conclusion === "failure") {
      const nextSuccess = runs.workflow_runs
        .slice(index + 1)
        .find((r) => r.conclusion === "success");
      if (nextSuccess) {
        const failureTime = new Date(run.created_at).getTime();
        const successTime = new Date(nextSuccess.created_at).getTime();
        recoveryTimes.push((successTime - failureTime) / 1000);
      }
    }
  });

  const averageRecoveryTime =
    recoveryTimes.length > 0
      ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length
      : 0;

  // Success rate calculation
  const successRate =
    runs.workflow_runs.length > 0
      ? Math.round((successfulRuns / runs.workflow_runs.length) * 100)
      : 0;

  // Sort by created_at date to get the most recent run
  const latestRun = [...runs.workflow_runs].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Workflow Runs
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {runs.total_count} total runs - Latest:{" "}
          {latestRun
            ? new Date(latestRun.created_at).toLocaleDateString()
            : "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {successfulRuns} Successful ({successRate}%)
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Number of workflow runs that completed successfully and their
                  percentage of the total runs.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {failedRuns} Failed Runs
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of workflow runs that failed during execution.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Avg Recovery: {formatTime(averageRecoveryTime)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Average time between a failed run and the next successful run.
                  Measures how quickly issues are resolved.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Latest Status:{" "}
                    {latestRun
                      ? latestRun.conclusion || latestRun.status
                      : "N/A"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Status of the most recent workflow run across all actions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
