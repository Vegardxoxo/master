"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import type { CommitEval, LLMResponse } from "@/app/lib/definitions";
import { SetStateAction, useState } from "react";
import CommitQualityTable from "@/app/ui/dashboard/repo/commits/commit-quality-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface ActiveShape {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

export default function CommitQuality({ data }: { data: LLMResponse[] }) {
  if (!data || data.length === 0) {
    return <p>No commit data available.</p>;
  }
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: SetStateAction<number>) => {
    setActiveIndex(index);
  };
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
          outerRadius={outerRadius + 5}
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

  const handlePieClick = (category: string) => {
    setSelectedCategory(category);
    setIsOpen(true);
  };

  const filteredData = selectedCategory
    ? data.filter((commit) => commit.category === selectedCategory)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commit Message Quality</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onClickCapture={(e) => handlePieClick(e.name)}
                data={messageQuality}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={0}
                paddingAngle={2}
                label={({ name, value }) => `${name}: ${value}`}
                onMouseEnter={onPieEnter}
              >
                {messageQuality.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={colorMap[entry.name]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} commits`, name]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex justify-center gap-4 ">
          {messageQuality.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[entry.name] }}
              />
              <span className=" text-sm lg:text-lg font-semibold">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl h-auto max-h-[50vh] overflow-auto w-full">
              <DialogHeader className={"h-fit"}>
                <DialogTitle>Commit Details</DialogTitle>
                <DialogDescription className={"font-bold"}>
                  Detailed information commits categorized as:{" "}
                  {selectedCategory}.
                </DialogDescription>
              </DialogHeader>
              <CommitQualityTable data={filteredData} />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
