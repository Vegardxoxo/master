"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PullRequestData } from "@/app/lib/definitions/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PullRequestsMembersTable from "@/app/ui/dashboard/pull_requests/pull-requests-members-table";
import { createChartData } from "@/app/lib/utils/utils";
import { useReport } from "@/app/contexts/report-context";
import { Button } from "@/app/ui/button";
import { uploadChartToServer } from "@/app/ui/chart-utils";
import { Download } from "lucide-react";
import { transformPullRequestActivityData } from "@/app/lib/utils/pull-requests-utils";
import {COLORS} from "@/app/lib/placeholder-data";

type DialogData = {
  title: string;
  description: string;
  data: any[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow">
        <p className="font-bold">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} PRs`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export function PullRequestsMembers({
  data,
  url,
}: {
  data: PullRequestData;
  url: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const members = Object.keys(data.prsByMember);
  const milestones = Array.from(data.milestones);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");
  const chartData = createChartData(data, selectedMembers, selectedMilestone);
  const { addMetricData, getRepositoryInfo, addImageUrls } = useReport();

  const info = getRepositoryInfo();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageURL, setImageURL] = useState<string | undefined>(url);

  const memberColors = useMemo(() => {
    return members.reduce(
      (acc, member, index) => {
        acc[member] = COLORS[index % COLORS.length];
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [members]);

  const openDialog = (title: string, description: string, tableData: any[]) => {
    const formattedData = tableData.map((pr) => ({
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

  const toggleMember = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member],
    );
  };

  const toggleAllMembers = () => {
    setSelectedMembers((prev) =>
      prev.length === members.length ? [] : [...members],
    );
  };

  const handleChartClick = (props: any) => {
    if (props?.activePayload?.length > 0) {
      const clickedDate = props.activePayload[0].payload.date;

      // Get the total count from the chart for verification
      const totalChartCount = selectedMembers.reduce((sum, member) => {
        return sum + (props.activePayload[0].payload[member] || 0);
      }, 0);

      // Filter PRs by the clicked date
      const relevantPRs = selectedMembers.flatMap(
        (member) =>
          data.prsByMember[member]?.prs.filter((pr: any) => {
            const prDate = new Date(pr.created_at).toISOString().split("T")[0];
            return prDate === clickedDate;
          }) || [],
      );

      console.log(
        `Chart shows ${totalChartCount} PRs, found ${relevantPRs.length} PRs for ${clickedDate}`,
      );

      if (relevantPRs.length > 0) {
        openDialog(
          `Pull Requests on ${clickedDate} (${relevantPRs.length})`,
          `Showing all pull requests created by ${selectedMembers.join(", ")} on ${clickedDate}`,
          relevantPRs,
        );
      }
    }
  };

  if (!data || !data.totalPRs) {
    console.log("PullRequestsMembers - No data or totalPRs is 0");
    return null;
  }

  const metrics = useMemo(() => {
    return {
      totalPRs: data.totalPRs,
      openPRs: data.openPRs,
      closedPRs: data.closedPRs,
      averageTimeToMerge: data.averageTimeToMerge,
      prsByMember: data.prsByMember,
      reviewsByMember: data.reviewsByMember,
      commentsByMembers: data.commentsByMembers,
      prsWithReview: data.prsWithReview,
      prsWithReviewPercentage:
        Math.round((data.prsWithReview / data.totalPRs) * 100) || 0,
      prsWithoutReviewPercentage:
        Math.round((data.prsWithoutReview / data.totalPRs) * 100) || 0,
      prsWithoutReview: data.prsWithoutReview,
      averageCommentsPerPR: data.averageCommentsPerPR,
      labelCounts: data.labelCounts,
      totalComments: data.totalComments,
      url: imageURL,
      includeImage: !!imageURL,
    };
  }, [data]);

  useEffect(() => {
    const tableData = transformPullRequestActivityData(metrics);
    addMetricData("pullRequests", tableData, metrics);
    addImageUrls("pullRequests", [imageURL ? imageURL : ""]);
  }, [data]);


  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div>
            <CardTitle className="text-2xl font-bold">
              Pull Request Overview
            </CardTitle>
            <CardDescription>Summary of pull request activity</CardDescription>
          </div>
        </div>
        <Button
          onClick={() => {
            uploadChartToServer({
              chartType: "PULL_REQUESTS",
              chartRef: chartRef,
              setIsUploading: setIsUploading,
              owner: info.owner,
              repo: info.repo,
            }).then((r) => {
              if (typeof r === "string") {
                setImageURL(r);
              }
            });
          }}
          disabled={isUploading}
        >
          <Download className="mr-2 h-4 w-4" />
          {imageURL ? "Replace chart" : "Upload Chart"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Pull Requests by Group Member
            </h3>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-members"
                  checked={selectedMembers.length === members.length}
                  onCheckedChange={toggleAllMembers}
                />
                <Label htmlFor="all-members" className="text-sm font-medium">
                  All
                </Label>
              </div>
              {members.map((member, index) => (
                <div key={member} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member}`}
                    checked={selectedMembers.includes(member)}
                    onCheckedChange={() => toggleMember(member)}
                  />
                  <Label
                    htmlFor={`member-${member}`}
                    className="text-sm font-medium"
                    style={{ color: memberColors[member] }}
                  >
                    {member}
                  </Label>
                </div>
              ))}
            </div>

            {milestones.length > 1 && (
              <div className="mb-4 flex justify-end">
                <Select
                  value={selectedMilestone}
                  onValueChange={setSelectedMilestone}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Milestones</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone} value={milestone}>
                        {milestone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <ResponsiveContainer width="100%" height={400} ref={chartRef}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <XAxis
                  dataKey="date"
                  tickLine={true}
                  axisLine={true}
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={12}
                  tickLine={true}
                  axisLine={true}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedMembers.map((member, index) => (
                  <Line
                    key={member}
                    type="monotone"
                    dataKey={member}
                    stroke={memberColors[member]}
                    activeDot={{ r: 8, onClick: (e) => console.log(e) }}
                    dot={{ fill: memberColors[member], r: 4 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
}
