import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { CommitByDate } from "@/app/lib/definitions";

export default function CommitFrequencyTable({
  data,
}: {
  data: CommitByDate[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="font-semibold text-sm">
        {data.map((commit, index) => (
          <TableRow key={index}>
            <TableCell className={"text-xs md:text-sm"}>
              {commit.authorName} - {commit.authorEmail}
            </TableCell>
            <TableCell>
              {new Date(commit.commitDate).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Europe/London",
              })}
            </TableCell>
            <TableCell className="max-w-md truncate">
              <Link
                href={commit.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs md:text-sm"
              >
                {commit.message}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
