"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import { DevelopmentBranchColumns } from "@/app/ui/courses/columns";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";
import { useReport } from "@/app/contexts/report-context";
import { useEffect, useMemo } from "react";

interface DevelopmentBranchesProps {
  totalBranches: number;
  linkedBranches: number;
  unlinkedBranches: number;
  linkPercentage: number;
  branchConnections: any;
  addToReport: boolean;
}

export default function BranchConnections({
  linkedBranches,
  unlinkedBranches,
  totalBranches,
  linkPercentage,
  branchConnections,
  addToReport,
}: DevelopmentBranchesProps) {
  const { addMetricData } = useReport();

  const metrics = useMemo(() => {
    return {
      linkedBranches,
      unlinkedBranches,
      totalBranches,
      linkPercentage,
    };
  }, [linkedBranches, unlinkedBranches, totalBranches, linkPercentage]);

  useEffect(() => {
    if (addToReport) {
      addMetricData("branchConnections", branchConnections, metrics);
    }
  }, [metrics]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Branch-Issue Connection Analysis
        </CardTitle>
        <CardDescription>
          Analyzing how development branches are connected to issues. Note: main
          and master branches are not analyzed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBranches}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Linked to Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {linkedBranches}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unlinked Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {unlinkedBranches}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Branch-Issue Connection Rate</span>
              <span className="font-medium">{linkPercentage}%</span>
            </div>
            <Progress
              value={linkPercentage}
              className="h-2 [&>div]:bg-blue-500"
            />
          </div>

          {/* Branches Table */}
          <div className="rounded-md border">
            <GenericDataTable
              columns={DevelopmentBranchColumns}
              data={branchConnections}
            />
          </div>
          <BestPractices
            title={"Develop Using Branches"}
            icon={"branch"}
            variant={"info"}
          >
            <ul className="space-y-1 list-disc pl-5">
              <li>
                Use branches to make changes without affecting the main codeline
              </li>
              <li>
                Track the running history of changes in a dedicated branch
              </li>
              <li>
                Merge code into the main branch only when it's ready and tested
              </li>
              <li>
                Branching organizes development and keeps work-in-progress
                separate from stable code
              </li>
              <li>
                Protect users from bugs and vulnerabilities by testing changes
                in branches first
              </li>
              <li>
                Identify and fix issues more easily in isolated branch
                environments
              </li>
              <li>
                Maintain a stable main branch that always contains
                production-ready code
              </li>
            </ul>
          </BestPractices>
        </div>
      </CardContent>
    </Card>
  );
}
