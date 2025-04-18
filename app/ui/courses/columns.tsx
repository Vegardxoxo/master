"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  BranchConnection,
  Commit,
  FileCoverageData,
  LLMResponse,
  Repository,
  repositoryOverview,
} from "@/app/lib/definitions/definitions";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  AddToClipboard,
  DeleteRepoButton,
  UpdateRepository,
  ViewProject,
} from "@/app/ui/courses/buttons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UserSummary } from "@/app/lib/utils/pull-requests-utils";
import {
  getCoverageTextColor,
  getShortFilePath,
} from "@/app/ui/dashboard/project_info/test-coverage/coverage-utils";
import { CoverageProgressBar } from "@/app/ui/dashboard/project_info/test-coverage/coverage-progress-bar";

export const repositoryOverviewColumns: ColumnDef<Repository>[] = [
  {
    accessorKey: "username",
    header: "Repository owner",
  },
  {
    accessorKey: "repoName",
    header: "Repository Name",
    cell: ({ row }) => {
      return (
        <Link
          className={"hover:cursor-pointer hover:underline text-blue-600"}
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.getValue("repoName")}
        </Link>
      )
    },
  },

  {
    accessorKey: "openIssues",
    header: ({ column }) => {
      return (
        <div className={"flex justify-end "}>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-right"
          >
            Open Issues
            <ChevronRight
              className={clsx("ml-auto transition-transform duration-200 -rotate-90", {
                "-rotate-90": column.getIsSorted() === "asc",
                "rotate-90": column.getIsSorted() !== "asc",
              })}
            />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div className="text-right pr-20 font-medium">{row.getValue("openIssues")}</div>
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Updated at
          <ChevronRight
            className={clsx("ml-auto transition-transform duration-200 -rotate-90", {
              "-rotate-90": column.getIsSorted() === "asc",
              "rotate-90": column.getIsSorted() !== "asc",
            })}
          />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Get the date value
      const dateValue = row.getValue("updatedAt")

      // Format the date to remove the GMT part
      const formattedDate = dateValue
        ? new Date(dateValue as string).toDateString() +
          " " +
          new Date(dateValue as string).toTimeString().split(" ")[0]
        : ""

      return <div>{formattedDate}</div>
    },
  },

  {
    accessorKey: "hasReport",
    header: "Report Status",
    cell: ({ row }) => {
      const hasReport = row.getValue("hasReport") as boolean

      return (
        <div className="flex items-center">
          {hasReport ? (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FileText className="w-3.5 h-3.5 mr-1" />
                Generated
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Not Generated
            </span>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const details = row.original
      return (
        <div className="flex justify-end gap-2">
          <ViewProject owner={details.username} repo={details.repoName} databaseId={details.id} />
          <AddToClipboard url={details.url} />
          <DeleteRepoButton id={details.id} />
          <UpdateRepository id={details.id} />
        </div>
      )
    },
  },
]

export const commitsColumns: ColumnDef<Commit>[] = [
  {
    accessorKey: "author",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-primary hover:bg-muted flex items-center"
        >
          <GitCommit className="h-4 w-4 mr-2 text-primary" />
          Author
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const author = row.getValue("author") as string;
      return (
        <div className="flex items-center">
          <GitCommit className="h-4 w-4 text-amber-500 mr-2" />
          <div className="font-medium">{author}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-primary hover:bg-muted"
        >
          Commit Message
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      // Split message at first newline to show just the first line
      const firstLine = message.split("\n")[0];
      return <div className="font-medium">{firstLine}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-primary hover:bg-muted"
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      // Format date as YYYY-MM-DD HH:MM
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      )}`;
      return <div className="text-right font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "url",
    header: "",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      return (
        <div className="flex justify-end">
          <Link
            href={url}
            target="_blank"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Link>
        </div>
      );
    },
  },
];

export const DevelopmentBranchColumns: ColumnDef<BranchConnection>[] = [
  {
    accessorKey: "branchName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1"
        >
          Branch Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const branchName = row.getValue("branchName") as string;
      return (
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{branchName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isLinked",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1"
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const isLinked = row.getValue("isLinked") as boolean;
      return isLinked ? (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Linked
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Not Linked
        </Badge>
      );
    },
  },
  {
    accessorKey: "issueNumber",
    header: "Issue",
    cell: ({ row }) => {
      const isLinked = row.getValue("isLinked") as boolean;
      const issueNumber = row.getValue("issueNumber") as string | null;
      const issueTitle = row.original.issueTitle;
      const url = row.original.url;

      return isLinked && issueNumber ? (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              #{issueNumber}
            </Link>
            {issueTitle && (
              <span className="text-muted-foreground ml-1 text-xs">
                {issueTitle.length > 40
                  ? issueTitle.substring(0, 40) + "..."
                  : issueTitle}
              </span>
            )}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>Not linked</span>
        </div>
      );
    },
  },
];

export const commitMessageClassification: ColumnDef<LLMResponse>[] = [
  {
    accessorKey: "commit_message",
    header: "Commit Message",
    cell: ({ row }) => (
      <Link
        href={row.original.url}
        className="font-medium text-blue-600 underline hover:cursor-pointer"
      >
        {row.original.commit_message}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Category
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      const badgeStyle = {
        Excellent: "bg-green-100 text-green-700 border-green-300",
        Good: "bg-blue-100 text-blue-700 border-blue-300",
        "Needs Improvement": "bg-red-100 text-red-700 border-red-300",
      }[category];

      return (
        <Badge variant="outline" className={badgeStyle}>
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.reason}</span>
    ),
  },
];

export const commmitContributions: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Name
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-gray-800">{row.original.name.split(" ")[0]}</span>
    ),
  },

  {
    accessorKey: "commits",
    header: "Total commits",
    cell: ({ row }) => (
      <p className="text-blue-400 font-bold">{row.original.commits}</p>
    ),
  },
  {
    accessorKey: "additions",
    header: "Additions",
    cell: ({ row }) => (
      <p className="text-green-500">{row.original.additions}</p>
    ),
  },
  {
    accessorKey: "deletions",
    header: "Deletions",
    cell: ({ row }) => <p className="text-red-500">{row.original.deletions}</p>,
  },

  {
    accessorKey: "average_changes",
    header: "Avg. Changes",
    cell: ({ row }) => <p>{row.original.average_changes.toFixed(1)}</p>,
  },
  {
    accessorKey: "average_files_changed",
    header: "Avg. Files Changed",
    cell: ({ row }) => <p>{row.original.average_files_changed.toFixed(1)}</p>,
  },
];

export const pullRequestActivity: ColumnDef<UserSummary>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Member
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-medium mr-2">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "pullRequests",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        <GitPullRequest className="mr-1 h-4 w-4 text-blue-500" />
        Pull Requests
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className="font-semibold text-blue-600">
          {row.original.pullRequests}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "reviews",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        <Eye className="mr-1 h-4 w-4 text-purple-500" />
        Reviews
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className="font-semibold text-purple-600">
          {row.original.reviews}
        </span>
        {row.original.reviews > 0 && (
          <div className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
            {row.original.reviewPercentage}% of total
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "comments",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        <MessageSquare className="mr-1 h-4 w-4 text-green-500" />
        Comments
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className="font-semibold text-green-600">
          {row.original.comments}
        </span>
        {row.original.comments > 0 && (
          <div className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
            {row.original.commentPercentage}% of total
          </div>
        )}
      </div>
    ),
  },
];

export const coverageTableColumns: ColumnDef<FileCoverageData>[] = [
  {
    accessorKey: "filePath",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          File Path
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => {
      const filePath = row.getValue("filePath") as string;
      return (
        <div className="flex items-center">
          <FileCode className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getShortFilePath(filePath)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "statements",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statements
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("statements") as number;
      return (
        <span className={`text-sm font-medium ${getCoverageTextColor(value)}`}>
          {value.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "branches",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Branches
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("branches") as number;
      return (
        <span className={`text-sm font-medium ${getCoverageTextColor(value)}`}>
          {value.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "functions",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Functions
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("functions") as number;
      return (
        <span className={`text-sm font-medium ${getCoverageTextColor(value)}`}>
          {value.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "lines",
    header: ({ column }) => {
      return (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lines
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("lines") as number;
      return (
        <div className="w-32">
          <CoverageProgressBar
            percentage={value}
            label=""
            showPercentage={false}
            height="h-2"
          />
        </div>
      );
    },
  },
];
