"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { CommitStats } from "@/app/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommitContributionsTable from "@/app/ui/dashboard/repo/commits/commit-contributions-table";

export default function CommitContributions({
  data,
}: {
  data: Record<string, CommitStats>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<CommitStats | null>(null);
  const chartData = Object.keys(data).map((key) => ({
    name: data[key].name,
    additions: data[key].additions,
    deletions: data[key].deletions,
    co_authored_lines: data[key].co_authored_lines,
    total:
      data[key].additions + data[key].deletions + data[key].co_authored_lines,
    email: key,
    commits: data[key].commits,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 rounded-md shadow-md border border-border">
          <p className="font-bold">{label}</p>
          <p className="text-green-500">Additions: {payload[0].value}</p>
          <p className="text-red-500">Deletions: {payload[1].value}</p>
          <p className="text-orange-500">
            Co-authored lines: {payload[2].value}
          </p>
          <p className="font-semibold">
            Total: {payload[0].value + payload[1].value + payload[2].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    const userEmail = entry.email;
    setSelectedUser(data[userEmail]);
    setIsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributions per group member</CardTitle>
        <CardDescription>Sum of value</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            additions: {
              label: "Additions",
              color: "hsl(142, 76%, 36%)",
            },
            deletions: {
              label: "Deletions",
              color: "hsl(var(--destructive))",
            },
            co_authored_lines: {
              label: "Co-authored Lines",
              color: "hsl(32, 98%, 56%)", // Orange color for co-authored lines
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              className={"hover:cursor-pointer"}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Sum of Values",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar
                className={"hover:cursor-pointer"}
                dataKey="additions"
                stackId="a"
                fill="var(--color-additions)"
                onClick={handleBarClick}
              />
              <Bar
                className={"hover:cursor-pointer"}
                dataKey="deletions"
                stackId="a"
                fill="var(--color-deletions)"
                onClick={handleBarClick}
              />
              <Bar
                className={"hover:cursor-pointer"}
                dataKey="co_authored_lines"
                stackId="a"
                fill="var(--color-co_authored_lines)"
                onClick={handleBarClick}
              >
                <LabelList
                  dataKey="commits"
                  position="top"
                  className={"font-bold "}
                  formatter={(value: string) => `commits: ${value}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[50vh] overflow-auto w-full">
            <DialogHeader className={"h-fit"}>
              <DialogTitle>Commit Details</DialogTitle>
              <DialogDescription className="font-bold">
                Detailed information for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && <CommitContributionsTable data={selectedUser} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
