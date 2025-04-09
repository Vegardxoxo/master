import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface CommitSizeTableProps {
  data?: any;
}

export default function CommitSizeTable({ data }: CommitSizeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className={"font-semibold"}>
        <TableRow>
          <TableCell>Message</TableCell>
          <TableCell>
            <Link
              href={data?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data?.message}
            </Link>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Author</TableCell>
          <TableCell>
            {data?.authorLogin || data?.author.name || data?.author.email}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Total Changes</TableCell>
          <TableCell>{data?.totalChanges}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Additions</TableCell>
          <TableCell className={"bg-green-100 text-green-700"}>{data?.additions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Deletions</TableCell>
          <TableCell className={"bg-red-100 text-red-700"}>{data?.deletions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Files Changed</TableCell>
          <TableCell>{data?.changedFiles}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
