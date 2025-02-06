"use client";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DayEntry } from "@/app/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FrequencyChart({
  authors,
  data,
  total,
}: {
  total: number;
  authors: Record<string, string>;
  data: DayEntry[];
}) {
  const [selectedAuthors, setSelectedAuthors] = useState(["TOTAL@commits"]);

  const toggleAuthor = (email: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(email) ? prev.filter((a) => a !== email) : [...prev, email],
    );
  };

  const authorEntries = Object.entries(authors);
  return (
    // Header
    <Card>
      <CardHeader className={"flex justify-between"}>
        <CardTitle className="text-lg font-semibold mb-2">
          Commit Frequency
        </CardTitle>
        <CardDescription className="text-lg font-bold mb-2">
          Total number of commits: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/*Checkboxes*/}
        <div className="mb-2">
          {authorEntries.map(([email, displayName]) => (
            <label key={email} className="flex items-center space-x-2 mr-4">
              <Checkbox
                id={`author-${email}`}
                checked={selectedAuthors.includes(email)}
                onCheckedChange={() => toggleAuthor(email)}
              />
              <span>{displayName}</span>
            </label>
          ))}
        </div>

        {/*Chart*/}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedAuthors.map((email, index) => (
              <Line
                key={email}
                type="monotone"
                dataKey={email}
                name={authors[email]}
                stroke={`hsl(${(index * 360) / authorEntries.length}, 70%, 50%)`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
