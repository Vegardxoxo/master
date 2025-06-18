"use client";

import { useState } from "react";
import type { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useReport } from "@/app/contexts/report-context";
import { ImageOff, Users } from "lucide-react";
import Image from "next/image";

export default function CommitFrequency({
  metrics,
  include,
}: ReportSectionProps) {
  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Commit Frequency section is not included in the report."
              : "Commit Frequency section is not available. Did you generate a chart from the Commit Frequency page?"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { addMetricData } = useReport();
  const [includeImageInMarkdown, setIncludeImageInMarkdown] = useState(
    metrics?.includeImage || false,
  );

  // Update the report context when the checkbox changes
  const handleIncludeImageChange = (checked: boolean) => {
    setIncludeImageInMarkdown(checked);
    if (metrics) {
      addMetricData("commitFrequency", null, {
        ...metrics,
        includeImage: checked,
      });
    }
  };

  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Commit Frequency section is not included in the report."
              : "Commit Frequency section is not available. Did you generate a chart from the Commit Frequency page?"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate author statistics from metrics
  const authorStats = metrics.authorTotals
    ? Object.entries(metrics.authorTotals)
        .filter(([email]) => email !== "TOTAL@commits")
        .map(([email, commits]) => ({
          email,
          name: metrics.authors?.[email] || email,
          commits,
          percentage:
            metrics.total > 0
              ? (((commits as number) / metrics.total) * 100).toFixed(1)
              : "0",
        }))
        .sort((a, b) => (b.commits as number) - (a.commits as number))
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Commit Frequency Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {metrics && metrics.url ? (
            <div className="space-y-4">
              <div className="relative rounded-lg border overflow-hidden bg-muted/20">
                {/* Image container with aspect ratio */}
                <div className="relative aspect-[16/9] w-full h-full">
                  <Image
                    src={metrics.url || "/placeholder.svg"}
                    alt={"Commit Frequency Chart"}
                    height={1200}
                    width={1200}
                  />
                </div>
              </div>

              {/* Include in markdown option */}
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="include-image"
                  checked={includeImageInMarkdown}
                  onCheckedChange={handleIncludeImageChange}
                />
                <Label
                  htmlFor="include-image"
                  className="text-sm cursor-pointer flex items-center"
                >
                  Include this image in the markdown report
                </Label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No commit frequency chart available.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a chart from the Commit Frequency page first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author Statistics Card */}
      {authorStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Author Contribution Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Total commits:{" "}
                <span className="font-medium text-foreground">
                  {metrics.total}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {authorStats.map((author) => (
                  <div
                    key={author.email}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{author.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {author.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{author.commits} commits</div>
                      <div className="text-sm text-muted-foreground">
                        {author.percentage}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {authorStats.length > 1 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
                  <div className="font-medium mb-1">
                    Contribution Distribution
                  </div>
                  <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex">
                    {authorStats.map((author, index) => {
                      const colors = [
                        "bg-green-500",
                        "bg-blue-500",
                        "bg-red-500",
                        "bg-yellow-500",
                        "bg-purple-500",
                        "bg-cyan-500",
                        "bg-orange-500",
                        "bg-pink-500",
                        "bg-lime-500",
                        "bg-teal-500",
                      ];
                      return (
                        <div
                          key={author.email}
                          className={`h-full ${colors[index % colors.length]}`}
                          style={{ width: `${author.percentage}%` }}
                          title={`${author.name}: ${author.percentage}%`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    {authorStats.map((author, index) => {
                      const colors = [
                        "bg-green-500",
                        "bg-blue-500",
                        "bg-red-500",
                        "bg-yellow-500",
                        "bg-purple-500",
                        "bg-cyan-500",
                        "bg-orange-500",
                        "bg-pink-500",
                        "bg-lime-500",
                        "bg-teal-500",
                      ];
                      return (
                        <div key={author.email} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-1 ${colors[index % colors.length]}`}
                          />
                          <span className="text-xs">{author.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
