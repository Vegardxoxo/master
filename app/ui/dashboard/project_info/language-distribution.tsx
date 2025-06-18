"use client";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COLORS } from "@/app/lib/placeholder-data";

export interface LanguageData {
  name: string;
  value: number;
  percentage: number;
}

interface LanguageDistributionProps {
  data: LanguageData[] | undefined;
}

/**
 * Component for displaying a bar chart of the language distribution in a repository.
 */
export default function LanguageDistribution({
  data,
}: LanguageDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            No language data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    formattedPercentage: `${item.percentage.toFixed(1)}%`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, percentage } = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">{name}</p>
          <p>{`${percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Language Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 70, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tickCount={6}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={65}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry, index) => (
                  <LabelList
                    key={`label-${index}`}
                    dataKey="formattedPercentage"
                    position="right"
                    style={{ fill: "#666", fontSize: 12, fontWeight: 500 }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
