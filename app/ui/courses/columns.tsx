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
import { DeleteFromList, AddToClipboard } from "@/app/ui/courses/buttons";

/**
 * Columns are where you define the core of what your table will look like.
 * They define the data that will be displayed, how it will be formatted, sorted and filtered.
 */
export const columns2: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() == "asc")}
        >
          Email
          <ChevronRight
            className={clsx(
              "ml-auto transition-transform duration-200 rotate-90",
              {
                "rotate-90": column.getIsSorted() == "asc",
                "-rotate-90": column.getIsSorted() != "asc",
              },
            )}
          />
        </Button>
      );
    },
  },

  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
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
];

export const columns: ColumnDef<repositoryOverview>[] = [
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
      return (
        <div className="flex justify-end gap-2">
          <AddToClipboard url={details.url} />
          <DeleteFromList id={details.url} />
        </div>
      );
    },
  },
];
