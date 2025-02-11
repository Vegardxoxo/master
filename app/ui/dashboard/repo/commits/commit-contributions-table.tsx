import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommitStats } from "@/app/lib/definitions";
import Link from "next/link";

export default function CommitContributionsTable({ data }: { data: CommitStats }) {
  const isHighAddDelRatio = data.additions_deletions_ratio > 1;
  const isHighAverageChanges = data.average_changes > 50;

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
          <TableCell>Total Changes</TableCell>
          <TableCell>{data.total}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Additions</TableCell>
          <TableCell>{data.additions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Deletions</TableCell>
          <TableCell>{data.deletions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Number of Commits</TableCell>
          <TableCell>{data.commits}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Average Changes per Commit</TableCell>
          <TableCell
            className={`px-4 py-2 ${
              isHighAverageChanges ? "bg-green-100 text-green-700" : ""
            }`}
          >
            {data.average_changes.toFixed(2)}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Additions vs Deletions ratio</TableCell>
          <TableCell
            className={`px-4 py-2 ${
              isHighAddDelRatio
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {data.additions_deletions_ratio.toFixed(2)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Co-authored-lines</TableCell>
          <TableCell>{data.co_authored_lines}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Biggest Commit</TableCell>
          <TableCell>
            <Link
              href={data.biggest_commit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.biggest_commit} changes
            </Link>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
