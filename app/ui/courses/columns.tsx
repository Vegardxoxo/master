"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Payment, repositoryOverview } from "@/app/lib/definitions";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import {
  DeleteRepoButton,
  AddToClipboard,
  ViewProject, UpdateRepository,
} from "@/app/ui/courses/buttons";
import Link from "next/link";

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
        <Link className={"hover:cursor-pointer hover:underline text-blue-600"} href={row.getValue("url")}>
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
            className="text-right" // optional if you still want the label right-aligned
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
      console.log("details", details)
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
