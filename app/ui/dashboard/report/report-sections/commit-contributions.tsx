"use client"

import { useState } from "react"
import type { ReportSectionProps } from "@/app/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useReport } from "@/app/contexts/report-context"
import { Info, ImageOff } from "lucide-react"
// Add the import for Next.js Image component
import Image from "next/image"

export default function CommitContributions({
  metrics,
  recommendations,
  setRecommendations,
  include,
}: ReportSectionProps) {
  const { addMetricData } = useReport()
  const [includeImageInMarkdown, setIncludeImageInMarkdown] = useState<boolean>(metrics?.includeImage)
  console.log("url CONTRIBUTIONS", metrics)

  // Update the report context when the checkbox changes
  const handleIncludeImageChange = (checked: boolean) => {
    setIncludeImageInMarkdown(checked)
    if (metrics) {
      addMetricData("commitContributions", null, {
        ...metrics,
        includeImage: checked,
      })
    }
  }

  if (!include) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Commit contribution section is not included in the report.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commit Contribution Visualization</CardTitle>
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
                <Label htmlFor="include-image" className="text-sm cursor-pointer flex items-center">
                  Include this image in the markdown report
                </Label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No commit contributions chart available.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a chart from the Commit Contributions page first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {metrics && metrics.contributors && metrics.contributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Contributor
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Additions
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Deletions
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {metrics.contributors.map((contributor: any, index: number) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm">
                        <div>
                          <p>{contributor.name}</p>
                          <p className="text-xs text-muted-foreground">{contributor.email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-green-600">+{contributor.additions}</td>
                      <td className="px-3 py-2 text-sm text-red-600">-{contributor.deletions}</td>
                      <td className="px-3 py-2 text-sm font-medium">{contributor.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="commit-contributions"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="min-h-[120px]"
            placeholder="Add your recommendations about contributor patterns and distribution of work..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            Suggest improvements to contribution patterns, such as better distribution of work or mentoring
            opportunities.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

