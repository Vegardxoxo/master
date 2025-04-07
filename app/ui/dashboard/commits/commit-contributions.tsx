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
import type { CommitStats } from "@/app/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CommitContributionsTable from "@/app/ui/dashboard/commits/commit-contributions-table";
import { Button } from "@/app/ui/button";
import { exportChart, uploadChartToServer } from "@/app/ui/chart-utils";
import { Download } from "lucide-react";
import { useReport } from "@/app/contexts/report-context";

const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const minHeight = 5;
  const barHeight = Math.max(height, minHeight);

  const adjustedY = height < minHeight ? y - (minHeight - height) : y;

  return (
    <rect x={x} y={adjustedY} width={width} height={barHeight} fill={fill} />
  );
};

interface CommitContributionsProps {
  data: Record<string, CommitStats>;
  projectAverageChanges: number;
  projectAverageFilesChanged: number;
  url: string | undefined;
}

export default function CommitContributions({
  data,
  projectAverageChanges,
  projectAverageFilesChanged,
  url,
}: CommitContributionsProps) {
  console.log("projectAverageChanges", projectAverageChanges);
  console.log("projectAverageFilesChanged", projectAverageFilesChanged);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<CommitStats | null>(null);
  const [imageUrl, setImageUrl] = useState(url);
  const [isUploading, setIsUploading] = useState(false);
  // context store
  const { getRepositoryInfo, addMetricData } = useReport();
  const info = getRepositoryInfo();

  const chartData = Object.keys(data).map((key) => ({
    name: data[key].name,
    additions: data[key].additions,
    deletions: data[key].deletions,
    co_authored_lines: data[key].co_authored_lines,
    total:
      data[key].additions + data[key].deletions + data[key].co_authored_lines,
    email: key,
    commits: data[key].commits,
    average_changes: data[key].average_changes,
    total_files_changed: data[key].total_files_changed,
    average_files_changed: data[key].average_files_changed,
  }));
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const metrics = {
      contributors: chartData.map((entry) => {
        return {
          name: entry.name,
          additions: entry.additions,
          deletions: entry.deletions,
          total: entry.total,
          co_authored_lines: entry.co_authored_lines,
          email: entry.email,
          commits: entry.commits,
          average_changes: entry.average_changes,
          average_files_changed: entry.average_files_changed,
        };
      }),
      url: imageUrl,
      includeImage: !!imageUrl,
      groupAverageChanges: projectAverageChanges,
      groupAverageFilesChanged: projectAverageFilesChanged,
    };

    addMetricData("commitContributions", data, metrics);
  }, [data]);

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

  const handleBarClick = (barData: any) => {
    setSelectedUser(data[barData.email]);
    setIsOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div>
            <CardTitle className="text-2xl font-bold">
              Contributions per Group Member
            </CardTitle>
            <CardDescription>
              Distribution of additions, deletions, and co-authored lines
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={() => {
            uploadChartToServer({
              chartType: "CONTRIBUTIONS",
              chartRef: chartRef,
              setIsUploading: setIsUploading,
              owner: info.owner,
              repo: info.repo,
            }).then((r) => {
              if (typeof r === "string") {
                setImageUrl(r);
              }
            });
          }}
          disabled={isUploading}
        >
          <Download className="mr-2 h-4 w-4" />
          {imageUrl ? "Replace chart" : "Upload Chart"}
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer
          ref={chartRef}
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
              color: "hsl(32, 98%, 56%)",
            },
          }}
          className="h-[600px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 40, left: 60, bottom: 80 }}
            >
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const name = payload.value;
                  const displayName =
                    name.length > 15 ? `${name.substring(0, 12)}...` : name;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="#666"
                        fontSize={13}
                        transform="rotate(-45)"
                      >
                        {displayName}
                      </text>
                      <title>{name}</title>
                    </g>
                  );
                }}
              />
              <YAxis
                label={{
                  value: "Lines of Code",
                  angle: -90,
                  position: "insideLeft",
                  offset: -45,
                  style: { fontSize: "14px", textAnchor: "middle" },
                }}
                tick={{ fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="additions"
                stackId="a"
                fill="var(--color-additions)"
                shape={<CustomBar />}
                minPointSize={5}
              />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="deletions"
                stackId="a"
                fill="var(--color-deletions)"
                shape={<CustomBar />}
                minPointSize={5}
              />
              <Bar
                onClick={(barData) => handleBarClick(barData)}
                className="hover:cursor-pointer"
                dataKey="co_authored_lines"
                stackId="a"
                fill="var(--color-co_authored_lines)"
                shape={<CustomBar />}
                minPointSize={5}
              >
                <LabelList
                  dataKey="commits"
                  position="top"
                  content={({ value, x, y, width }) => (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 12}
                      fill="#000000"
                      textAnchor="middle"
                      fontSize={13}
                    >
                      {`${value} commits`}
                    </text>
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Click on a bar to view detailed contribution information
        </div>

        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold mb-3">
            Member vs. Project Averages
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Average Changes per Commit
                </span>
                <span className="text-sm font-bold">
                  Project: {projectAverageChanges.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {Object.keys(data).map((email) => (
                  <div
                    key={`changes-${email}`}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-xs truncate max-w-[150px]"
                      title={data[email].name}
                    >
                      {data[email].name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {data[email].average_changes.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs ${data[email].average_changes > projectAverageChanges ? "text-green-500" : "text-orange-500"}`}
                      >
                        {data[email].average_changes > projectAverageChanges
                          ? "↑"
                          : "↓"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Average Files per Commit
                </span>
                <span className="text-sm font-bold">
                  Project: {projectAverageFilesChanged.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                {Object.keys(data).map((email) => (
                  <div
                    key={`files-${email}`}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-xs truncate max-w-[150px]"
                      title={data[email].name}
                    >
                      {data[email].name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {data[email].average_files_changed.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs ${data[email].average_files_changed > projectAverageFilesChanged ? "text-green-500" : "text-orange-500"}`}
                      >
                        {data[email].average_files_changed >
                        projectAverageFilesChanged
                          ? "↑"
                          : "↓"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/*Drill-down*/}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader className="h-fit">
              <DialogTitle className="text-2xl font-bold">
                Commit Details
              </DialogTitle>
              <DialogDescription className="text-lg font-semibold">
                Detailed information for {selectedUser && selectedUser.name}.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && <CommitContributionsTable data={selectedUser} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
