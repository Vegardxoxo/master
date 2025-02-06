import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { fetchContributors } from "@/app/lib/data";

export default async function ContributorsList({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { contributors } = await fetchContributors(owner, repo);
  return (
    <Card className={"group hover:bg-sky-500 md:w-2/3"}>
      <CardHeader>
        <CardTitle className={"group-hover:text-white"}>Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {contributors.map((contributor) => (
            <div key={contributor} className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://github.com/${contributor}.png`}
                  alt={contributor}
                />
                <AvatarFallback>{contributor[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="ml-2  group-hover:text-white">
                <Link
                  className={"hover:underline"}
                  href={`https://git.ntnu.no/${contributor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contributor}
                </Link>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
