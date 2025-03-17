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
import { getRepository } from "@/app/lib/database-functions";

export function ViewProject({ repo, owner }: { repo: string; owner: string }) {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <Link
      href={`${pathname}/${owner}/${repo}`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <EyeIcon className="w-5" />
    </Link>
  );
}

export function DeleteRepoButton({ id }: { id: string }) {
  const deleteRepo = deleteRepository.bind(null, id);
  return (
    <form action={deleteRepo}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function AddToClipboard({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Delete</span>
      <ClipboardIcon className="w-5" />
    </button>
  );
}

export function UpdateRepository({ id }: { id: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={`${pathname}/edit/${id}`}
      className={"rounded-md border p-2 hover:bg-gray-100"}
    >
      <span className="sr-only">Edit</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

