"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommitSizeTable from "@/app/ui/dashboard/repo/commits/commit-size-table";

export default function CommitSize({ data }: { data: any[] }) {
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const processedData = useMemo(() => {
    return data.map((commit) => {
      const totalChanges = commit.additions + commit.deletions;
      return {
        ...commit,
        committedDate: new Date(commit.committedDate).getTime(),
        totalChanges: totalChanges === 0 ? 1 : totalChanges,
      };
    });
  }, [data]);

  // Get unique months
  const months = useMemo(() => {
    const uniqueMonths = new Set(
      data.map((commit) => {
        const date = new Date(commit.committedDate);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
      }),
    );
    return Array.from(uniqueMonths).sort();
  }, [data]);

  // Filter data by month
  const filteredData = useMemo(() => {
    if (selectedMonth === "all") return processedData;
    return processedData.filter((commit) => {
      const date = new Date(commit.committedDate);
      const commitMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      return commitMonth === selectedMonth;
    });
  }, [processedData, selectedMonth]);

  const handleCommitClick = (commit: any) => {
    setSelectedCommit(commit);
  };

  const closeDialog = () => {
    setSelectedCommit(null);
  };

  // Unique days for drawing vertical reference lines
  const uniqueDays = useMemo(() => {
    const days = new Set(
      filteredData.map((item) =>
        new Date(item.committedDate).setHours(0, 0, 0, 0),
      ),
    );
    return Array.from(days);
  }, [filteredData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Commit Size Scatter Plot
        </CardTitle>
        <div className="flex justify-end">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>

            {/*Month Selector*/}
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month).toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/*Chart*/}
      <CardContent>
        <ChartContainer
          config={{
            totalChanges: {
              label: "Total Changes",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              {uniqueDays.map((day) => (
                <ReferenceLine
                  key={day}
                  x={day}
                  stroke="hsl(var(--chart-1))"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                />
              ))}

              <XAxis
                dataKey="committedDate"
                name="Date"
                type="number"
                scale="time"
                domain={["dataMin - 86400000", "dataMax + 86400000"]}
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleDateString()
                }
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDataOverflow
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                dataKey="totalChanges"
                name="Total Changes"
                allowDataOverflow
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                label={{
                  value: "Total Changes",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
                scale={"log"}
                domain={[1, "auto"]}
                padding={{ top: 20, bottom: 10 }}
              />

              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => {
                      if (name === "Date") {
                        return [new Date(value).toLocaleString("en-US"), null];
                      }
                      return [`${value} `, name];
                    }}
                  />
                }
              />
              <Scatter
                name="Commits"
                data={filteredData}
                fill="var(--color-totalChanges)"
                onClick={handleCommitClick}
                x="committedDate"
                y="totalChanges"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      {/*Drill-Down*/}
      <Dialog open={Boolean(selectedCommit)} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-4xl h-auto max-h-[50vh] overflow-auto w-full">
          <DialogHeader className={"h-fit"}>
            <DialogTitle>Commit Details</DialogTitle>
            <DialogDescription className="font-bold">
              Detailed information for the selected commit.
            </DialogDescription>
          </DialogHeader>
          {selectedCommit && <CommitSizeTable data={selectedCommit} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
