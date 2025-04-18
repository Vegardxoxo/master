import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { CommitByDate } from "@/app/lib/definitions/definitions";

interface TableData {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string; // ISO 8601 date string
    };
    message: string;
    url: string;
  };
}

export default function CommitFrequencyTable({
  data,
}: {
  data: TableData[];
}) {
    console.log("CommitByDate", data);
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
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className={"text-xs md:text-sm"}>
              {item.commit.author.name} - {item.commit.author.email}
            </TableCell>
            <TableCell>
              {new Date(item.commit.author.date).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Europe/London",
              })}
            </TableCell>
            <TableCell className="max-w-md truncate">
              <Link
                href={item.html_url || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs md:text-sm"
              >
                {item.commit.message}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
