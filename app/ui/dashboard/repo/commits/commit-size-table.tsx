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
  console.log(data);
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
            {data?.authorLogin || data?.authorName || data?.authorEmail}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Total Changes</TableCell>
          <TableCell>{data?.totalChanges}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Additions</TableCell>
          <TableCell>{data?.additions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Deletions</TableCell>
          <TableCell>{data?.deletions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Files Changed</TableCell>
          <TableCell>{data?.changedFiles}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
