"use client";

import { ColumnDef } from "@tanstack/react-table";
import {BranchConnection, Commit, repositoryOverview} from "@/app/lib/definitions";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink, GitBranch,
  GitCommit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";
import {
  AddToClipboard,
  DeleteRepoButton,
  UpdateRepository,
  ViewProject,
} from "@/app/ui/courses/buttons";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";

export const repositoryOverviewColumns: ColumnDef<repositoryOverview>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "owner",
    header: "Repository owner",
  },
  {
    accessorKey: "url",
    header: "Url",
    cell: ({ row }) => {
      return (
        <Link
          className={"hover:cursor-pointer hover:underline text-blue-600"}
          href={row.getValue("url")}
        >
          {row.getValue("url")}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Repository Name",
  },

  {
    accessorKey: "contributors",
    header: "Contributors",
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
              className={clsx(
                "ml-auto transition-transform duration-200 -rotate-90",
                {
                  "-rotate-90": column.getIsSorted() === "asc",
                  "rotate-90": column.getIsSorted() !== "asc",
                },
              )}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-right pr-20 font-medium">
          {row.getValue("openIssues")}
        </div>
      );
    },
  },

  {
    accessorKey: "buttons",
    header: "",
    cell: ({ row }) => {
      const details = row.original;
      return (
        <div className="flex justify-end gap-2">
          <ViewProject owner={details.owner} repo={details.name} />
          <AddToClipboard url={details.url} />
          <DeleteRepoButton id={details.databaseId} />
          <UpdateRepository id={details.databaseId} />
        </div>
      );
    },
  },
];

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
      )
    },
    cell: ({ row }) => {
      const author = row.getValue("author") as string
      return (
        <div className="flex items-center">
          <GitCommit className="h-4 w-4 text-amber-500 mr-2" />
          <div className="font-medium">{author}</div>
        </div>
      )
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
      )
    },
    cell: ({ row }) => {
      const message = row.getValue("message") as string
      // Split message at first newline to show just the first line
      const firstLine = message.split("\n")[0]
      return <div className="font-medium">{firstLine}</div>
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
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      // Format date as YYYY-MM-DD HH:MM
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
      return <div className="text-right font-medium">{formattedDate}</div>
    },
  },
  {
    accessorKey: "url",
    header: "",
    cell: ({ row }) => {
      const url = row.getValue("url") as string
      return (
        <div className="flex justify-end">
          <Link href={url} target="_blank" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Link>
        </div>
      )
    },
  },
]

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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Linked
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
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
                    ? issueTitle.substring(0, 40) + '...'
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

