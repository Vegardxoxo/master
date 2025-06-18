import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getContributors } from "@/app/lib/database-functions/repository-data";

export default async function ContributorsList({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const { contributors } = await getContributors(owner, repo);
  console.log("contributors", contributors);
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {contributors.map((contributor) => (
            <div
              key={contributor.login}
              className="flex items-center space-x-2"
            >
              <Avatar className="h-8 w-8 border-2 border-blue-200">
                <AvatarImage
                  src={`https://github.com/${contributor.login}.png`}
                  alt={contributor.login}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {contributor.login[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link
                href={contributor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 truncate underline"
              >
                {contributor.login}
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
