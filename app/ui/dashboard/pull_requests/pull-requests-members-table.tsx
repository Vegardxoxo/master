import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface PullRequest {
  number: number;
  title: string;
  user: string;
  created_at: string;
  closed_at: string;
  url: string;
}

export default function PullRequestsMembersTable({ data }: { data: any }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Minutes to Close</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((pr: PullRequest) => {
          const createdDate = new Date(pr.created_at);
          const closedDate = pr.closed_at ? new Date(pr.closed_at) : new Date();
          const minutesToClose = Math.round(
            (closedDate.getTime() - createdDate.getTime()) / (1000 * 60),
          );

          return (
            <TableRow key={pr.number}>
              <TableCell>{pr.number}</TableCell>
              <TableCell>
                <Link
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {pr.title}
                </Link>
              </TableCell>
              <TableCell>{pr.user}</TableCell>
              <TableCell>{minutesToClose}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
