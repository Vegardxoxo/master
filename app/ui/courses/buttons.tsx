"use client";

import {
  EyeIcon,
  ClipboardIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteRepository } from "@/app/lib/server-actions/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ViewProject({ repo, owner }: { repo: string; owner: string }) {
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
  const deleteRepo = deleteRepository.bind(null, id);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <form action={deleteRepo}>
            <button
              type="submit"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              <span className="sr-only">Delete</span>
            </button>
          </form>
        </TooltipTrigger>
        <TooltipContent className={"bg-sky-500"}>
          <p>Delete repository</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AddToClipboard({ url }: { url: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigator.clipboard.writeText(url)}
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
