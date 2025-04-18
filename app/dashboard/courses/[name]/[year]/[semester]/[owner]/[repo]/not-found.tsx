"use client"
import Link from "next/link"
import { FaceFrownIcon } from "@heroicons/react/24/outline"
import { usePathname } from "next/navigation"

export default function NotFound() {
  const pathname = usePathname()

  const pathParts = pathname.split("/")
  const basePath = pathParts.slice(0, -2).join("/")

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-800" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested repository or you don't have access to it.</p>
      <Link
        href={basePath}
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back to Course
      </Link>
    </main>
  )
}
