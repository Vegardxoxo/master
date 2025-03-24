import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  GitBranch,
  GitCommit,
  GitMerge,
  Info,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

interface BestPracticesProps {
  title: string;
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "primary";
  icon?: "check" | "branch" | "commit" | "merge" | "info" | "none";
}

export function BestPractices({
  title,
  children,
  variant = "default",
  icon = "none",
}: BestPracticesProps) {
  // Map variant to colors
  const variantStyles = {
    success: "border-l-green-500 bg-green-50/50 dark:bg-green-950/10",
    warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10",
    info: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10",
    primary: "border-l-primary bg-primary/5 dark:bg-primary/10",
    default: "border-l-muted-foreground/30 bg-muted/20",
  };

  // Map icon type to icon component
  const IconComponent =
    icon === "check"
      ? CheckCircle
      : icon === "branch"
        ? GitBranch
        : icon === "commit"
          ? GitCommit
          : icon === "merge"
            ? GitMerge
            : icon === "info"
              ? Info
              : null;

  // Map variant to icon color
  const iconColorClass = {
    success: "text-green-600",
    warning: "text-amber-600",
    info: "text-blue-600",
    primary: "text-primary",
    default: "text-muted-foreground",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 transition-all hover:shadow-md",
        variantStyles[variant],
      )}
    >
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        {IconComponent && (
          <IconComponent className={cn("h-5 w-5", iconColorClass[variant])} />
        )}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
