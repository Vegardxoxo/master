"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PullRequestOverviewTable from "@/app/ui/dashboard/pull_requests/pull-request-overview-table";
import type { PullRequestData } from "@/app/lib/definitions";

type DialogData = {
  title: string;
  description: string;
  data: any[];
};

export function PullRequestOverview({ data }: { data: PullRequestData }) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);

  const prsByMemberData = Object.entries(data.prsByMember || {}).map(
    ([name, { count, prs }]) => ({ name, count, prs }),
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const openDialog = (title: string, description: string, tableData: any[]) => {
    setDialogData({ title, description, data: tableData });
    setIsDialogOpen(true);
  };

  const handleFastMergedClick = () => {
    openDialog(
      "Fast-Merged Pull Requests",
      "Pull requests merged within 5 minutes of creation",
      data.fastMergedPRs || [],
    );
  };

  const handleBarClick = (entry: any) => {
    console.log("entry", entry)
    openDialog(
      `Pull Requests by ${entry.name}`,
      `Detailed view of pull requests created by ${entry.name}`,
      entry.prs || [],
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Overview</CardTitle>
        <CardDescription>Summary of pull request activity</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPRs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.openPRs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                PRs With Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.prsWithReview || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                PRs Without Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.prsWithoutReview || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Time to Merge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data.averageTimeToMerge || 0).toFixed(2)} hours
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleFastMergedClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fast-Merged PRs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.fastMergedPRs?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click to view details
              </p>
            </CardContent>
          </Card>
        </div>

        {/*Chart*/}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Pull Requests by Group Member
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prsByMemberData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  className={"hover:cursor-pointer"}
                  dataKey="count"
                  fill="#8884d8"
                  onClick={handleBarClick}
                >
                  {prsByMemberData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/*Drill-Down*/}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader className={"h-fit"}>
              <DialogTitle className="text-2xl font-bold">
                {dialogData?.title}
              </DialogTitle>
              <DialogDescription>{dialogData?.description}</DialogDescription>
            </DialogHeader>
            <PullRequestOverviewTable data={dialogData?.data || []} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
