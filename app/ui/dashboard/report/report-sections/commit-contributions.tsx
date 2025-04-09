"use client";

import { useState } from "react";
import type { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useReport } from "@/app/contexts/report-context";
import { Info, ImageOff, FileText, GitCommit } from "lucide-react";
// Add the import for Next.js Image component
import Image from "next/image";
import { GenericDataTable } from "@/app/ui/courses/tables/generic-data-table";
import {
  commitMessageClassification,
  commmitContributions,
} from "@/app/ui/courses/columns";

export default function CommitContributions({
  metrics,
  include,
}: ReportSectionProps) {
  const { addMetricData } = useReport();
  const [includeImageInMarkdown, setIncludeImageInMarkdown] = useState<boolean>(
    metrics?.includeImage,
  );
  console.log("url CONTRIBUTIONS", metrics);

  // Update the report context when the checkbox changes
  const handleIncludeImageChange = (checked: boolean) => {
    setIncludeImageInMarkdown(checked);
    if (metrics) {
      addMetricData("commitContributions", null, {
        ...metrics,
        includeImage: checked,
      });
    }
  };

  if (!include) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Commit contribution section is not included in the report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Commit Contribution Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {metrics && metrics.url ? (
            <div className="space-y-4">
              <div className="relative rounded-lg border overflow-hidden bg-muted/20">
                {/* Image container with aspect ratio */}
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={metrics.url || "/placeholder.svg"}
                    alt="Commit Contributions Chart"
                    fill
                    className="object-contain"
                    priority
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
                No commit contributions chart available.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a chart from the Commit Contributions page first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/*Average file & changes per commit*/}
<div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between">
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 h-16 w-16 -mt-4 -mr-4 bg-slate-100 dark:bg-slate-800 rounded-full opacity-70"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <GitCommit className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-300">
                Group Average Changes per Commit
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">10</p>
              <span className="text-sm text-slate-600 dark:text-slate-400 pb-1">changes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 h-16 w-16 -mt-4 -mr-4 bg-slate-100 dark:bg-slate-800 rounded-full opacity-70"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-300">
                Group Average Files per Commit
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{metrics.average_files_changed}</p>
              <span className="text-sm text-slate-600 dark:text-slate-400 pb-1">files</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      {metrics && metrics.contributors && metrics.contributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <GenericDataTable
              data={metrics.contributors}
              columns={commmitContributions}
            />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
