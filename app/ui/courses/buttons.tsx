"use client";

import {
  ClipboardIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteCourseInstance,
  deleteRepository,
} from "@/app/lib/server-actions/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useState } from "react";
import {toast, useToast} from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function ViewProject({
  repo,
  owner,
  id,
}: {
  repo: string;
  owner: string;
  id: string;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`${pathname}/${owner}/${repo}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
            <span className="sr-only">View</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent className={"bg-sky-500"}>
          <p>View repository</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DeleteRepoButton({ id }: { id: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteRepository(id);

      if (result.success) {
        toast({
          title: "Repository deleted",
          description: "The repository has been successfully removed.",
          variant: "default",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete repository",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="sr-only">Delete</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className={"bg-sky-500"}>
          <p>Delete repository</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AddToClipboard({ url }: { url: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "Repository URL has been copied to clipboard",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          >
            <ClipboardIcon className="w-5 h-5" />
            <span className="sr-only">Copy URL</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className={"bg-sky-500"}>
          <p>Copy URL to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function UpdateRepository({ id }: { id: string }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`${pathname}/edit/${id}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            <span className="sr-only">Edit</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent className={"bg-sky-500"}>
          <p>Edit repository</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DeleteCourseInstance({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteCourseInstance(id);
      if (result.success) {
        toast({
          title: "Course instance deleted",
          description: "The course instance has been successfully removed.",
          variant: "default",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: `An unexpected error occurred: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className={"w-[200px]"} variant={"destructive"}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete course instance
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            course instance and all associated repositories and data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}