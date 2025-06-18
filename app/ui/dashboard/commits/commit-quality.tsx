"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import type { LLMResponse } from "@/app/lib/definitions/definitions";
import { useCallback, useEffect, useState } from "react";
import CommitQualityTable from "@/app/ui/dashboard/commits/commit-quality-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";
import { useReport } from "@/app/contexts/report-context";

interface ActiveShape {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: any;
  percent: number;
  value: number;
}

export default function CommitQuality({ data }: { data: LLMResponse[] }) {
  const { addMetricData } = useReport();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Process data and add to report context
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate category counts
    const categoryCounts = data.reduce<Record<string, number>>(
      (acc, commit) => {
        if (!acc[commit.category]) {
          acc[commit.category] = 0;
        }
        acc[commit.category]++;
        return acc;
      },
      {},
    );

    // Calculate metrics
    const totalCommits = data.length;
    const excellentPercentage =
      ((categoryCounts["Excellent"] || 0) / totalCommits) * 100;
    const goodPercentage = ((categoryCounts["Good"] || 0) / totalCommits) * 100;
    const needsImprovementPercentage =
      ((categoryCounts["Needs Improvement"] || 0) / totalCommits) * 100;

    // Calculate overall quality score (0-10)
    const qualityScore =
      (excellentPercentage * 1 +
        goodPercentage * 0.6 +
        needsImprovementPercentage * 0.2) /
      10;

    // Prepare metrics for report
    const metrics = {
      totalCommits,
      categoryCounts,
      excellentPercentage: excellentPercentage.toFixed(1),
      goodPercentage: goodPercentage.toFixed(1),
      needsImprovementPercentage: needsImprovementPercentage.toFixed(1),
      qualityScore: qualityScore.toFixed(1),
      qualityStatus:
        qualityScore >= 7 ? "good" : qualityScore >= 4 ? "moderate" : "poor",
      justifications: data.map((value) => ({
        commit_message: value.commit_message,
        reason: value.reason,
        category: value.category,
        url: value.url,
      })),
    };

    // Add data and metrics to the report context
    addMetricData("commitQuality", data, metrics);
  }, [data, addMetricData]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const renderActiveShape = (props: ActiveShape) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          className="text-sm"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#666"
          className="text-xs"
        >
          {`${value} commits (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const categoryCounts = data.reduce<Record<string, number>>((acc, commit) => {
    if (!acc[commit.category]) {
      acc[commit.category] = 0;
    }
    acc[commit.category]++;
    return acc;
  }, {});

  const messageQuality = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      name: category,
      value: count,
    }),
  );

  const colorMap: Record<string, string> = {
    "Needs Improvement": "hsl(0, 84%, 60%)",
    Good: "hsl(45, 93%, 47%)",
    Excellent: "hsl(142, 76%, 36%)",
  };

  const handlePieClick = (entry: any) => {
    setSelectedCategory(entry.name);
    setIsOpen(true);
  };

  const filteredData = selectedCategory
    ? data.filter((commit) => commit.category === selectedCategory)
    : [];

  if (!data || data.length === 0) {
    return <p>No commit data available.</p>;
  }

  return (
    <Card className="w-full gap-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Commit Message Quality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-lg font-semibold mb-4">
          Total Commits: {data.length}
        </p>
        <ChartContainer config={{}} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={messageQuality}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {messageQuality.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          {messageQuality.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-center gap-2"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: colorMap[entry.name] }}
              />
              <span className="text-sm lg:text-base font-semibold">
                {entry.name}: {entry.value} (
                {((entry.value / data.length) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">
                Commit Details
              </DialogTitle>
              <DialogDescription className="text-lg font-semibold">
                Detailed information for commits categorized as:{" "}
                {selectedCategory}.
              </DialogDescription>
            </DialogHeader>
            <CommitQualityTable data={filteredData} />
          </DialogContent>
        </Dialog>
        <div className={"mt-4"}>
          <BestPractices
            title={"Write descriptive commit messages"}
            icon={"commit"}
            variant={"success"}
          >
            <ul className="space-y-1 list-disc pl-5">
              <li>
                Write descriptive commit messages that start with a verb in
                present tense, imperative mood (e.g., "Add feature" not "Added
                feature")
              </li>
              <li>
                Each commit should have a single, clear purpose explained in the
                message
              </li>
              <li>
                Write as if giving instructions to the codebase (e.g., "Make
                xyzzy do frotz")
              </li>
              <li>
                Ensure your explanation can be understood without external
                resources
              </li>
              <li>
                Summarize relevant points instead of just linking to external
                discussions
              </li>
              <li>
                Clear commit messages force teams to understand the value each
                change brings
              </li>
              <li>
                If you can't describe the value of a commit, reconsider if the
                change is necessary
              </li>
            </ul>
          </BestPractices>
        </div>
      </CardContent>
    </Card>
  );
}
