import type { ReportSectionProps } from "@/app/lib/definitions/definitions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DirectCommitsSection({
  metrics,
  include,
}: ReportSectionProps) {
  if (!include || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Direct commits section is not included in the report."
              : "No direct commits data available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedAuthors = metrics[0] ? metrics[0] : [];
  const authorCount = metrics[1] ? metrics[1] : {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Direct Commits to Main Branch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedAuthors.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {sortedAuthors.map((author: string) => (
                  <Badge
                    key={author}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <span>{author}</span>
                    <span className="ml-1 bg-amber-200 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                      {authorCount[author]}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-green-600">
              No direct commits to main branch detected.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
