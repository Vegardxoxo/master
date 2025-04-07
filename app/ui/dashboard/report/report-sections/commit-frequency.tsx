"use client";

import { useState } from "react";
import type { ReportSectionProps } from "@/app/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useReport } from "@/app/contexts/report-context";
import { Info, ImageOff } from "lucide-react";
import Image from "next/image";

export default function CommitFrequency({
  metrics,
  recommendations,
  setRecommendations,
  include,
}: ReportSectionProps) {
  const { addMetricData } = useReport();
  const [includeImageInMarkdown, setIncludeImageInMarkdown] = useState(metrics?.includeImage || false);

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
            Commit frequency section is not included in the report.
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
                    src={metrics.url}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="commit-frequency"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="min-h-[120px]"
            placeholder="Add your recommendations for improving commit frequency patterns..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
