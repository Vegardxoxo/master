"use client"
import {PencilIcon} from "lucide-react";
import Link from 'next/link';
import {usePathname} from "next/navigation";

export function ViewProject({repo, owner}: { repo: string, owner: string }) {
    const pathname = usePathname();
    console.log(pathname);
    return (
        <Link
            href={`${pathname}/${owner}/${repo}/view`}
            className="rounded-md border p-2 hover:bg-gray-100"
        >
            <PencilIcon className="w-5"/>
        </Link>
    );
}


