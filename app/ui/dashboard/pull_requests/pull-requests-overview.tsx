"use client";

import { PullRequestData } from "@/app/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PullRequestsMembersTable from "@/app/ui/dashboard/pull_requests/pull-requests-members-table";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

type DialogData = {
  title: string;
  description: string;
  data: any[];
};

export default function PullRequestsOverview({
  data,
}: {
  data: PullRequestData;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [fastMergeThreshold, setFastMergeThreshold] = useState<number>(5);
  const [fastMergedPRs, setFastMergedPRs] = useState<any[]>([]);

  useEffect(() => {
    const filteredPRs = data.prsByMember
      ? Object.values(data.prsByMember)
          .flatMap((member) => member.prs)
          .filter((pr) => {
            if (pr.merged_at) {
              const createDate = new Date(pr.created_at);
              const mergeDate = new Date(pr.merged_at);
              const timeDiffMinutes =
                (mergeDate.getTime() - createDate.getTime()) / (1000 * 60);
              return timeDiffMinutes <= fastMergeThreshold;
            }
            return false;
          })
      : [];
    setFastMergedPRs(filteredPRs);
  }, [data, fastMergeThreshold]);

  const openDialog = (title: string, description: string, data: any[]) => {
    const formattedData = data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      user: pr.user,
      created_at: pr.created_at,
      closed_at: pr.closed_at || pr.merged_at,
      url: pr.url,
    }));
    setDialogData({ title, description, data: formattedData });
    setIsDialogOpen(true);
  };

  const handleFastMergedClick = () => {
    openDialog(
      "Fast-Merged Pull Requests",
      `Pull requests merged within ${fastMergeThreshold} minutes of creation`,
      fastMergedPRs,
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="text-2xl font-bold">{fastMergedPRs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view details
            </p>
          </CardContent>
        </Card>

        {/* Average Time to Merge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Time to Merge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageTimeToMerge
                ? `${data.averageTimeToMerge.toFixed(2)} hrs`
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        {/* Label Counts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Label Counts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.labelCounts ? Object.keys(data.labelCounts).length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total distinct labels used
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {data.labelCounts &&
                Object.entries(data.labelCounts).map(
                  ([labelName, labelInfo]) => (
                    <Badge
                      key={labelName}
                      variant="outline"
                      className="bg-opacity-20"
                      style={{
                        backgroundColor: `#${labelInfo.color || "ededed"}20`,
                        borderColor: `#${labelInfo.color || "ededed"}`,
                      }}
                    >
                      {labelName} ({labelInfo.count})
                    </Badge>
                  ),
                )}
            </div>
          </CardContent>
        </Card>

        {/* Total Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalComments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all pull requests
            </p>
          </CardContent>
        </Card>
      </div>
      {/*Slider*/}
      <div className="space-y-2">
        <label htmlFor="fast-merge-threshold" className="text-sm font-medium">
          Fast-Merge Threshold (minutes): {fastMergeThreshold}
        </label>
        <Slider
          id="fast-merge-threshold"
          min={1}
          max={60}
          step={1}
          value={[fastMergeThreshold]}
          onValueChange={(value) => setFastMergeThreshold(value[0])}
        />
      </div>
      {/*Drill-down*/}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
          <DialogHeader className={"h-fit"}>
            <DialogTitle className="text-2xl font-bold">
              {dialogData?.title}
            </DialogTitle>
            <DialogDescription>{dialogData?.description}</DialogDescription>
          </DialogHeader>
          <PullRequestsMembersTable data={dialogData?.data || []} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
