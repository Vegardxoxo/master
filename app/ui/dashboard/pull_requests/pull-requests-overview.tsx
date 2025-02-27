"use client";

import { PullRequestData } from "@/app/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PullRequestsMembersTable from "@/app/ui/dashboard/pull_requests/pull-requests-members-table";

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
      "Pull requests merged within 5 minutes of creation",
      data.fastMergedPRs || [],
    );
  };

  return (
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
      <Card
        className="cursor-pointer hover:bg-gray-50"
        onClick={handleFastMergedClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fast-Merged PRs</CardTitle>
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
