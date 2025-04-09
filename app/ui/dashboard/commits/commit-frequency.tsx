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
import { CommitByDate, CommitData, DayEntry } from "@/app/lib/definitions/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
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
import CommitFrequencyTable from "@/app/ui/dashboard/commits/commit-frequency-table";
import { BestPractices } from "@/app/ui/dashboard/alerts/best-practices";
import { Download } from "lucide-react";
import { Button } from "@/app/ui/button";
import { useReport } from "@/app/contexts/report-context";
import { uploadChartToServer } from "@/app/ui/chart-utils";
import AuthorMerger, {extractUniqueAuthors} from "@/app/ui/dashboard/author-merger";
import {parseCommitData} from "@/app/lib/utils/commits-utils";

interface CommitFrequencyProps {
  data: CommitData[];
  image_url: string;
}

export default function CommitFrequency({
  data,
  image_url,
}: CommitFrequencyProps) {
  const [hasMerged, setHasMerged] = useState<boolean>(false);
  const [consolidatedData, setConsolidatedData] = useState<CommitData[] | null>(null);
  const [selectedAuthors, setSelectedAuthors] = useState(["TOTAL@commits"]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageURL, setImageURL] = useState<string | undefined>(image_url);
  const { getRepositoryInfo, addMetricData, addImageUrls } = useReport();
  const info = getRepositoryInfo();

  // Add state for processed data
  const [total, setTotal] = useState(0);
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [emailToDisplayName, setEmailToDisplayName] = useState<Record<string, string>>({});
  const [commitByDate, setCommitByDate] = useState<CommitByDate>({});

  // Process the consolidated data
  useEffect(() => {
    if (consolidatedData) {
      const parsedData = parseCommitData(consolidatedData);
      setTotal(parsedData.total);
      setDayEntries(parsedData.dayEntries);
      setEmailToDisplayName(parsedData.emailToDisplayName);
      setCommitByDate(parsedData.commitByDate);
    }
  }, [consolidatedData]);

  // Metrics for report
  const metrics = useMemo(() => {
    return {
      total,
      authors: emailToDisplayName,
      includeImage: !!imageURL,
      url: imageURL,
    };
  }, [total, emailToDisplayName, imageURL]);

  useEffect(() => {
    if (consolidatedData) {
      addMetricData("commitFrequency", consolidatedData, metrics);
      addImageUrls("commitFrequency", [imageURL ? imageURL : ""]);
    }
  }, [imageURL, consolidatedData, metrics, addMetricData, addImageUrls]);

  const handleClick = (e: any) => {
    if (e?.activeLabel) {
      setSelectedDate(e.activeLabel);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
  };

  const filteredData = useMemo(() => {
    if (!selectedDate || !consolidatedData) return [];

    return consolidatedData.filter((d) => {
      const commitDate = d.commit.author.date;
      if (!commitDate) return false;

      const formattedDate = new Date(commitDate).toISOString().split("T")[0];
      const authorEmail = d.commit.author.email;

      return (
        formattedDate === selectedDate &&
        (selectedAuthors.includes("TOTAL@commits") ||
          selectedAuthors.includes(authorEmail))
      );
    });
  }, [consolidatedData, selectedDate, selectedAuthors]);

  const toggleAuthor = (email: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(email) ? prev.filter((a) => a !== email) : [...prev, email],
    );
  };

  const authorEntries = emailToDisplayName ? Object.entries(emailToDisplayName) : [];
  const colors = [
    "hsl(152, 80%, 40%)",
    "hsl(228, 80%, 50%)",
    "hsl(360, 80%, 50%)",
    "hsl(48, 80%, 50%)",
    "hsl(280, 80%, 50%)",
    "hsl(200, 80%, 40%)",
    "hsl(32, 80%, 50%)",
    "hsl(320, 80%, 50%)",
    "hsl(80, 80%, 40%)",
    "hsl(180, 80%, 40%)",
  ];

  return (
    <>
      {!hasMerged ? (
        <AuthorMerger
          data={data}
          onMerge={(mergedData) => {
            setConsolidatedData(mergedData);
            setHasMerged(true);
          }}
        />
      ) : (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  GitHub Commit History
                </CardTitle>
                <CardDescription>
                  Total number of commits: {total}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                uploadChartToServer({
                  chartType: "COMMIT_FREQUENCY",
                  chartRef: chartRef,
                  setIsUploading: setIsUploading,
                  owner: info.owner,
                  repo: info.repo,
                }).then((r) => {
                  if (typeof r === "string") {
                    setImageURL(r);
                  }
                });
              }}
              disabled={isUploading}
            >
              <Download className="mr-2 h-4 w-4" />
              {imageURL ? "Replace chart" : "Upload Chart"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-4">
              {authorEntries.map(([email, displayName], index) => (
                <label
                  key={email}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    id={`author-${email}`}
                    checked={selectedAuthors.includes(email)}
                    onCheckedChange={() => toggleAuthor(email)}
                    className="border-2 border-gray-300"
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        colors[
                          authorEntries.findIndex(([e]) => e === email) %
                            colors.length
                        ],
                    }}
                  >
                    {displayName}
                  </span>
                </label>
              ))}
            </div>
            {/*Chart*/}
            <ChartContainer
              config={{}}
              className="h-[400px] w-full"
              ref={chartRef}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dayEntries}
                  onClick={handleClick}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={true}
                    axisLine={true}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={true}
                    axisLine={true}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "4px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  {selectedAuthors.map((email, index) => (
                    <Line
                      key={email}
                      type="monotone"
                      dataKey={email}
                      name={emailToDisplayName[email] || email}
                      stroke={
                        colors[
                          authorEntries.findIndex(([e]) => e === email) %
                            colors.length
                        ]
                      }
                      strokeWidth={2}
                      dot={{
                        fill: colors[
                          authorEntries.findIndex(([e]) => e === email) %
                            colors.length
                        ],
                        r: 4,
                      }}
                      activeDot={{ r: 8, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className={"mt-4"}>
              <BestPractices
                title={"Make incremental, small changes"}
                icon={"commit"}
                variant={"info"}
              >
                <ul className="space-y-1 list-disc pl-5">
                  <li>
                    Write the smallest amount of code possible to solve a
                    problem
                  </li>
                  <li>
                    Divide updates into small batches that can be easily tested
                    and rolled back if needed
                  </li>
                  <li>
                    Small, frequent commits decrease the likelihood of
                    integration conflicts
                  </li>
                  <li>
                    The longer a branch lives separated from the main branch,
                    the more likely conflicts will arise
                  </li>
                  <li>
                    Incremental changes help team members easily revert if merge
                    conflicts happen
                  </li>
                  <li>
                    Pair small commits with descriptive messages for better
                    documentation
                  </li>
                  <li>
                    Small batches of value allow for rapid testing with end
                    users to validate solutions
                  </li>
                </ul>
              </BestPractices>
            </div>
          </CardContent>

          {/*Drill-down*/}
          <Dialog open={Boolean(selectedDate)} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl h-auto max-h-[80vh] overflow-auto w-full">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">
                  Commit Details
                </DialogTitle>
                <DialogDescription className="text-lg font-semibold">
                  {`Commits on ${selectedDate} by ${
                    selectedAuthors.includes("TOTAL@commits")
                      ? "all authors"
                      : selectedAuthors.length > 1
                        ? selectedAuthors
                            .map((email) => emailToDisplayName[email] || email)
                            .join(", ")
                        : emailToDisplayName[selectedAuthors[0]] || selectedAuthors[0]
                  } (${filteredData.length} commit${filteredData.length !== 1 ? "s" : ""})`}
                </DialogDescription>
              </DialogHeader>
              {selectedDate && <CommitFrequencyTable data={filteredData} />}
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </>
  );
}