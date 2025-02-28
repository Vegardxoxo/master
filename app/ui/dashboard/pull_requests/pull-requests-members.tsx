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
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {useMemo, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PullRequestData } from "@/app/lib/definitions";
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
import { createChartData } from "@/app/lib/utils";

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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#a65628",
  "#f781bf",
  "#999999",
  "#e41a1c",
  "#377eb8",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33",
  "#a6cee3",
  "#1f78b4",
  "#b2df8a",
];

export function PullRequestsMembers({ data }: { data: PullRequestData }) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const members = Object.keys(data.prsByMember);
  const milestones = Array.from(data.milestones);

  const [selectedMembers, setSelectedMembers] = useState<string[]>(members);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");

  const chartData = createChartData(data, selectedMembers, selectedMilestone);

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
      const relevantPRs = selectedMembers.flatMap(
        (member) =>
          data.prsByMember[member]?.prs.filter(
            (pr: any) =>
              new Date(pr.created_at).toISOString().split("T")[0] ===
              clickedDate,
          ) || [],
      );

      if (relevantPRs.length > 0) {
        openDialog(
          `Pull Requests on ${clickedDate}`,
          `Showing all pull requests created by ${selectedMembers.join(", ")} on ${clickedDate}`,
          relevantPRs,
        );
      }
    }
  };

  if (!data?.totalPRs) return null;

  if (!data || !data.totalPRs) {
    console.log("PullRequestsMembers - No data or totalPRs is 0");
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Overview</CardTitle>
        <CardDescription>Summary of pull request activity</CardDescription>
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
              <div className="mb-4">
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
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedMembers.map((member, index) => (
                  <Bar
                    key={member}
                    dataKey={member}
                    stackId="a"
                    fill={memberColors[member]}
                  />
                ))}
              </BarChart>
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
