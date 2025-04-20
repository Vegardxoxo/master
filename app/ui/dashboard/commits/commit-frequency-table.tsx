import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface TableData {
  authorName: string
  authorEmail: string
  committedAt: string
  message: string
  url: string
}

export default function CommitFrequencyTable({ data }: { data: TableData[] }) {
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
                  {item.authorName} - {item.authorEmail}
                </TableCell>
                <TableCell>
                  {new Date(item.committedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Europe/London",
                  })}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  <Link
                      href={item.url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-xs md:text-sm"
                  >
                    {item.message}
                  </Link>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}
