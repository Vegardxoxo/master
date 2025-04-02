import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Lock, AlertTriangle, FileWarning, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileData, ReportSectionProps } from "@/app/lib/definitions";

export default function SensitiveFilesSection({
  metrics,
  recommendations,
  setRecommendations,
  include,
}: ReportSectionProps) {
  const sensitiveFiles = metrics.length > 0 ? metrics[0] || [] : [];
  const warningFiles = metrics.length > 1 ? metrics[1] || [] : [];

  if (!include || (!sensitiveFiles?.length && !warningFiles?.length)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {!include
              ? "Sensitive files section is not included in the report."
              : "No sensitive or warning files detected."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Analysis
        </CardTitle>
        <CardDescription>
          Analysis of potentially sensitive and problematic files
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Sensitive Files
              </p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">
                {sensitiveFiles?.length || 0} files
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning Files
              </p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {warningFiles?.length || 0} files
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <Lock className="h-4 w-4 text-red-500 mr-2" />
                Sensitive Files
              </CardTitle>
              <Badge variant="destructive">{sensitiveFiles.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {sensitiveFiles.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <ul className="text-sm space-y-1">
                  {sensitiveFiles.map((file: FileData, index: number) => (
                    <li
                      key={file.id || index}
                      className="text-red-700 dark:text-red-400 truncate pl-2"
                    >
                      {file.path}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sensitive files detected
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Warning Files
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                {warningFiles.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {warningFiles.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <ul className="text-sm space-y-1">
                  {warningFiles.map((file: FileData, index: number) => (
                    <li
                      key={file.id || index}
                      className="text-amber-700 dark:text-amber-400 truncate pl-2"
                    >
                      {file.path}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                No warning files detected
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <label htmlFor="sensitive-files-recommendations">
            Recommendations
          </label>
          <Textarea
            id="sensitive-files-recommendations"
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="min-h-[100px]"
            placeholder="Add your recommendations for handling sensitive files..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
