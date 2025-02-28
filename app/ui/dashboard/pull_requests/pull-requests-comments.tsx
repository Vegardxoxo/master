"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PullRequestData } from "@/app/lib/definitions";
import PullRequestsMembersTable from "@/app/ui/dashboard/pull_requests/pull-requests-members-table";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];
export function PullRequestsComments({ data }: { data: PullRequestData }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any[] | null>(null);

  const handleDataClick = (data: any) => {
    setSelectedMetric(data.name);
    setSelectedData(
      data.reviewsByMember ? data.reviewsByMember[data.name].prs : data.prs,
    );
    setIsDialogOpen(true);
  };

  const commentsByMembers = Object.entries(data.commentsByMembers || {}).map(
    ([name, count]) => ({ name, count }),
  );





  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-md shadow-md border border-border">
          <p className={"font-bold"}>{payload[0].value}</p>
          <p>Comments: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pull Request Metrics</CardTitle>
        <CardDescription>
          Detailed analysis of pull request activity
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {commentsByMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Comments per Group Member
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis type="category" dataKey="name" name="Member" />
                  <YAxis type="number" dataKey="count" name="Comments" />
                  <ZAxis type="number" range={[100, 1000]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={<CustomTooltip />}
                  />

                  <Legend />
                  <Scatter
                    name="Comments Made"
                    data={commentsByMembers}
                    fill="#8884d8"
                  >
                    {commentsByMembers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Details for {selectedMetric}</DialogTitle>
              <DialogDescription>
                Detailed information about reviews made by this member.
              </DialogDescription>
            </DialogHeader>
            <PullRequestsMembersTable data={selectedData || []} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
