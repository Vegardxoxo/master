import { getRepository } from "@/app/lib/database-functions/database-functions";
import { UpdateRepositoryForm } from "@/app/ui/courses/add/update-repo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function Page(props: {
  params: Promise<{
    name: string;
    year: string;
    semester: string;
    id: string;
  }>;
}) {
  const params = await props.params;
  const { name, year, semester, id } = params;
  const { repository } = await getRepository(id);

  if (!repository) {
    notFound();
  }

  // Build URLs for breadcrumb navigation
  const coursesUrl = "/dashboard/courses";
  const specificCourseUrl = `/dashboard/courses/${name}/${year}/${semester}`;
  const repositoriesUrl = `${specificCourseUrl}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumbs */}

        {/* Back button */}
        <Link
          href={repositoriesUrl}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to repositories
        </Link>

 

        {/* Form */}
        <div className="flex justify-center">
          <UpdateRepositoryForm repositoryId={id} repository={repository} />
        </div>
      </div>
    </div>
  );
}