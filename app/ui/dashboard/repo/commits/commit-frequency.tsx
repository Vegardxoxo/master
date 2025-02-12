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
import type { CommitByDate, DayEntry } from "@/app/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommitFrequencyTable from "@/app/ui/dashboard/repo/commits/commit-frequency-table";

export default function CommitFrequency({
  authors,
  data,
  total,
  dates,
}: {
  total: number;
  authors: Record<string, string>;
  data: DayEntry[];
  dates: CommitByDate[];
}) {
  const [selectedAuthors, setSelectedAuthors] = useState(["TOTAL@commits"]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  console.log("data: ", dates);

  const handleClick = (e: any) => {
    if (e?.activeLabel) {
      setSelectedDate(e.activeLabel);
      console.log(selectedDate);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
  };

  const filteredData = useMemo(() => {
    if (!selectedDate) return data;

    return dates.filter((d) => {
      const formattedDate = new Date(d.commitDate).toISOString().split("T")[0];
      const authorEmail = d.authorEmail;

      return (
        formattedDate === selectedDate &&
        (selectedAuthors.includes("TOTAL@commits") ||
          selectedAuthors.includes(authorEmail))
      );
    });
  }, [dates, selectedDate, selectedAuthors, data]); // Added data to dependencies

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
        <ChartContainer config={{}} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height={"100%"}>
            <LineChart data={data} onClick={handleClick}>
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
        </ChartContainer>
      </CardContent>

      {/*Drill-Down*/}
      <Dialog open={Boolean(selectedDate)} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl h-auto max-h-[50vh] overflow-auto w-full">
          <DialogHeader className={"h-fit"}>
            <DialogTitle>Commit Details</DialogTitle>
            <DialogDescription className="font-bold">
              {`Commits on ${selectedDate} by ${
                selectedAuthors.includes("TOTAL@commits")
                  ? "all authors"
                  : selectedAuthors.length > 1
                    ? selectedAuthors.map((email) => authors[email]).join(", ")
                    : authors[selectedAuthors[0]]
              } (${filteredData.length} commit${filteredData.length !== 1 ? "s" : ""})`}
            </DialogDescription>
          </DialogHeader>
          {selectedDate && <CommitFrequencyTable data={filteredData} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
